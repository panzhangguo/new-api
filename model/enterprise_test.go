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
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func newTestEnterprise(userId int, name, creditCode string) Enterprise {
	return Enterprise{
		UserId:              userId,
		Name:                name,
		CreditCode:          creditCode,
		CompanyType:         "limited_liability",
		Industry:            "internet_software",
		CompanySize:         "51-200",
		FoundedAt:           "2020-01-02",
		LegalRepresentative: "Legal Representative",
		RegisteredAddress:   "Registered Address",
		ContactName:         "Contact Name",
		ContactPhone:        "+86 21 5555 0100",
		ContactEmail:        "contact@example.com",
	}
}

func TestEnterpriseUserScopeAndCreditCodeUniqueness(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	originalDB := DB
	t.Cleanup(func() { DB = originalDB })
	DB = db
	require.NoError(t, db.AutoMigrate(&Enterprise{}))

	first := newTestEnterprise(1, "First Enterprise", "91310000MA1K12345X")
	require.NoError(t, CreateUserEnterprise(&first))
	second := newTestEnterprise(1, "Second Enterprise", "91110108MA01C6789Y")
	require.NoError(t, CreateUserEnterprise(&second))
	other := newTestEnterprise(2, "Other Enterprise", "91310000MA1K12345X")
	require.NoError(t, CreateUserEnterprise(&other))

	enterprises, err := ListUserEnterprises(1)
	require.NoError(t, err)
	require.Len(t, enterprises, 2)
	assert.Equal(t, []int{second.Id, first.Id}, []int{enterprises[0].Id, enterprises[1].Id})

	_, err = GetUserEnterprise(1, other.Id)
	assert.ErrorIs(t, err, ErrEnterpriseNotFound)

	exists, err := EnterpriseCreditCodeExists(1, first.CreditCode, 0)
	require.NoError(t, err)
	assert.True(t, exists)

	exists, err = EnterpriseCreditCodeExists(1, first.CreditCode, first.Id)
	require.NoError(t, err)
	assert.False(t, exists)

	exists, err = EnterpriseCreditCodeExists(2, first.CreditCode, 0)
	require.NoError(t, err)
	assert.True(t, exists)

	updated := newTestEnterprise(1, "Renamed Enterprise", "91310000MA1K12345X")
	updated.Website = "https://example.com"
	enterprise, err := UpdateUserEnterprise(1, first.Id, &updated)
	require.NoError(t, err)
	assert.Equal(t, "Renamed Enterprise", enterprise.Name)
	assert.Equal(t, first.UserId, enterprise.UserId)
	assert.Equal(t, "https://example.com", enterprise.Website)

	_, err = UpdateUserEnterprise(1, other.Id, &updated)
	assert.ErrorIs(t, err, ErrEnterpriseNotFound)
}
