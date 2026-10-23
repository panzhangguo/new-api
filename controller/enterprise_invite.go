/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
package controller

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/i18n"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
)

const invalidInvitationMessage = "Invitation link is invalid or has expired"

type enterpriseInvitation struct {
	InviterId    int
	Enterprise   *model.Enterprise
	Organization *model.Organization
}

// resolveEnterpriseInvitation validates an invitation without requiring a
// session: the affiliate code must belong to the enterprise owner, and the
// organization must belong to that enterprise.
func resolveEnterpriseInvitation(affCode string, enterpriseId, organizationId int) (*enterpriseInvitation, bool) {
	if strings.TrimSpace(affCode) == "" || enterpriseId <= 0 || organizationId <= 0 {
		return nil, false
	}
	inviterId, err := model.GetUserIdByAffCode(strings.TrimSpace(affCode))
	if err != nil || inviterId <= 0 {
		return nil, false
	}
	enterprise, err := model.GetEnterpriseById(enterpriseId)
	if err != nil || enterprise.UserId != inviterId {
		return nil, false
	}
	organization, err := model.GetOrganizationById(enterpriseId, organizationId)
	if err != nil {
		return nil, false
	}
	return &enterpriseInvitation{
		InviterId:    inviterId,
		Enterprise:   enterprise,
		Organization: organization,
	}, true
}

// GetEnterpriseInvitation returns the enterprise and organization names for an
// invitation link so the sign-up page can show where the invitee is joining.
func GetEnterpriseInvitation(c *gin.Context) {
	enterpriseId, err := strconv.Atoi(c.Query("enterprise"))
	if err != nil {
		common.ApiErrorT(c, invalidInvitationMessage)
		return
	}
	organizationId, err := strconv.Atoi(c.Query("organization"))
	if err != nil {
		common.ApiErrorT(c, invalidInvitationMessage)
		return
	}
	invitation, ok := resolveEnterpriseInvitation(c.Query("aff"), enterpriseId, organizationId)
	if !ok {
		common.ApiErrorT(c, invalidInvitationMessage)
		return
	}
	common.ApiSuccess(c, gin.H{
		"enterprise_name":   invitation.Enterprise.Name,
		"organization_name": invitation.Organization.Name,
	})
}

type enterpriseRegisterRequest struct {
	model.User
	EnterpriseId   int `json:"enterprise_id"`
	OrganizationId int `json:"organization_id"`
}

// registerInvitedUser mirrors the regular registration flow for an invited
// employee: it validates the submitted account, creates the user and the
// organization membership in one transaction, then generates the default token.
func registerInvitedUser(c *gin.Context, user *model.User, invitation *enterpriseInvitation) *model.User {
	if !common.RegisterEnabled {
		common.ApiErrorT(c, "New user registration has been disabled by administrator")
		return nil
	}
	if !common.PasswordRegisterEnabled {
		common.ApiErrorT(c, "Password registration has been disabled by administrator, please use third-party account verification")
		return nil
	}
	user.Username = strings.TrimSpace(user.Username)
	user.Email = model.NormalizeEmail(user.Email)
	if user.Username == "" {
		common.ApiErrorT(c, "Invalid parameters")
		return nil
	}
	if err := common.Validate.Struct(user); err != nil {
		common.ApiErrorT(c, "Invalid input {{error}}", map[string]any{"error": err.Error()})
		return nil
	}
	if common.EmailVerificationEnabled {
		if user.Email == "" || user.VerificationCode == "" {
			common.ApiErrorT(c, "Email verification is enabled, please enter email address and verification code")
			return nil
		}
		if !common.VerifyCodeWithKey(user.Email, user.VerificationCode, common.EmailVerificationPurpose) {
			common.ApiErrorT(c, "Verification code is incorrect or has expired")
			return nil
		}
		if err := model.EnsureEmailAvailable(user.Email, 0); err != nil {
			if errors.Is(err, model.ErrEmailAlreadyTaken) {
				common.ApiErrorT(c, "Email address is already in use")
				return nil
			}
			common.ApiErrorT(c, "Database error, please contact the administrator")
			return nil
		}
	}
	emailForExistCheck := ""
	if common.EmailVerificationEnabled {
		emailForExistCheck = user.Email
	}
	exist, err := model.CheckUserExistOrDeleted(user.Username, emailForExistCheck)
	if err != nil {
		common.ApiErrorT(c, "Database error, please contact the administrator")
		common.SysLog(common.LogText("CheckUserExistOrDeleted error: %v", err))
		return nil
	}
	if exist {
		common.ApiErrorT(c, "Username already exists or has been deleted")
		return nil
	}

	cleanUser := model.User{
		Username:    user.Username,
		Password:    user.Password,
		DisplayName: user.Username,
		InviterId:   invitation.InviterId,
		Role:        common.RoleCommonUser,
	}
	if common.EmailVerificationEnabled {
		cleanUser.Email = user.Email
	}
	err = model.DB.Transaction(func(tx *gorm.DB) error {
		if err := cleanUser.InsertWithTx(tx, invitation.InviterId); err != nil {
			return err
		}
		member := model.OrganizationMember{
			UserId:         cleanUser.Id,
			EnterpriseId:   invitation.Enterprise.Id,
			OrganizationId: invitation.Organization.Id,
			CreatedTime:    common.GetTimestamp(),
		}
		return tx.Create(&member).Error
	})
	if err != nil {
		if errors.Is(err, model.ErrEmailAlreadyTaken) {
			common.ApiErrorT(c, "Email address is already in use")
			return nil
		}
		common.ApiError(c, err)
		return nil
	}
	cleanUser.FinishInsert(invitation.InviterId)

	if constant.GenerateDefaultToken {
		key, err := common.GenerateKey()
		if err != nil {
			common.ApiErrorT(c, "Failed to generate default token")
			common.SysLog(common.LogText("failed to generate token key: %s", err.Error()))
			return nil
		}
		token := model.Token{
			UserId:             cleanUser.Id,
			Name:               i18n.T(c, i18n.MsgUserDefaultTokenName, map[string]any{"Username": cleanUser.Username}),
			Key:                key,
			CreatedTime:        common.GetTimestamp(),
			AccessedTime:       common.GetTimestamp(),
			ExpiredTime:        -1,
			RemainQuota:        500000,
			UnlimitedQuota:     true,
			ModelLimitsEnabled: false,
		}
		token.AllowUserQuotaQuery = true
		if setting.DefaultUseAutoGroup {
			token.Group = "auto"
		}
		if err := token.Insert(); err != nil {
			common.ApiErrorT(c, "Failed to create default token")
			return nil
		}
	}

	return &cleanUser
}

