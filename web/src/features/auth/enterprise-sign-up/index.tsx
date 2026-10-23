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
import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useStatus } from '@/hooks/use-status'
import { useAuthStore } from '@/stores/auth-store'

import { AuthLayout } from '../auth-layout'
import { TermsFooter } from '../components/terms-footer'
import { EnterpriseJoinPanel } from './components/enterprise-join-panel'
import { EnterpriseSignUpForm } from './components/enterprise-sign-up-form'
import {
  hasCompleteInvitationParams,
  readInvitationParams,
} from './lib/invitation'

export function EnterpriseSignUp() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const user = useAuthStore((state) => state.auth.user)

  const invitationParams = useMemo(readInvitationParams, [])
  const invitationRedirect = hasCompleteInvitationParams(invitationParams)
    ? `${window.location.pathname}${window.location.search}`
    : undefined

  return (
    <AuthLayout>
      <div className='w-full space-y-8'>
        <div className='space-y-2'>
          <h2 className='text-center text-2xl font-semibold tracking-tight sm:text-left'>
            {t('Join the organization')}
          </h2>
          <p className='text-muted-foreground text-left text-sm sm:text-base'>
            {user
              ? t('Use your existing account to join the invited organization.')
              : t('Create your account to join the invited organization.')}
          </p>
          {!user && (
            <p className='text-muted-foreground text-left text-sm sm:text-base'>
              {t('Already have an account?')}{' '}
              <Link
                to='/sign-in'
                search={
                  invitationRedirect
                    ? { redirect: invitationRedirect }
                    : undefined
                }
                className='hover:text-primary font-medium underline underline-offset-4'
              >
                {t('Sign in')}
              </Link>
              .
            </p>
          )}
        </div>

        {user ? <EnterpriseJoinPanel /> : <EnterpriseSignUpForm />}

        <TermsFooter
          variant='sign-up'
          status={status}
          className='text-center'
        />
      </div>
    </AuthLayout>
  )
}
