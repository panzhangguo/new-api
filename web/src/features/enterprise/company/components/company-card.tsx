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
  Building2,
  CalendarDays,
  Edit,
  Eye,
  MapPin,
  Phone,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconBadge } from '@/components/ui/icon-badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  COMPANY_SIZE_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  getOptionLabel,
  INDUSTRY_OPTIONS,
} from '../constants'
import type { EnterpriseCompany } from '../lib/company-form'

type InfoRowProps = {
  icon: LucideIcon
  children: ReactNode
}

function InfoRow(props: InfoRowProps) {
  const Icon = props.icon

  return (
    <div className='flex items-start gap-2'>
      <Icon className='mt-0.5 size-3 shrink-0' />
      <span className='min-w-0 text-sm wrap-break-word'>{props.children}</span>
    </div>
  )
}

type CompanyCardProps = {
  company: EnterpriseCompany
  onView: () => void
  onEdit: () => void
}

export function CompanyCard(props: CompanyCardProps) {
  const { t } = useTranslation()
  const company = props.company

  return (
    <Card className='h-full bg-transparent hover:transform-none! hover:shadow-none!'>
      <CardHeader>
        <div className='flex items-start gap-3'>
          <IconBadge size='lg' tone='primary'>
            <Building2 />
          </IconBadge>
          <div className='min-w-0 flex-1 space-y-1.5'>
            <CardTitle className='truncate'>{company.name}</CardTitle>
            <div className='flex flex-wrap gap-1.5'>
              <Badge variant='secondary'>
                {t(getOptionLabel(INDUSTRY_OPTIONS, company.industry))}
              </Badge>
              <Badge variant='outline'>
                {t(getOptionLabel(COMPANY_TYPE_OPTIONS, company.companyType))}
              </Badge>
            </div>
          </div>
          <div className='-ml-1.5 flex items-center gap-1'>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={props.onEdit}
                    aria-label={t('Edit Company')}
                  />
                }
              >
                <Edit className='size-4' />
              </TooltipTrigger>
              <TooltipContent>{t('Edit Company')}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant='ghost'
                    size='icon-sm'
                    onClick={props.onView}
                    aria-label={t('View details')}
                  />
                }
              >
                <Eye className='size-4' />
              </TooltipTrigger>
              <TooltipContent>{t('View details')}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent className='text-muted-foreground flex-1 space-y-2 text-sm'>
        <InfoRow icon={Users}>
          {t(getOptionLabel(COMPANY_SIZE_OPTIONS, company.companySize))}
        </InfoRow>
        <InfoRow icon={CalendarDays}>{company.foundedAt}</InfoRow>
        <InfoRow icon={Phone}>{company.contactPhone}</InfoRow>
        <InfoRow icon={MapPin}>{company.registeredAddress}</InfoRow>
      </CardContent>
    </Card>
  )
}