// RegisterEnterpriseMember creates an account and links it to the enterprise
// organization carried by the invitation link in one request.
func RegisterEnterpriseMember(c *gin.Context) {
	var request enterpriseRegisterRequest
	if err := common.DecodeJson(c.Request.Body, &request); err != nil {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}

	invitation, ok := resolveEnterpriseInvitation(request.AffCode, request.EnterpriseId, request.OrganizationId)
	if !ok {
		common.ApiErrorT(c, invalidInvitationMessage)
		return
	}

	if registerInvitedUser(c, &request.User, invitation) == nil {
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
}

type enterpriseJoinRequest struct {
	AffCode        string `json:"aff_code"`
	EnterpriseId   int    `json:"enterprise_id"`
	OrganizationId int    `json:"organization_id"`
}

// JoinEnterpriseByInvitation links the signed-in user to the enterprise
// organization carried by an invitation link, so an already registered user
// can join without creating a duplicate account. Joining the same organization
// again is idempotent; joining a second department of the same enterprise is
// rejected because a user belongs to an enterprise at most once.
func JoinEnterpriseByInvitation(c *gin.Context) {
	userId := c.GetInt("id")
	var request enterpriseJoinRequest
	if err := common.DecodeJson(c.Request.Body, &request); err != nil {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}
	invitation, ok := resolveEnterpriseInvitation(request.AffCode, request.EnterpriseId, request.OrganizationId)
	if !ok {
		common.ApiErrorT(c, invalidInvitationMessage)
		return
	}

	member, err := model.GetUserEnterpriseMembership(userId, invitation.Enterprise.Id)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		common.ApiError(c, err)
		return
	}
	if member != nil {
		if member.OrganizationId == invitation.Organization.Id {
			common.ApiSuccess(c, gin.H{"already_joined": true})
			return
		}
		common.ApiErrorT(c, "You have already joined this enterprise")
		return
	}

	newMember := model.OrganizationMember{
		UserId:         userId,
		EnterpriseId:   invitation.Enterprise.Id,
		OrganizationId: invitation.Organization.Id,
		CreatedTime:    common.GetTimestamp(),
	}
	if err := model.DB.Create(&newMember).Error; err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{"already_joined": false})
}

// ListOrganizationMembers returns the employees invited into one organization
// of the caller's enterprise.
func ListOrganizationMembers(c *gin.Context) {
	userId := c.GetInt("id")
	enterpriseId, ok := resolveOrganizationEnterprise(c, userId)
	if !ok {
		return
	}
	organizationId, err := strconv.Atoi(c.Param("orgId"))
	if err != nil || organizationId <= 0 {
		common.ApiErrorT(c, "Invalid ID")
		return
	}
	if _, err := model.GetUserOrganization(userId, enterpriseId, organizationId); err != nil {
		common.ApiErrorT(c, "Organization not found")
		return
	}
	pageInfo := common.GetPageQuery(c)
	members, total, err := model.ListOrganizationMembers(enterpriseId, organizationId, pageInfo.GetPage(), pageInfo.GetPageSize(), c.Query("keyword"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{
		"items":     members,
		"total":     total,
		"page":      pageInfo.GetPage(),
		"page_size": pageInfo.GetPageSize(),
	})
}

type moveMembersRequest struct {
	MemberIds            []int `json:"member_ids"`
	TargetOrganizationId int   `json:"target_organization_id"`
}

// MoveOrganizationMembers moves selected employees to another organization of
// the same enterprise.
func MoveOrganizationMembers(c *gin.Context) {
	userId := c.GetInt("id")
	enterpriseId, ok := resolveOrganizationEnterprise(c, userId)
	if !ok {
		return
	}
	organizationId, err := strconv.Atoi(c.Param("orgId"))
	if err != nil || organizationId <= 0 {
		common.ApiErrorT(c, "Invalid ID")
		return
	}
	if _, err := model.GetUserOrganization(userId, enterpriseId, organizationId); err != nil {
		common.ApiErrorT(c, "Organization not found")
		return
	}

	var request moveMembersRequest
	if err := common.DecodeJson(c.Request.Body, &request); err != nil {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}
	if len(request.MemberIds) == 0 {
		common.ApiErrorT(c, "Please select employees to move")
		return
	}
	if request.TargetOrganizationId <= 0 {
		common.ApiErrorT(c, "Please select a target department")
		return
	}
	if request.TargetOrganizationId == organizationId {
		common.ApiErrorT(c, "Employees are already in this department")
		return
	}
	if _, err := model.GetUserOrganization(userId, enterpriseId, request.TargetOrganizationId); err != nil {
		common.ApiErrorT(c, "Target organization not found")
		return
	}

	moved, err := model.MoveOrganizationMembers(enterpriseId, organizationId, request.TargetOrganizationId, request.MemberIds)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{"moved": moved})
}
