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
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  Table,
} from '@tanstack/react-table'

import { useDataTable } from '@/components/data-table'

import { useEmployeeColumns } from '../components/employee-columns'
import type { Employee } from '../types'

// The employee toolbar only exposes a keyword search; keep the column filter
// state stable while still satisfying the shared toolbar contract.
const NO_COLUMN_FILTERS: ColumnFiltersState = []

type EmployeeTableOptions = {
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  totalCount: number
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
}

/**
 * Builds the server-paginated employee table so the page owning the section
 * header can render its bulk actions next to the department title while
 * sharing one table state.
 */
export function useEmployeeTable(
  employees: Employee[],
  options: EmployeeTableOptions
): {
  table: Table<Employee>
  columns: ColumnDef<Employee>[]
} {
  const columns = useEmployeeColumns()

  const { table } = useDataTable({
    data: employees,
    columns,
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
    columnFilters: NO_COLUMN_FILTERS,
    manualPagination: true,
    manualFiltering: true,
    pagination: options.pagination,
    onPaginationChange: options.onPaginationChange,
    totalCount: options.totalCount,
    globalFilter: options.globalFilter,
    onGlobalFilterChange: options.onGlobalFilterChange,
  })

  return { table, columns }
}
