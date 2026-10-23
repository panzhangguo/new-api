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
import { Building2, FileText, Info, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { IconBadge } from '@/components/ui/icon-badge'
import { TitledCard } from '@/components/ui/titled-card'

import {
  COMPANY_SIZE_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  getOptionLabel,
  INDUSTRY_OPTIONS,
} from '../constants'
import type { CompanyFormValues } from '../lib/company-form'

type DetailItemProps = {
  label: string
  children: ReactNode
}

function DetailItem(props: DetailItemProps) {
  return (
    <div className='space-y-1'>
      <dt className='text-muted-foreground text-xs'>{props.label}</dt>
      <dd className='text-sm wrap-break-word'>{props.children}</dd>
    </div>
  )
}

type CompanyProfileProps = {
  company: CompanyFormValues
  showHeader?: boolean
}

export function CompanyProfile(props: CompanyProfileProps) {
  const { t } = useTranslation()
  const company = props.company

  return (
    <div className='space-y-4'>
      {props.showHeader !== false && (
        <Card>
          <CardContent className='flex items-center gap-4 p-4 sm:p-5'>
            <IconBadge size='lg' tone='primary'>
              <Building2 />
            </IconBadge>
            <div className='min-w-0 space-y-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='truncate text-lg font-semibold'>
                  {company.name}
                </h2>
                <Badge variant='secondary'>
                  {t(getOptionLabel(INDUSTRY_OPTIONS, company.industry))}
                </Badge>
                <Badge variant='outline'>
                  {t(getOptionLabel(COMPANY_TYPE_OPTIONS, company.companyType))}
                </Badge>
              </div>
              <p className='text-muted-foreground text-sm'>
                {t(getOptionLabel(COMPANY_SIZE_OPTIONS, company.companySize))}
                {' · '}
                {t('Founded Date')}: {company.foundedAt}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className='grid gap-4 lg:grid-cols-2'>
        <TitledCard
          title={t('Basic Information')}
          icon={<Building2 />}
          disableHoverEffect
        >
          <dl className='grid gap-4 sm:grid-cols-2'>
            <DetailItem label={t('Unified Social Credit Code')}>
              {company.creditCode}
            </DetailItem>
            <DetailItem label={t('Company Type')}>
              {t(getOptionLabel(COMPANY_TYPE_OPTIONS, company.companyType))}
            </DetailItem>
            <DetailItem label={t('Industry')}>
              {t(getOptionLabel(INDUSTRY_OPTIONS, company.industry))}
            </DetailItem>
            <DetailItem label={t('Company Size')}>
              {t(getOptionLabel(COMPANY_SIZE_OPTIONS, company.companySize))}
            </DetailItem>
            <DetailItem label={t('Founded Date')}>
              {company.foundedAt}
            </DetailItem>
          </dl>
        </TitledCard>

        <TitledCard
          title={t('Registration Information')}
          icon={<FileText />}
          disableHoverEffect
        >
          <dl className='grid gap-4 sm:grid-cols-2'>
            <DetailItem label={t('Legal Representative')}>
              {company.legalRepresentative}
            </DetailItem>
            <DetailItem label={t('Registered Address')}>
              {company.registeredAddress}
            </DetailItem>
            <DetailItem label={t('Office Address (optional)')}>
              {company.officeAddress || t('Not provided')}
            </DetailItem>
          </dl>
        </TitledCard>

        <TitledCard
          title={t('Contact Information')}
          icon={<Phone />}
          disableHoverEffect
          className='lg:col-span-2'
        >
          <dl className='grid gap-4 sm:grid-cols-2'>
            <DetailItem label={t('Contact Name')}>
              {company.contactName}
            </DetailItem>
            <DetailItem label={t('Contact Phone')}>
              {company.contactPhone}
            </DetailItem>
            <DetailItem label={t('Contact Email')}>
              {company.contactEmail}
            </DetailItem>
            <DetailItem label={t('Website (optional)')}>
              {company.website ? (
                <a
                  href={company.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  {company.website}
                </a>
              ) : (
                t('Not provided')
              )}
            </DetailItem>
          </dl>
        </TitledCard>
        <TitledCard
          title={t('About the Company')}
          icon={<Info />}
          disableHoverEffect
          className='lg:col-span-2'
        >
          <p className='text-sm break-words whitespace-pre-wrap'>
            {company.description || t('Not provided')}
          </p>
        </TitledCard>
      </div>
    </div>
  )
}
