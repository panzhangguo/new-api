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
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/gin-gonic/gin"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

type organizationRequest struct {
	ParentId    int    `json:"parent_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// normalizeOrganizationRequest trims the submitted fields and returns the
// validated record. A non-empty message key identifies the first invalid
// field.
func normalizeOrganizationRequest(request *organizationRequest) (*model.Organization, string) {
	if request.ParentId < 0 {
		return nil, "Invalid parameters"
	}

	name := strings.TrimSpace(request.Name)
	if name == "" {
		return nil, "Please enter the organization name"
	}
	if utf8.RuneCountInString(name) > 100 {
		return nil, "Organization name must be at most 100 characters"
	}

	description := strings.TrimSpace(request.Description)
	if utf8.RuneCountInString(description) > 500 {
		return nil, "Organization description must be at most 500 characters"
	}

	return &model.Organization{
		ParentId:    request.ParentId,
		Name:        name,
		Description: description,
	}, ""
}

// resolveOrganizationEnterprise validates the enterprise path parameter and
// its ownership, writing the error response when it fails.
func resolveOrganizationEnterprise(c *gin.Context, userId int) (int, bool) {
	enterpriseId, err := strconv.Atoi(c.Param("id"))
	if err != nil || enterpriseId <= 0 {
		common.ApiErrorT(c, "Invalid ID")
		return 0, false
	}
	if _, err := model.GetUserEnterprise(userId, enterpriseId); err != nil {
		if errors.Is(err, model.ErrEnterpriseNotFound) {
			common.ApiErrorT(c, "Enterprise not found")
		} else {
			common.ApiError(c, err)
		}
		return 0, false
	}
	return enterpriseId, true
}

// validateOrganizationParent checks that the parent belongs to the same
// enterprise and that the assignment does not create a cycle.
func validateOrganizationParent(userId, enterpriseId, id, parentId int) (string, error) {
	if parentId == 0 {
		return "", nil
	}
	if _, err := model.GetUserOrganization(userId, enterpriseId, parentId); err != nil {
		if errors.Is(err, model.ErrOrganizationNotFound) {
			return "Parent organization not found", nil
		}
		return "", err
	}
	cycle, err := model.OrganizationCreatesCycle(userId, enterpriseId, id, parentId)
	if err != nil {
		return "", err
	}
	if cycle {
		return "Invalid parent organization", nil
	}
	return "", nil
}

func ListUserOrganizations(c *gin.Context) {
	userId := c.GetInt("id")
	enterpriseId, ok := resolveOrganizationEnterprise(c, userId)
	if !ok {
		return
	}
	organizations, err := model.ListUserOrganizations(userId, enterpriseId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{"items": organizations})
}

func CreateUserOrganization(c *gin.Context) {
	userId := c.GetInt("id")
	enterpriseId, ok := resolveOrganizationEnterprise(c, userId)
	if !ok {
		return
	}

	var request organizationRequest
	if err := common.DecodeJson(c.Request.Body, &request); err != nil {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}
	values, messageKey := normalizeOrganizationRequest(&request)
	if messageKey != "" {
		common.ApiErrorT(c, messageKey)
		return
	}

	parentMessage, err := validateOrganizationParent(userId, enterpriseId, 0, values.ParentId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if parentMessage != "" {
		common.ApiErrorT(c, parentMessage)
		return
	}

	exists, err := model.OrganizationNameExists(userId, enterpriseId, values.ParentId, values.Name, 0)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if exists {
		common.ApiErrorT(c, "An organization with this name already exists under the same parent")
		return
	}

	values.UserId = userId
	values.EnterpriseId = enterpriseId
	if err := model.CreateUserOrganization(values); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, values)
}

func UpdateUserOrganization(c *gin.Context) {
	userId := c.GetInt("id")
	enterpriseId, ok := resolveOrganizationEnterprise(c, userId)
	if !ok {
		return
	}
	id, err := strconv.Atoi(c.Param("orgId"))
	if err != nil || id <= 0 {
		common.ApiErrorT(c, "Invalid ID")
		return
	}

	var request organizationRequest
	if err := common.DecodeJson(c.Request.Body, &request); err != nil {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}
	values, messageKey := normalizeOrganizationRequest(&request)
	if messageKey != "" {
		common.ApiErrorT(c, messageKey)
		return
	}

	if _, err := model.GetUserOrganization(userId, enterpriseId, id); err != nil {
		if errors.Is(err, model.ErrOrganizationNotFound) {
			common.ApiErrorT(c, "Organization not found")
		} else {
			common.ApiError(c, err)
		}
		return
	}

	parentMessage, err := validateOrganizationParent(userId, enterpriseId, id, values.ParentId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if parentMessage != "" {
		common.ApiErrorT(c, parentMessage)
		return
	}

	exists, err := model.OrganizationNameExists(userId, enterpriseId, values.ParentId, values.Name, id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if exists {
		common.ApiErrorT(c, "An organization with this name already exists under the same parent")
		return
	}

	organization, err := model.UpdateUserOrganization(userId, enterpriseId, id, values)
	if errors.Is(err, model.ErrOrganizationNotFound) {
		common.ApiErrorT(c, "Organization not found")
		return
	}
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, organization)
}
