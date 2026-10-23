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
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { handleServerError } from '@/lib/handle-server-error'
import { createServerError } from '@/lib/server-error-message'

import {
  createUserOrganization,
  listUserOrganizations,
  updateUserOrganization,
} from '../api'
import type {
  EnterpriseOrganization,
  OrganizationFormValues,
} from '../lib/organization-form'

const organizationsQueryKey = (enterpriseId: number) =>
  ['enterprise', 'organizations', enterpriseId] as const

export function useEnterpriseOrganizations(enterpriseId: number) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const query: UseQueryResult<EnterpriseOrganization[]> = useQuery({
    queryKey: organizationsQueryKey(enterpriseId),
    enabled: enterpriseId > 0,
    queryFn: async () => {
      const response = await listUserOrganizations(enterpriseId)
      if (!response.success) {
        throw createServerError(response, t('Failed to load organizations'))
      }
      return response.data?.items ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (values: OrganizationFormValues) => {
      const response = await createUserOrganization(enterpriseId, values)
      if (!response.success || !response.data) {
        throw createServerError(response, t('Failed to create organization'))
      }
      return response.data
    },
    onSuccess: async () => {
      toast.success(t('Organization created'))
      await queryClient.invalidateQueries({
        queryKey: organizationsQueryKey(enterpriseId),
      })
    },
    onError: (error: Error) => handleServerError(error),
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number
      values: OrganizationFormValues
    }) => {
      const response = await updateUserOrganization(enterpriseId, id, values)
      if (!response.success || !response.data) {
        throw createServerError(response, t('Failed to update organization'))
      }
      return response.data
    },
    onSuccess: async () => {
      toast.success(t('Organization updated'))
      await queryClient.invalidateQueries({
        queryKey: organizationsQueryKey(enterpriseId),
      })
    },
    onError: (error: Error) => handleServerError(error),
  })

  return {
    organizations: query.data ?? [],
    isLoading: enterpriseId > 0 && query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createPending: createMutation.isPending,
    updatePending: updateMutation.isPending,
    addOrganization: createMutation.mutateAsync,
    updateOrganization: (id: number, values: OrganizationFormValues) =>
      updateMutation.mutateAsync({ id, values }),
  }
}
