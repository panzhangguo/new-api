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
package model

import "strings"

// OrganizationMember links an invited user to one enterprise and one of its
// organizations. A user joins an enterprise at most once; the organization row
// records the department they were invited into.
type OrganizationMember struct {
	Id             int   `json:"id"`
	UserId         int   `json:"user_id" gorm:"index;not null;uniqueIndex:uk_organization_member_user_enterprise,priority:1"`
	EnterpriseId   int   `json:"enterprise_id" gorm:"index;not null;uniqueIndex:uk_organization_member_user_enterprise,priority:2"`
	OrganizationId int   `json:"organization_id" gorm:"index;not null"`
	CreatedTime    int64 `json:"created_time" gorm:"type:bigint"`
}

func (OrganizationMember) TableName() string {
	return "organization_members"
}

// OrganizationMemberDetail is the row shape returned for the employee table.
type OrganizationMemberDetail struct {
	Id               int    `json:"id"`
	UserId           int    `json:"user_id"`
	Username         string `json:"username"`
	DisplayName      string `json:"display_name"`
	Email            string `json:"email"`
	OrganizationName string `json:"organization_name"`
	CreatedTime      int64  `json:"created_time"`
}

// GetUserEnterpriseMembership returns the user's membership in one enterprise.
// gorm.ErrRecordNotFound means the user has not joined the enterprise yet.
func GetUserEnterpriseMembership(userId, enterpriseId int) (*OrganizationMember, error) {
	var member OrganizationMember
	err := DB.Where("user_id = ? AND enterprise_id = ?", userId, enterpriseId).First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

// MoveOrganizationMembers reassigns the given memberships from the source
// organization to the target organization inside the same enterprise. Only
// rows that still belong to the source organization are updated.
func MoveOrganizationMembers(enterpriseId, organizationId, targetOrganizationId int, memberIds []int) (int64, error) {
	result := DB.Model(&OrganizationMember{}).
		Where("enterprise_id = ? AND organization_id = ? AND id IN ?", enterpriseId, organizationId, memberIds).
		Update("organization_id", targetOrganizationId)
	return result.RowsAffected, result.Error
}

// ListOrganizationMembers returns one page of the employees invited into an
// organization, optionally filtered by a keyword, along with the total count.
func ListOrganizationMembers(enterpriseId, organizationId, page, pageSize int, keyword string) ([]OrganizationMemberDetail, int64, error) {
	query := DB.Table("organization_members").
		Joins("JOIN users ON users.id = organization_members.user_id").
		Joins("JOIN organizations ON organizations.id = organization_members.organization_id").
		Where("organization_members.enterprise_id = ? AND organization_members.organization_id = ?", enterpriseId, organizationId)
	if keyword = strings.TrimSpace(keyword); keyword != "" {
		pattern := "%" + strings.ToLower(keyword) + "%"
		query = query.Where(
			"LOWER(users.username) LIKE ? OR LOWER(users.display_name) LIKE ? OR LOWER(users.email) LIKE ?",
			pattern, pattern, pattern,
		)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	members := make([]OrganizationMemberDetail, 0)
	err := query.
		Select("organization_members.id AS id, organization_members.user_id AS user_id, users.username AS username, users.display_name AS display_name, users.email AS email, organizations.name AS organization_name, organization_members.created_time AS created_time").
		Order("organization_members.created_time ASC, organization_members.id ASC").
		Limit(pageSize).
		Offset((page - 1) * pageSize).
		Scan(&members).Error
	return members, total, err
}
