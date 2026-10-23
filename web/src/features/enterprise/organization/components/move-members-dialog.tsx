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
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@/components/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import type { EnterpriseOrganization } from '../lib/organization-form'
import { OrganizationTreeSelect } from './organization-tree-select'

type MoveMembersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizations: EnterpriseOrganization[]
  sourceOrganizationId: number
  memberCount: number
  onConfirm: (targetOrganizationId: number) => Promise<boolean>
}

export function MoveMembersDialog(props: MoveMembersDialogProps) {
  const { t } = useTranslation()
  const [targetOrganizationId, setTargetOrganizationId] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (props.open) {
      setTargetOrganizationId(0)
      setIsSubmitting(false)
    }
  }, [props.open])

  const targetOptions = useMemo(
    () =>
      props.organizations.filter(
        (organization) => organization.id !== props.sourceOrganizationId
      ),
    [props.organizations, props.sourceOrganizationId]
  )

  const canSubmit = targetOrganizationId > 0 && !isSubmitting

  async function handleConfirm() {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      if (await props.onConfirm(targetOrganizationId)) {
        props.onOpenChange(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={props.onOpenChange}
      title={t('Move to department')}
      description={t('Move {{count}} employees to another department.', {
        count: props.memberCount,
      })}
      contentClassName='max-w-md'
      headerClassName='text-left'
      contentHeight='auto'
      bodyClassName='space-y-3'
      footer={
        <>
          <Button
            type='button'
            variant='outline'
            onClick={() => props.onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('Cancel')}
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={!canSubmit}
            className='gap-2'
          >
            {isSubmitting ? <Loader2 className='size-4 animate-spin' /> : null}
            {t('Move')}
          </Button>
        </>
      }
    >
      <div className='space-y-2'>
        <Label>{t('Target department')}</Label>
        <OrganizationTreeSelect
          value={targetOrganizationId}
          onValueChange={setTargetOrganizationId}
          organizations={targetOptions}
          placeholder={t('Select a department')}
        />
        {targetOptions.length === 0 && (
          <p className='text-muted-foreground text-xs'>
            {t('Create another department before moving employees.')}
          </p>
        )}
      </div>
    </Dialog>
  )
}
