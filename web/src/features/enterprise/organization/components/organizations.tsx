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
import type { PaginationState } from '@tanstack/react-table'
import {
  Building2,
  FolderTree,
  MoveRight,
  Plus,
  UserPlus,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  DataTableBulkActions,
  DataTablePagination,
} from '@/components/data-table'
import { Dialog } from '@/components/dialog'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { SectionPageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import { useEnterpriseCompanies } from '../../company/hooks/use-enterprise-companies'
import { moveOrganizationMembers } from '../api'
import { useEmployeeTable } from '../hooks/use-employee-table'
import { useEnterpriseOrganizations } from '../hooks/use-enterprise-organizations'
import { useOrganizationMembers } from '../hooks/use-organization-members'
import {
  buildOrganizationTree,
  collectOrganizationSubtreeIds,
  type EnterpriseOrganization,
  type OrganizationFormValues,
  type OrganizationTreeNode,
} from '../lib/organization-form'
import type { Employee } from '../types'
import { EmployeeTable } from './employee-table'
import { InviteEnterpriseDrawer } from './invite-enterprise-drawer'
import { MoveMembersDialog } from './move-members-dialog'
import {
  OrganizationForm,
  type OrganizationParentOption,
} from './organization-form'
import { OrganizationTree } from './organization-tree'

const ORGANIZATION_FORM_ID = 'enterprise-organization-form'

type DialogMode = 'create' | 'edit'

function flattenParentOptions(
  nodes: OrganizationTreeNode[],
  depth = 0
): OrganizationParentOption[] {
  return nodes.flatMap((node) => [
    { id: node.id, label: `${'— '.repeat(depth)}${node.name}` },
    ...flattenParentOptions(node.children, depth + 1),
  ])
}

function OrganizationListSkeleton() {
  return (
    <div className='space-y-2 p-2'>
      {[1, 2, 3].map((n) => (
        <Skeleton key={n} className='h-8 w-full' />
      ))}
    </div>
  )
}

export function EnterpriseOrganizations() {
  const { t } = useTranslation()
  const { companies, isLoading: companiesLoading } = useEnterpriseCompanies()
  const [activeCompanyId, setActiveCompanyId] = useState<number>(0)

  useEffect(() => {
    if (activeCompanyId === 0 && companies.length > 0) {
      setActiveCompanyId(companies[0].id)
    }
  }, [companies, activeCompanyId])

  const {
    organizations,
    isLoading: organizationsLoading,
    isError: organizationsError,
    refetch,
    createPending,
    updatePending,
    addOrganization,
    updateOrganization,
  } = useEnterpriseOrganizations(activeCompanyId)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null)
  const [activeOrganization, setActiveOrganization] =
    useState<EnterpriseOrganization | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [moveMemberIds, setMoveMemberIds] = useState<number[]>([])
  const [employeePagination, setEmployeePagination] = useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize: 20,
    }
  )
  const [employeeKeyword, setEmployeeKeyword] = useState('')

  const activeCompany = useMemo(
    () => companies.find((company) => company.id === activeCompanyId) ?? null,
    [companies, activeCompanyId]
  )

  const {
    members,
    total: memberTotal,
    isLoading: membersLoading,
    isFetching: membersFetching,
    isError: membersError,
    refetch: refetchMembers,
  } = useOrganizationMembers(activeCompanyId, selectedId, {
    page: employeePagination.pageIndex + 1,
    pageSize: employeePagination.pageSize,
    keyword: employeeKeyword,
  })

  const employees: Employee[] = useMemo(
    () =>
      members.map((member) => ({
        id: member.id,
        name: member.displayName || member.username,
        position: member.organizationName,
        email: member.email,
        phone: '',
      })),
    [members]
  )

  const { table: employeeTable, columns: employeeColumns } = useEmployeeTable(
    employees,
    {
      pagination: employeePagination,
      onPaginationChange: setEmployeePagination,
      totalCount: memberTotal,
      globalFilter: employeeKeyword,
      onGlobalFilterChange: (value) => {
        const next =
          typeof value === 'function' ? value(employeeKeyword) : value
        setEmployeeKeyword(next)
        setEmployeePagination((prev) =>
          prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
        )
      },
    }
  )

  const selectedMemberIds = employeeTable
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.id)

  // A department switch starts a fresh search and first page.
  useEffect(() => {
    setEmployeeKeyword('')
    setEmployeePagination((prev) =>
      prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
    )
  }, [activeCompanyId, selectedId])

  const handleMoveRequest = (memberIds: number[]) => {
    if (selectedId == null || memberIds.length === 0) return
    setMoveMemberIds(memberIds)
    setMoveOpen(true)
  }

  const handleMoveConfirm = async (targetOrganizationId: number) => {
    if (selectedId == null) return false
    try {
      const response = await moveOrganizationMembers(
        activeCompanyId,
        selectedId,
        moveMemberIds,
        targetOrganizationId
      )
      if (!response.success) {
        toast.error(t('Failed to move employees'))
        return false
      }
      toast.success(t('Employees moved successfully'))
      await refetchMembers()
      return true
    } catch {
      toast.error(t('Failed to move employees'))
      return false
    }
  }

  const tree = useMemo(
    () => buildOrganizationTree(organizations),
    [organizations]
  )
  const selectedOrganization = useMemo(
    () => organizations.find((item) => item.id === selectedId) ?? null,
    [organizations, selectedId]
  )

  const switchCompany = (value: string | null) => {
    if (value === null) return
    setActiveCompanyId(Number(value))
    setSelectedId(null)
  }

  const openCreate = () => {
    if (createPending || updatePending) return
    setActiveOrganization(null)
    setDialogMode('create')
  }

  const openEdit = (node: OrganizationTreeNode) => {
    setActiveOrganization(node)
    setDialogMode('edit')
  }

  const closeDialog = () => {
    if (createPending || updatePending) return
    setDialogMode(null)
  }

  const handleSubmit = async (values: OrganizationFormValues) => {
    try {
      if (dialogMode === 'edit' && activeOrganization != null) {
        await updateOrganization(activeOrganization.id, values)
      } else {
        await addOrganization(values)
      }
      closeDialog()
    } catch {
      // handleServerError already surfaced the message; keep the dialog open
      // so the user can correct the form without retyping everything.
    }
  }

  let parentOptions: OrganizationParentOption[] = []
  if (dialogMode === 'edit' && activeOrganization != null) {
    const excluded = collectOrganizationSubtreeIds(
      organizations,
      activeOrganization.id
    )
    parentOptions = flattenParentOptions(tree).filter(
      (option) => !excluded.has(option.id)
    )
  } else {
    parentOptions = flattenParentOptions(tree)
  }

  const isDialogPending = createPending || updatePending
  const dialogTitle =
    dialogMode === 'edit' ? t('Edit Organization') : t('Create Organization')

  let organizationContent: ReactNode
  if (organizationsLoading) {
    organizationContent = <OrganizationListSkeleton />
  } else if (organizationsError) {
    organizationContent = (
      <ErrorState
        icon={FolderTree}
        title={t('Unable to load organizations')}
        description={t('Refresh the list and try again.')}
        action={
          <Button variant='outline' onClick={() => refetch()}>
            {t('Retry')}
          </Button>
        }
      />
    )
  } else if (organizations.length === 0) {
    organizationContent = (
      <EmptyState
        icon={FolderTree}
        title={t('No organizations yet')}
        description={t('Create the first organization for this company.')}
        action={
          <Button size='sm' onClick={openCreate} disabled={createPending}>
            <Plus />
            {t('Create Organization')}
          </Button>
        }
      />
    )
  } else {
    organizationContent = (
      <div className='p-2'>
        <OrganizationTree
          nodes={tree}
          selectedId={selectedId}
          onSelect={(node) => setSelectedId(node.id)}
          onEdit={openEdit}
        />
      </div>
    )
  }

  let employeeContent: ReactNode
  if (selectedOrganization == null) {
    employeeContent = (
      <EmptyState
        icon={Users}
        title={t('No organization selected')}
        description={t('Select an organization to view its employees.')}
      />
    )
  } else if (membersLoading) {
    employeeContent = (
      <div className='space-y-2 p-3'>
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className='h-9 w-full' />
        ))}
      </div>
    )
  } else if (membersError) {
    employeeContent = (
      <ErrorState
        icon={Users}
        title={t('Unable to load employees')}
        description={t('Refresh the list and try again.')}
        action={
          <Button variant='outline' onClick={() => refetchMembers()}>
            {t('Retry')}
          </Button>
        }
      />
    )
  } else {
    employeeContent = (
      <EmployeeTable
        table={employeeTable}
        columns={employeeColumns}
        isFetching={membersFetching}
      />
    )
  }

  let content: ReactNode
  if (companiesLoading) {
    content = (
      <div className='flex h-full flex-col gap-4 overflow-y-auto lg:flex-row lg:overflow-hidden'>
        <Skeleton className='h-96 w-full lg:h-full lg:w-72' />
        <Skeleton className='h-96 flex-1 lg:h-full' />
      </div>
    )
  } else if (companies.length === 0) {
    content = (
      <div className='flex h-full'>
        <EmptyState
          className='h-full'
          bordered
          icon={Building2}
          title={t('No companies yet')}
          description={t('Create a company before managing organizations.')}
        />
      </div>
    )
  } else {
    content = (
      <div className='flex h-full min-h-0 flex-col gap-4 overflow-y-auto lg:flex-row lg:overflow-hidden'>
        <aside className='bg-card/50 flex w-full flex-col rounded-lg border lg:min-h-0 lg:w-72 lg:shrink-0'>
          <div className='flex items-center gap-2 border-b p-2'>
            <Select
              items={companies.map((company) => ({
                value: String(company.id),
                label: company.name,
              }))}
              onValueChange={switchCompany}
              value={String(
                activeCompanyId > 0 ? activeCompanyId : companies[0].id
              )}
            >
              <SelectTrigger className='min-w-0 flex-1'>
                <SelectValue placeholder={t('Select a company')} />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={String(company.id)}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              type='button'
              variant='outline'
              size='icon'
              aria-label={t('Create Organization')}
              onClick={openCreate}
              disabled={createPending || activeCompanyId === 0}
            >
              <Plus aria-hidden='true' />
            </Button>
          </div>
          <div
            data-slot='organization-list'
            className='min-h-0 flex-1 overflow-y-auto'
          >
            {organizationContent}
          </div>
        </aside>

        <section className='bg-card/50 flex min-h-0 min-w-0 flex-col rounded-lg border lg:flex-1'>
          <div className='flex h-12 items-center justify-between gap-2 border-b px-4 py-2'>
            <h3 className='truncate text-sm font-medium'>
              {selectedOrganization?.name ?? t('Employees')}
            </h3>
            <DataTableBulkActions
              table={employeeTable}
              entityName={t('employee')}
              placement='inline'
            >
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleMoveRequest(selectedMemberIds)}
              >
                <MoveRight className='size-4' />
                {t('Move to department')}
              </Button>
            </DataTableBulkActions>
          </div>
          <div
            data-slot='organization-employees'
            className='flex flex-1 flex-col lg:min-h-0'
          >
            {employeeContent}
          </div>
          {selectedOrganization != null && !membersLoading && !membersError && (
            <div className='shrink-0 basis-12 border-t px-4 py-2'>
              <DataTablePagination table={employeeTable} />
            </div>
          )}
        </section>
      </div>
    )
  }

  return (
    <>
      <SectionPageLayout fixedContent>
        <SectionPageLayout.Title>
          {t('Organization Management')}
        </SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <Button
            onClick={() => setInviteOpen(true)}
            disabled={companiesLoading || activeCompany == null}
          >
            <UserPlus />
            {t('Invite Employees')}
          </Button>
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>{content}</SectionPageLayout.Content>
      </SectionPageLayout>

      <InviteEnterpriseDrawer
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        company={activeCompany}
        organizations={organizations}
        defaultOrganizationId={selectedId}
      />

      <MoveMembersDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        organizations={organizations}
        sourceOrganizationId={selectedId ?? 0}
        memberCount={moveMemberIds.length}
        onConfirm={handleMoveConfirm}
      />

      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        title={dialogTitle}
        contentClassName='sm:max-w-lg'
        footer={
          <>
            <Button
              variant='outline'
              onClick={closeDialog}
              disabled={isDialogPending}
            >
              {t('Cancel')}
            </Button>
            <Button
              type='submit'
              form={ORGANIZATION_FORM_ID}
              disabled={isDialogPending}
            >
              {dialogMode === 'edit'
                ? t('Save Changes')
                : t('Create Organization')}
            </Button>
          </>
        }
      >
        <OrganizationForm
          key={activeOrganization?.id ?? 'create'}
          formId={ORGANIZATION_FORM_ID}
          defaultValues={activeOrganization ?? undefined}
          parentOptions={parentOptions}
          onSubmit={handleSubmit}
        />
      </Dialog>
    </>
  )
}
