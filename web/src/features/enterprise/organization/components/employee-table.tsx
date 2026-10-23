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
import type { ColumnDef, Table } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { DataTablePage } from '@/components/data-table'

import type { Employee } from '../types'

type EmployeeTableProps = {
  table: Table<Employee>
  columns: ColumnDef<Employee>[]
  isFetching?: boolean
}

export function EmployeeTable(props: EmployeeTableProps) {
  const { t } = useTranslation()

  return (
    <DataTablePage
      table={props.table}
      columns={props.columns}
      isFetching={props.isFetching}
      className='min-h-0 flex-1 p-2'
      emptyTitle={t('No employees yet')}
      emptyDescription={t(
        'Employees assigned to this organization will appear here.'
      )}
      skeletonKeyPrefix='employees-skeleton'
      showPagination={false}
      toolbarProps={{
        searchPlaceholder: t('Filter by name, email or position...'),
        searchDebounceMs: 500,
      }}
    />
  )
}
