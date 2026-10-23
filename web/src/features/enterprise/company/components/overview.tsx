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
import { Building2, Plus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { EmptyState } from '@/components/empty-state'
import { SectionPageLayout } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsAdmin } from '@/hooks/use-admin'

import { useEnterpriseCompanies } from '../hooks/use-enterprise-companies'
import type { CompanyFormValues, EnterpriseCompany } from '../lib/company-form'
import { CompanyCard } from './company-card'
import { CompanyForm } from './company-form'
import { CompanyProfile } from './company-profile'

const COMPANY_FORM_ID = 'enterprise-company-form'

type DialogMode = 'create' | 'view' | 'edit'

function EnterpriseCardSkeleton() {
  return (
    <div className='rounded-lg border p-5'>
      <div className='mb-4 flex items-start gap-3'>
        <Skeleton className='size-10 rounded-md' />
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-3 w-2/3' />
        <Skeleton className='h-3 w-1/2' />
        <Skeleton className='h-3 w-3/5' />
      </div>
    </div>
  )
}

export function EnterpriseOverview() {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const {
    companies,
    isLoading,
    isError,
    refetch,
    createPending,
    updatePending,
    addCompany,
    updateCompany,
  } = useEnterpriseCompanies()
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null)
  const [activeCompany, setActiveCompany] = useState<EnterpriseCompany | null>(
    null
  )

  const openCreate = () => {
    if (createPending || updatePending) return
    setActiveCompany(null)
    setDialogMode('create')
  }

  const openView = (company: EnterpriseCompany) => {
    setActiveCompany(company)
    setDialogMode('view')
  }

  const openEdit = (company: EnterpriseCompany) => {
    setActiveCompany(company)
    setDialogMode('edit')
  }

  const closeDialog = () => {
    if (createPending || updatePending) return
    setDialogMode(null)
  }

  const handleSubmit = async (values: CompanyFormValues) => {
    try {
      if (dialogMode === 'edit' && activeCompany != null) {
        await updateCompany(activeCompany.id, values)
      } else {
        await addCompany(values)
      }
      closeDialog()
    } catch {
      // handleServerError already surfaced the message; keep the dialog open
      // so the user can correct the form without retyping everything.
    }
  }

  const isFormMode = dialogMode === 'create' || dialogMode === 'edit'
  const isDialogPending = createPending || updatePending

  let dialogTitle = ''
  let dialogDescription: string | undefined
  if (dialogMode === 'create') {
    dialogTitle = t('Create your company')
    dialogDescription = t(
      'Set up your company profile to unlock enterprise features.'
    )
  } else if (dialogMode === 'edit') {
    dialogTitle = t('Edit your company')
    dialogDescription = t('Update your company information.')
  } else if (activeCompany != null) {
    dialogTitle = activeCompany.name
  }

  let dialogFooter: ReactNode = null
  if (isFormMode) {
    dialogFooter = (
      <>
        <Button
          variant='outline'
          onClick={closeDialog}
          disabled={isDialogPending}
        >
          {t('Cancel')}
        </Button>
        <Button type='submit' form={COMPANY_FORM_ID} disabled={isDialogPending}>
          {dialogMode === 'edit' ? t('Save Changes') : t('Create Company')}
        </Button>
      </>
    )
  } else {
    dialogFooter = (
      <Button variant='outline' onClick={closeDialog}>
        {t('Close')}
      </Button>
    )
  }

  let dialogBody: ReactNode = null
  if (isFormMode) {
    dialogBody = (
      <CompanyForm
        key={activeCompany?.id ?? 'create'}
        formId={COMPANY_FORM_ID}
        defaultValues={activeCompany ?? undefined}
        onSubmit={handleSubmit}
      />
    )
  } else if (activeCompany != null) {
    dialogBody = <CompanyProfile company={activeCompany} showHeader={false} />
  }

  let content: ReactNode
  if (isLoading) {
    content = (
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {[1, 2, 3].map((n) => (
          <EnterpriseCardSkeleton key={n} />
        ))}
      </div>
    )
  } else if (isError) {
    content = (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Building2 />
          </EmptyMedia>
          <EmptyTitle>{t('Unable to load enterprises')}</EmptyTitle>
          <EmptyDescription>
            {t('Refresh the list and try again.')}
          </EmptyDescription>
        </EmptyHeader>
        <Button variant='outline' onClick={() => refetch()}>
          {t('Retry')}
        </Button>
      </Empty>
    )
  } else if (companies.length === 0) {
    content = (
      <EmptyState
        bordered
        icon={Building2}
        title={t('No companies yet')}
        description={t('Create your first company to get started.')}
        action={
          <Button onClick={openCreate} disabled={createPending || isLoading}>
            <Plus />
            {t('Create Company')}
          </Button>
        }
      />
    )
  } else {
    content = (
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3'>
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onView={() => openView(company)}
            onEdit={() => openEdit(company)}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {t('Company Overview')}
        </SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <Badge variant='outline'>{isAdmin ? t('Admin') : t('User')}</Badge>
          <Button
            size='sm'
            onClick={openCreate}
            disabled={isLoading || createPending}
          >
            <Plus />
            {t('Create Company')}
          </Button>
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          <div className='w-full max-w-5xl pb-6'>{content}</div>
        </SectionPageLayout.Content>
      </SectionPageLayout>

      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
        title={dialogTitle}
        description={dialogDescription}
        contentClassName='sm:max-w-2xl'
        contentHeight='70vh'
        footer={dialogFooter}
      >
        {dialogBody}
      </Dialog>
    </>
  )
}
