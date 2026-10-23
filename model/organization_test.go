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

func newTestOrganization(userId, enterpriseId, parentId int, name string) Organization {
	return Organization{
		UserId:       userId,
		EnterpriseId: enterpriseId,
		ParentId:     parentId,
		Name:         name,
	}
}

func TestOrganizationUserScopeAndHierarchy(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	originalDB := DB
	t.Cleanup(func() { DB = originalDB })
	DB = db
	require.NoError(t, db.AutoMigrate(&Organization{}))

	root := newTestOrganization(1, 10, 0, "Headquarters")
	require.NoError(t, CreateUserOrganization(&root))
	child := newTestOrganization(1, 10, root.Id, "Engineering")
	require.NoError(t, CreateUserOrganization(&child))
	grandchild := newTestOrganization(1, 10, child.Id, "Platform")
	require.NoError(t, CreateUserOrganization(&grandchild))
	otherEnterprise := newTestOrganization(1, 20, 0, "Headquarters")
	require.NoError(t, CreateUserOrganization(&otherEnterprise))
	otherUser := newTestOrganization(2, 10, 0, "Other User Org")
	require.NoError(t, CreateUserOrganization(&otherUser))

	organizations, err := ListUserOrganizations(1, 10)
	require.NoError(t, err)
	require.Len(t, organizations, 3)
	assert.Equal(t, []int{root.Id, child.Id, grandchild.Id},
		[]int{organizations[0].Id, organizations[1].Id, organizations[2].Id})

	_, err = GetUserOrganization(1, 10, otherEnterprise.Id)
	assert.ErrorIs(t, err, ErrOrganizationNotFound)
	_, err = GetUserOrganization(2, 10, root.Id)
	assert.ErrorIs(t, err, ErrOrganizationNotFound)

	exists, err := OrganizationNameExists(1, 10, 0, "Headquarters", 0)
	require.NoError(t, err)
	assert.True(t, exists)

	exists, err = OrganizationNameExists(1, 10, 0, "Headquarters", root.Id)
	require.NoError(t, err)
	assert.False(t, exists)

	exists, err = OrganizationNameExists(1, 10, root.Id, "Headquarters", 0)
	require.NoError(t, err)
	assert.False(t, exists)

	cycle, err := OrganizationCreatesCycle(1, 10, root.Id, grandchild.Id)
	require.NoError(t, err)
	assert.True(t, cycle)

	cycle, err = OrganizationCreatesCycle(1, 10, grandchild.Id, root.Id)
	require.NoError(t, err)
	assert.False(t, cycle)

	cycle, err = OrganizationCreatesCycle(1, 10, root.Id, root.Id)
	require.NoError(t, err)
	assert.True(t, cycle)

	updated := newTestOrganization(1, 10, root.Id, "Platform Group")
	updated.Description = "Platform engineering group."
	organization, err := UpdateUserOrganization(1, 10, grandchild.Id, &updated)
	require.NoError(t, err)
	assert.Equal(t, "Platform Group", organization.Name)
	assert.Equal(t, root.Id, organization.ParentId)
	assert.Equal(t, "Platform engineering group.", organization.Description)

	_, err = UpdateUserOrganization(2, 10, root.Id, &updated)
	assert.ErrorIs(t, err, ErrOrganizationNotFound)
}

func TestGetUserEnterpriseMembership(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	originalDB := DB
	t.Cleanup(func() { DB = originalDB })
	DB = db
	require.NoError(t, db.AutoMigrate(&OrganizationMember{}))

	member := OrganizationMember{UserId: 1, EnterpriseId: 10, OrganizationId: 100, CreatedTime: 1}
	require.NoError(t, db.Create(&member).Error)
	other := OrganizationMember{UserId: 2, EnterpriseId: 10, OrganizationId: 100, CreatedTime: 2}
	require.NoError(t, db.Create(&other).Error)

	found, err := GetUserEnterpriseMembership(1, 10)
	require.NoError(t, err)
	assert.Equal(t, member.Id, found.Id)
	assert.Equal(t, 100, found.OrganizationId)

	_, err = GetUserEnterpriseMembership(1, 20)
	assert.ErrorIs(t, err, gorm.ErrRecordNotFound)
	_, err = GetUserEnterpriseMembership(3, 10)
	assert.ErrorIs(t, err, gorm.ErrRecordNotFound)
}
