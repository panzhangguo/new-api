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
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { LongText } from '@/components/long-text'
import { Checkbox } from '@/components/ui/checkbox'

import type { Employee } from '../types'

export function useEmployeeColumns(): ColumnDef<Employee>[] {
  const { t } = useTranslation()

  return useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label={t('Select all')}
            className='translate-y-[2px]'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t('Select row')}
            className='translate-y-[2px]'
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      {
        accessorKey: 'name',
        header: t('Name'),
        cell: ({ row }) => (
          <LongText className='max-w-[200px] text-sm font-medium'>
            {row.getValue('name') as string}
          </LongText>
        ),
        size: 180,
      },
      {
        accessorKey: 'position',
        header: t('Position'),
        cell: ({ row }) => (
          <LongText className='text-muted-foreground max-w-[160px] text-sm'>
            {(row.getValue('position') as string) || '-'}
          </LongText>
        ),
        size: 160,
      },
      {
        accessorKey: 'email',
        header: t('Email'),
        cell: ({ row }) => (
          <LongText className='max-w-[220px] text-sm'>
            {(row.getValue('email') as string) || '-'}
          </LongText>
        ),
        size: 220,
      },
      {
        accessorKey: 'phone',
        header: t('Phone'),
        cell: ({ row }) => (
          <span className='text-sm whitespace-nowrap'>
            {(row.getValue('phone') as string) || '-'}
          </span>
        ),
        size: 140,
      },
    ],
    [t]
  )
}
