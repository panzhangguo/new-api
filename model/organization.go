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

import (
	"errors"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

var (
	ErrOrganizationNotFound      = errors.New("organization not found")
	ErrOrganizationNameExists    = errors.New("organization name already exists")
	ErrOrganizationParentInvalid = errors.New("organization parent is invalid")
)

// Organization is a department-like node owned by one of the user's
// enterprises. ParentId references another organization of the same
// enterprise; a zero ParentId marks a root node. Rows are only visible to
// the enterprise owner.
type Organization struct {
	Id           int    `json:"id"`
	UserId       int    `json:"user_id" gorm:"index;not null"`
	EnterpriseId int    `json:"enterprise_id" gorm:"index;not null;uniqueIndex:uk_organization_enterprise_parent_name,priority:1"`
	ParentId     int    `json:"parent_id" gorm:"not null;default:0;uniqueIndex:uk_organization_enterprise_parent_name,priority:2"`
	Name         string `json:"name" gorm:"type:varchar(100);not null;uniqueIndex:uk_organization_enterprise_parent_name,priority:3"`
	Description  string `json:"description" gorm:"type:varchar(500)"`
	CreatedTime  int64  `json:"created_time" gorm:"type:bigint"`
	UpdatedTime  int64  `json:"updated_time" gorm:"type:bigint"`
}

func (Organization) TableName() string {
	return "organizations"
}

func ListUserOrganizations(userId, enterpriseId int) ([]Organization, error) {
	organizations := make([]Organization, 0)
	err := DB.Where("user_id = ? AND enterprise_id = ?", userId, enterpriseId).
		Order("created_time ASC").
		Order("id ASC").
		Find(&organizations).Error
	return organizations, err
}

func GetUserOrganization(userId, enterpriseId, id int) (*Organization, error) {
	var organization Organization
	err := DB.Where("id = ? AND user_id = ? AND enterprise_id = ?", id, userId, enterpriseId).
		First(&organization).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrOrganizationNotFound
	}
	if err != nil {
		return nil, err
	}
	return &organization, nil
}

// GetOrganizationById looks up an organization inside an enterprise without an
// ownership filter. It is only used by the public invitation flow, which
// validates the enterprise through the inviter's affiliate code.
func GetOrganizationById(enterpriseId, id int) (*Organization, error) {
	var organization Organization
	err := DB.Where("id = ? AND enterprise_id = ?", id, enterpriseId).
		First(&organization).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrOrganizationNotFound
	}
	if err != nil {
		return nil, err
	}
	return &organization, nil
}

// OrganizationNameExists reports whether a sibling node with the same name
// already exists under the given parent. excludeId skips the row being
// updated.
func OrganizationNameExists(userId, enterpriseId, parentId int, name string, excludeId int) (bool, error) {
	query := DB.Model(&Organization{}).
		Where("user_id = ? AND enterprise_id = ? AND parent_id = ? AND name = ?", userId, enterpriseId, parentId, name)
	if excludeId > 0 {
		query = query.Where("id <> ?", excludeId)
	}
	var count int64
	if err := query.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// OrganizationCreatesCycle reports whether assigning parentId to the
// organization would make the parent one of its own descendants.
func OrganizationCreatesCycle(userId, enterpriseId, id, parentId int) (bool, error) {
	if parentId == 0 {
		return false, nil
	}
	if parentId == id {
		return true, nil
	}
	organizations, err := ListUserOrganizations(userId, enterpriseId)
	if err != nil {
		return false, err
	}
	parentById := make(map[int]int, len(organizations))
	for _, organization := range organizations {
		parentById[organization.Id] = organization.ParentId
	}
	for current := parentId; current != 0; {
		if current == id {
			return true, nil
		}
		next, ok := parentById[current]
		if !ok {
			return false, nil
		}
		current = next
	}
	return false, nil
}

func CreateUserOrganization(organization *Organization) error {
	now := common.GetTimestamp()
	organization.CreatedTime = now
	organization.UpdatedTime = now
	return DB.Create(organization).Error
}

func UpdateUserOrganization(userId, enterpriseId, id int, values *Organization) (*Organization, error) {
	organization, err := GetUserOrganization(userId, enterpriseId, id)
	if err != nil {
		return nil, err
	}
	organization.ParentId = values.ParentId
	organization.Name = values.Name
	organization.Description = values.Description
	organization.UpdatedTime = common.GetTimestamp()
	if err := DB.Save(organization).Error; err != nil {
		return nil, err
	}
	return organization, nil
}
