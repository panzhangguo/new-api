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
import { api } from '@/lib/api'

import {
  camelToSnake,
  snakeToCamel,
  type ApiResponse,
} from '../lib/api-mapping'
import type {
  EnterpriseOrganization,
  OrganizationFormValues,
} from './lib/organization-form'

function mapOrganization(row: unknown): EnterpriseOrganization {
  return snakeToCamel(row) as EnterpriseOrganization
}

export async function listUserOrganizations(
  enterpriseId: number
): Promise<ApiResponse<{ items: EnterpriseOrganization[] }>> {
  const res = await api.get(
    `/api/user/enterprises/${enterpriseId}/organizations`
  )
  const data = res.data.data
  const mapped = data?.items?.map(mapOrganization) ?? []
  return { ...res.data, data: { items: mapped } }
}

export async function createUserOrganization(
  enterpriseId: number,
  values: OrganizationFormValues
): Promise<ApiResponse<EnterpriseOrganization>> {
  const res = await api.post(
    `/api/user/enterprises/${enterpriseId}/organizations`,
    camelToSnake(values)
  )
  if (res.data.success && res.data.data) {
    return { ...res.data, data: mapOrganization(res.data.data) }
  }
  return res.data as ApiResponse<EnterpriseOrganization>
}

export async function updateUserOrganization(
  enterpriseId: number,
  id: number,
  values: OrganizationFormValues
): Promise<ApiResponse<EnterpriseOrganization>> {
  const res = await api.put(
    `/api/user/enterprises/${enterpriseId}/organizations/${id}`,
    camelToSnake(values)
  )
  if (res.data.success && res.data.data) {
    return { ...res.data, data: mapOrganization(res.data.data) }
  }
  return res.data as ApiResponse<EnterpriseOrganization>
}

export type OrganizationMember = {
  id: number
  userId: number
  username: string
  displayName: string
  email: string
  organizationName: string
  createdTime: number
}

export type OrganizationMemberPage = {
  items: OrganizationMember[]
  total: number
}

export type OrganizationMemberQuery = {
  page: number
  pageSize: number
  keyword?: string
}

export async function listOrganizationMembers(
  enterpriseId: number,
  organizationId: number,
  query: OrganizationMemberQuery
): Promise<ApiResponse<OrganizationMemberPage>> {
  const res = await api.get(
    `/api/user/enterprises/${enterpriseId}/organizations/${organizationId}/members`,
    {
      params: {
        p: query.page,
        page_size: query.pageSize,
        keyword: query.keyword?.trim() || undefined,
      },
    }
  )
  const data = res.data.data
  const mapped = data?.items?.map(
    (row: unknown) => snakeToCamel(row) as OrganizationMember
  )
  return {
    ...res.data,
    data: { items: mapped ?? [], total: data?.total ?? 0 },
  }
}

export async function moveOrganizationMembers(
  enterpriseId: number,
  organizationId: number,
  memberIds: number[],
  targetOrganizationId: number
): Promise<ApiResponse<{ moved: number }>> {
  const res = await api.put(
    `/api/user/enterprises/${enterpriseId}/organizations/${organizationId}/members/move`,
    {
      member_ids: memberIds,
      target_organization_id: targetOrganizationId,
    }
  )
  return res.data
}
