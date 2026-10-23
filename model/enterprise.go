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
	ErrEnterpriseNotFound         = errors.New("enterprise not found")
	ErrEnterpriseCreditCodeExists = errors.New("enterprise credit code already exists")
)

// Enterprise is a company profile owned by a user. A user may own several
// enterprises; rows are only visible to their owner.
type Enterprise struct {
	Id                  int    `json:"id"`
	UserId              int    `json:"user_id" gorm:"index;not null;uniqueIndex:uk_enterprise_user_credit,priority:1"`
	Name                string `json:"name" gorm:"type:varchar(100);not null"`
	CreditCode          string `json:"credit_code" gorm:"type:varchar(18);not null;uniqueIndex:uk_enterprise_user_credit,priority:2"`
	CompanyType         string `json:"company_type" gorm:"type:varchar(32);not null"`
	Industry            string `json:"industry" gorm:"type:varchar(32);not null"`
	CompanySize         string `json:"company_size" gorm:"type:varchar(16);not null"`
	FoundedAt           string `json:"founded_at" gorm:"type:varchar(10);not null"`
	LegalRepresentative string `json:"legal_representative" gorm:"type:varchar(50);not null"`
	RegisteredAddress   string `json:"registered_address" gorm:"type:varchar(255);not null"`
	OfficeAddress       string `json:"office_address" gorm:"type:varchar(255)"`
	ContactName         string `json:"contact_name" gorm:"type:varchar(100);not null"`
	ContactPhone        string `json:"contact_phone" gorm:"type:varchar(32);not null"`
	ContactEmail        string `json:"contact_email" gorm:"type:varchar(255);not null"`
	Website             string `json:"website" gorm:"type:varchar(255)"`
	Description         string `json:"description" gorm:"type:varchar(500)"`
	CreatedTime         int64  `json:"created_time" gorm:"type:bigint"`
	UpdatedTime         int64  `json:"updated_time" gorm:"type:bigint"`
}

func (Enterprise) TableName() string {
	return "enterprises"
}

func ListUserEnterprises(userId int) ([]Enterprise, error) {
	enterprises := make([]Enterprise, 0)
	err := DB.Where("user_id = ?", userId).
		Order("created_time DESC").
		Order("id DESC").
		Find(&enterprises).Error
	return enterprises, err
}

func GetUserEnterprise(userId, id int) (*Enterprise, error) {
	var enterprise Enterprise
	err := DB.Where("id = ? AND user_id = ?", id, userId).First(&enterprise).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrEnterpriseNotFound
	}
	if err != nil {
		return nil, err
	}
	return &enterprise, nil
}

// GetEnterpriseById looks up an enterprise without an ownership filter. It is
// only used by the public invitation flow, which validates ownership through
// the inviter's affiliate code instead.
func GetEnterpriseById(id int) (*Enterprise, error) {
	var enterprise Enterprise
	err := DB.Where("id = ?", id).First(&enterprise).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrEnterpriseNotFound
	}
	if err != nil {
		return nil, err
	}
	return &enterprise, nil
}

// EnterpriseCreditCodeExists reports whether the owner already registered the
// same credit code. excludeId skips the row being updated.
func EnterpriseCreditCodeExists(userId int, creditCode string, excludeId int) (bool, error) {
	query := DB.Model(&Enterprise{}).Where("user_id = ? AND credit_code = ?", userId, creditCode)
	if excludeId > 0 {
		query = query.Where("id <> ?", excludeId)
	}
	var count int64
	if err := query.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func CreateUserEnterprise(enterprise *Enterprise) error {
	now := common.GetTimestamp()
	enterprise.CreatedTime = now
	enterprise.UpdatedTime = now
	return DB.Create(enterprise).Error
}

func UpdateUserEnterprise(userId, id int, values *Enterprise) (*Enterprise, error) {
	enterprise, err := GetUserEnterprise(userId, id)
	if err != nil {
		return nil, err
	}
	enterprise.Name = values.Name
	enterprise.CreditCode = values.CreditCode
	enterprise.CompanyType = values.CompanyType
	enterprise.Industry = values.Industry
	enterprise.CompanySize = values.CompanySize
	enterprise.FoundedAt = values.FoundedAt
	enterprise.LegalRepresentative = values.LegalRepresentative
	enterprise.RegisteredAddress = values.RegisteredAddress
	enterprise.OfficeAddress = values.OfficeAddress
	enterprise.ContactName = values.ContactName
	enterprise.ContactPhone = values.ContactPhone
	enterprise.ContactEmail = values.ContactEmail
	enterprise.Website = values.Website
	enterprise.Description = values.Description
	enterprise.UpdatedTime = common.GetTimestamp()
	if err := DB.Save(enterprise).Error; err != nil {
		return nil, err
	}
	return enterprise, nil
}
