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
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/gin-gonic/gin"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
)

type enterpriseRequest struct {
	Name                string `json:"name"`
	CreditCode          string `json:"credit_code"`
	CompanyType         string `json:"company_type"`
	Industry            string `json:"industry"`
	CompanySize         string `json:"company_size"`
	FoundedAt           string `json:"founded_at"`
	LegalRepresentative string `json:"legal_representative"`
	RegisteredAddress   string `json:"registered_address"`
	OfficeAddress       string `json:"office_address"`
	ContactName         string `json:"contact_name"`
	ContactPhone        string `json:"contact_phone"`
	ContactEmail        string `json:"contact_email"`
	Website             string `json:"website"`
	Description         string `json:"description"`
}

var (
	enterpriseCreditCodePattern = regexp.MustCompile(`^[0-9A-HJ-NPQRTUWXY]{18}$`)
	enterprisePhonePattern      = regexp.MustCompile(`^\+?[0-9\s()-]{6,20}$`)
	enterpriseEmailPattern      = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)
	enterpriseWebsitePattern    = regexp.MustCompile(`^https?://[^\s]+$`)

	enterpriseCompanyTypes = []string{
		"limited_liability",
		"joint_stock",
		"partnership",
		"sole_proprietorship",
		"individual_business",
		"other",
	}
	enterpriseIndustries = []string{
		"internet_software",
		"artificial_intelligence",
		"finance",
		"education",
		"healthcare",
		"manufacturing",
		"retail_ecommerce",
		"business_services",
		"media_entertainment",
		"other",
	}
	enterpriseCompanySizes = []string{
		"1-10",
		"11-50",
		"51-200",
		"201-500",
		"501-1000",
		"1000+",
	}
)

// normalizeEnterpriseRequest trims the submitted fields and returns the
// validated record. A non-empty message key identifies the first invalid field.
func normalizeEnterpriseRequest(request *enterpriseRequest) (*model.Enterprise, string) {
	name := strings.TrimSpace(request.Name)
	if name == "" {
		return nil, "Please enter your company name"
	}
	if utf8.RuneCountInString(name) > 100 {
		return nil, "Company name must be at most 100 characters"
	}

	creditCode := strings.ToUpper(strings.TrimSpace(request.CreditCode))
	if creditCode == "" {
		return nil, "Please enter the unified social credit code"
	}
	if !enterpriseCreditCodePattern.MatchString(creditCode) {
		return nil, "Enter an 18-character unified social credit code"
	}

	companyType := strings.TrimSpace(request.CompanyType)
	if companyType == "" {
		return nil, "Please select a company type"
	}
	if !slices.Contains(enterpriseCompanyTypes, companyType) {
		return nil, "Invalid parameters"
	}

	industry := strings.TrimSpace(request.Industry)
	if industry == "" {
		return nil, "Please select an industry"
	}
	if !slices.Contains(enterpriseIndustries, industry) {
		return nil, "Invalid parameters"
	}

	companySize := strings.TrimSpace(request.CompanySize)
	if companySize == "" {
		return nil, "Please select a company size"
	}
	if !slices.Contains(enterpriseCompanySizes, companySize) {
		return nil, "Invalid parameters"
	}

	foundedAt := strings.TrimSpace(request.FoundedAt)
	if foundedAt == "" {
		return nil, "Please select the founded date"
	}
	if _, err := time.Parse("2006-01-02", foundedAt); err != nil {
		return nil, "Invalid parameters"
	}

	legalRepresentative := strings.TrimSpace(request.LegalRepresentative)
	if legalRepresentative == "" {
		return nil, "Please enter the legal representative"
	}
	if utf8.RuneCountInString(legalRepresentative) > 50 {
		return nil, "Invalid parameters"
	}

	registeredAddress := strings.TrimSpace(request.RegisteredAddress)
	if registeredAddress == "" {
		return nil, "Please enter the registered address"
	}
	if utf8.RuneCountInString(registeredAddress) > 255 {
		return nil, "Invalid parameters"
	}

	officeAddress := strings.TrimSpace(request.OfficeAddress)
	if utf8.RuneCountInString(officeAddress) > 255 {
		return nil, "Invalid parameters"
	}

	contactName := strings.TrimSpace(request.ContactName)
	if contactName == "" {
		return nil, "Please enter the contact name"
	}
	if utf8.RuneCountInString(contactName) > 100 {
		return nil, "Invalid parameters"
	}

	contactPhone := strings.TrimSpace(request.ContactPhone)
	if contactPhone == "" {
		return nil, "Please enter the contact phone number"
	}
	if !enterprisePhonePattern.MatchString(contactPhone) {
		return nil, "Enter a valid phone number"
	}

	contactEmail := strings.TrimSpace(request.ContactEmail)
	if contactEmail == "" {
		return nil, "Please enter the contact email"
	}
	if len(contactEmail) > 255 || !enterpriseEmailPattern.MatchString(contactEmail) {
		return nil, "Please enter a valid email address"
	}

	website := strings.TrimSpace(request.Website)
	if website != "" && (len(website) > 255 || !enterpriseWebsitePattern.MatchString(website)) {
		return nil, "Enter a valid website URL (starting with http:// or https://)"
	}

	description := strings.TrimSpace(request.Description)
	if utf8.RuneCountInString(description) > 500 {
		return nil, "Company description must be at most 500 characters"
	}

	return &model.Enterprise{
		Name:                name,
		CreditCode:          creditCode,
		CompanyType:         companyType,
		Industry:            industry,
		CompanySize:         companySize,
		FoundedAt:           foundedAt,
		LegalRepresentative: legalRepresentative,
		RegisteredAddress:   registeredAddress,
		OfficeAddress:       officeAddress,
		ContactName:         contactName,
		ContactPhone:        contactPhone,
		ContactEmail:        contactEmail,
		Website:             website,
		Description:         description,
	}, ""
}

func ListUserEnterprises(c *gin.Context) {
	userId := c.GetInt("id")
	enterprises, err := model.ListUserEnterprises(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{"items": enterprises})
}

func CreateUserEnterprise(c *gin.Context) {
	var request enterpriseRequest
	if err := common.DecodeJson(c.Request.Body, &request); err != nil {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}
	values, messageKey := normalizeEnterpriseRequest(&request)
	if messageKey != "" {
		common.ApiErrorT(c, messageKey)
		return
	}

	userId := c.GetInt("id")
	exists, err := model.EnterpriseCreditCodeExists(userId, values.CreditCode, 0)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if exists {
		common.ApiErrorT(c, "An enterprise with this unified social credit code already exists")
		return
	}
	values.UserId = userId
	if err := model.CreateUserEnterprise(values); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, values)
}

func UpdateUserEnterprise(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil || id <= 0 {
		common.ApiErrorT(c, "Invalid ID")
		return
	}

	var request enterpriseRequest
	if err := common.DecodeJson(c.Request.Body, &request); err != nil {
		common.ApiErrorT(c, "Invalid parameters")
		return
	}
	values, messageKey := normalizeEnterpriseRequest(&request)
	if messageKey != "" {
		common.ApiErrorT(c, messageKey)
		return
	}

	userId := c.GetInt("id")
	exists, err := model.EnterpriseCreditCodeExists(userId, values.CreditCode, id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if exists {
		common.ApiErrorT(c, "An enterprise with this unified social credit code already exists")
		return
	}

	enterprise, err := model.UpdateUserEnterprise(userId, id, values)
	if errors.Is(err, model.ErrEnterpriseNotFound) {
		common.ApiErrorT(c, "Enterprise not found")
		return
	}
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, enterprise)
}
