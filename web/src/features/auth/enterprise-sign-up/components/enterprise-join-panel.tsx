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
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getEnterpriseInvitation, joinEnterprise } from '@/features/auth/api'
import {
  hasCompleteInvitationParams,
  readInvitationParams,
} from '@/features/auth/enterprise-sign-up/lib/invitation'
import { handleServerError } from '@/lib/handle-server-error'
import { AuthOperationError } from '@/lib/secure-verification'
import { createServerError } from '@/lib/server-error-message'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

export function EnterpriseJoinPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.auth.user)
  const [isJoining, setIsJoining] = useState(false)

  const params = useMemo(readInvitationParams, [])
  const hasInvitationParams = hasCompleteInvitationParams(params)

  const { data: invitationResponse, isLoading: invitationLoading } = useQuery({
    queryKey: ['enterprise-invitation', params],
    enabled: hasInvitationParams,
    queryFn: () => getEnterpriseInvitation(params),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
  const invitation = invitationResponse?.success
    ? invitationResponse.data
    : undefined

  async function handleJoin() {
    if (!invitation || isJoining) return
    setIsJoining(true)
    try {
      const res = await joinEnterprise({
        aff_code: params.aff,
        enterprise_id: Number(params.enterprise),
        organization_id: Number(params.organization),
      })
      if (res?.success) {
        if (res.data?.already_joined) {
          toast.info(t('You have already joined this organization'))
        } else {
          toast.success(t('You have joined the organization!'))
        }
        await navigate({ to: '/dashboard', replace: true })
      } else {
        handleServerError(
          createServerError(res, t('Failed to join the organization'))
        )
      }
    } catch (error) {
      handleServerError(
        AuthOperationError.from(error, t('Failed to join the organization'))
      )
    } finally {
      setIsJoining(false)
    }
  }

  let invitationCard
  if (invitationLoading) {
    invitationCard = (
      <div className='bg-muted/40 rounded-lg border p-4'>
        <div className='space-y-2'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-5 w-48' />
          <Skeleton className='h-4 w-32' />
        </div>
      </div>
    )
  } else if (invitation) {
    invitationCard = (
      <div className='bg-muted/40 rounded-lg border p-4'>
        <p className='text-muted-foreground text-xs'>{t('You are joining')}</p>
        <p className='mt-1 text-base font-medium'>
          {invitation.enterprise_name}
        </p>
        <p className='text-muted-foreground text-sm'>
          {invitation.organization_name}
        </p>
      </div>
    )
  } else {
    invitationCard = (
      <div className='bg-muted/40 rounded-lg border p-4'>
        <p className='text-destructive text-sm'>
          {t('Invitation link is invalid or has expired')}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', className)} {...props}>
      {invitationCard}

      {user && (
        <p className='text-muted-foreground text-sm'>
          {t('Signed in as {{username}}', { username: user.username })}
        </p>
      )}

      <Button
        type='button'
        className='mt-2 w-full justify-center gap-2'
        disabled={!invitation || isJoining}
        onClick={handleJoin}
      >
        {isJoining ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
        {t('Join organization')}
      </Button>
    </div>
  )
}
