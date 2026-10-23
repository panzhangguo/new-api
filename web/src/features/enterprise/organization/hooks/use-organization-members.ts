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
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { createServerError } from '@/lib/server-error-message'

import {
  listOrganizationMembers,
  type OrganizationMemberPage,
  type OrganizationMemberQuery,
} from '../api'

const membersQueryKey = (enterpriseId: number, organizationId: number) =>
  ['enterprise', 'organization-members', enterpriseId, organizationId] as const

export function useOrganizationMembers(
  enterpriseId: number,
  organizationId: number | null,
  query: OrganizationMemberQuery
) {
  const { t } = useTranslation()
  const enabled = enterpriseId > 0 && (organizationId ?? 0) > 0

  const result: UseQueryResult<OrganizationMemberPage> = useQuery({
    queryKey: [
      ...membersQueryKey(enterpriseId, organizationId ?? 0),
      query.page,
      query.pageSize,
      query.keyword ?? '',
    ],
    enabled,
    // Keep the previous page visible while the next one is being fetched.
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      const response = await listOrganizationMembers(
        enterpriseId,
        organizationId ?? 0,
        query
      )
      if (!response.success) {
        throw createServerError(response, t('Failed to load employees'))
      }
      return {
        items: response.data?.items ?? [],
        total: response.data?.total ?? 0,
      }
    },
  })

  // Keep the fallback array referentially stable: the table treats any new
  // data reference as a data change, which would reset pagination.
  const members = useMemo(() => result.data?.items ?? [], [result.data])

  return {
    members,
    total: result.data?.total ?? 0,
    isLoading: enabled && (result.isLoading || result.isPending),
    isFetching: result.isFetching,
    isError: result.isError,
    refetch: result.refetch,
  }
}
