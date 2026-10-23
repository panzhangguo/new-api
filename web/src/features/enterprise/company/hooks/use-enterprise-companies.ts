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
  createUserEnterprise,
  listUserEnterprises,
  updateUserEnterprise,
} from '../api'
import type { CompanyFormValues, EnterpriseCompany } from '../lib/company-form'

const enterprisesQueryKey = ['enterprise', 'list'] as const

export function useEnterpriseCompanies() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const query: UseQueryResult<EnterpriseCompany[]> = useQuery({
    queryKey: enterprisesQueryKey,
    queryFn: async () => {
      const response = await listUserEnterprises()
      if (!response.success) {
        throw createServerError(response, t('Failed to load enterprises'))
      }
      return response.data?.items ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (values: CompanyFormValues) => {
      const response = await createUserEnterprise(values)
      if (!response.success || !response.data) {
        throw createServerError(response, t('Failed to create enterprise'))
      }
      return response.data
    },
    onSuccess: async () => {
      toast.success(t('Enterprise created'))
      await queryClient.invalidateQueries({ queryKey: enterprisesQueryKey })
    },
    onError: (error: Error) => handleServerError(error),
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: number
      values: CompanyFormValues
    }) => {
      const response = await updateUserEnterprise(id, values)
      if (!response.success || !response.data) {
        throw createServerError(response, t('Failed to update enterprise'))
      }
      return response.data
    },
    onSuccess: async () => {
      toast.success(t('Enterprise updated'))
      await queryClient.invalidateQueries({ queryKey: enterprisesQueryKey })
    },
    onError: (error: Error) => handleServerError(error),
  })

  return {
    companies: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createPending: createMutation.isPending,
    updatePending: updateMutation.isPending,
    addCompany: createMutation.mutateAsync,
    updateCompany: (id: number, values: CompanyFormValues) =>
      updateMutation.mutateAsync({ id, values }),
  }
}
