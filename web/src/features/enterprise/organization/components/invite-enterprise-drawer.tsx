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
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import {
  SideDrawerSection,
  SideDrawerSectionHeader,
  sideDrawerContentClassName,
  sideDrawerFooterClassName,
  sideDrawerFormClassName,
  sideDrawerHeaderClassName,
} from '@/components/drawer-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAuthStore } from '@/stores/auth-store'

import type { EnterpriseCompany } from '../../company/lib/company-form'
import type { EnterpriseOrganization } from '../lib/organization-form'
import { OrganizationTreeSelect } from './organization-tree-select'

type InviteEnterpriseDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: EnterpriseCompany | null
  organizations: EnterpriseOrganization[]
  defaultOrganizationId?: number | null
}

export function InviteEnterpriseDrawer(props: InviteEnterpriseDrawerProps) {
  const { t } = useTranslation()
  const affCode = useAuthStore((state) => state.auth.user?.aff_code) ?? ''
  const [organizationId, setOrganizationId] = useState(0)

  useEffect(() => {
    if (props.open) {
      setOrganizationId(props.defaultOrganizationId ?? 0)
    }
  }, [props.open, props.defaultOrganizationId])

  const departmentOptions = props.organizations

  const inviteLink = useMemo(() => {
    if (!props.company || organizationId <= 0 || !affCode) return ''
    const params = new URLSearchParams({
      aff: affCode,
      enterprise: String(props.company.id),
      organization: String(organizationId),
    })
    return `${window.location.origin}/join?${params.toString()}`
  }, [affCode, props.company, organizationId])

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent className={sideDrawerContentClassName('sm:max-w-[560px]')}>
        <SheetHeader className={sideDrawerHeaderClassName()}>
          <SheetTitle>{t('Invite Employees')}</SheetTitle>
          <SheetDescription>
            {t(
              'Invite employees to join this company by sharing the link below.'
            )}
          </SheetDescription>
        </SheetHeader>

        <div className={sideDrawerFormClassName()}>
          <SideDrawerSection>
            <SideDrawerSectionHeader
              title={t('Company')}
              description={t('The company the invited employee will join.')}
            />
            <Input value={props.company?.name ?? ''} readOnly disabled />
          </SideDrawerSection>

          <SideDrawerSection>
            <SideDrawerSectionHeader
              title={t('Department')}
              description={t(
                'Select the department the invited employee will be added to.'
              )}
            />
            <OrganizationTreeSelect
              value={organizationId}
              onValueChange={setOrganizationId}
              organizations={departmentOptions}
              placeholder={t('Select a department')}
              disabled={departmentOptions.length === 0}
            />
            {departmentOptions.length === 0 && (
              <p className='text-muted-foreground text-xs'>
                {t('Create an organization before inviting employees.')}
              </p>
            )}
          </SideDrawerSection>

          <SideDrawerSection>
            <SideDrawerSectionHeader
              title={t('Invitation Code')}
              description={t(
                'The invitation code identifies you as the inviter.'
              )}
            />
            <div className='flex items-center gap-2'>
              <Input
                className='font-mono'
                value={affCode || '-'}
                readOnly
                disabled
              />
              {affCode && (
                <CopyButton
                  value={affCode}
                  variant='outline'
                  tooltip={t('Copy invitation code')}
                />
              )}
            </div>
          </SideDrawerSection>

          <SideDrawerSection>
            <SideDrawerSectionHeader
              title={t('Invitation Link')}
              description={t(
                'The invited employee opens this link to sign up and joins the selected department automatically.'
              )}
            />
            <Label className='sr-only' htmlFor='enterprise-invitation-link'>
              {t('Invitation Link')}
            </Label>
            <div className='flex items-center gap-2'>
              <Input
                id='enterprise-invitation-link'
                className='font-mono text-xs'
                value={
                  inviteLink ||
                  t('Select a company and department to generate the link.')
                }
                readOnly
                disabled={!inviteLink}
              />
              {inviteLink && (
                <CopyButton
                  value={inviteLink}
                  variant='outline'
                  tooltip={t('Copy invitation link')}
                />
              )}
            </div>
          </SideDrawerSection>
        </div>

        <SheetFooter className={sideDrawerFooterClassName()}>
          <SheetClose render={<Button variant='outline' />}>
            {t('Close')}
          </SheetClose>
          {inviteLink && (
            <CopyButton
              value={inviteLink}
              variant='default'
              size='default'
              tooltip={t('Copy invitation link')}
            >
              {t('Copy Link')}
            </CopyButton>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
