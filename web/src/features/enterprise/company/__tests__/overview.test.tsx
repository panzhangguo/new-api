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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { EnterpriseOverview } from '@/features/enterprise'
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import type { EnterpriseCompany } from '../lib/company-form'

vi.mock('../hooks/use-enterprise-companies', () => ({
  useEnterpriseCompanies: vi.fn(),
}))

const { useEnterpriseCompanies } =
  await import('../hooks/use-enterprise-companies')

const originalAuth = useAuthStore.getState().auth

const COMPANY: EnterpriseCompany = {
  id: 1,
  name: 'Acme Cloud',
  creditCode: '91310000MA1K12345X',
  companyType: 'limited_liability',
  industry: 'internet_software',
  companySize: '11-50',
  foundedAt: '2020-01-15',
  legalRepresentative: 'Ada Lovelace',
  registeredAddress: 'Shanghai',
  officeAddress: '',
  contactName: 'Grace Hopper',
  contactPhone: '+86 21 5555 0100',
  contactEmail: 'grace@acme.example',
  website: 'https://acme.example',
  description: 'Cloud infrastructure.',
}

function mockCompanies(companies: EnterpriseCompany[], isLoading = false) {
  vi.mocked(useEnterpriseCompanies).mockReturnValue({
    companies,
    isLoading,
    isError: false,
    error: null,
    refetch: vi.fn(),
    createPending: false,
    updatePending: false,
    addCompany: vi.fn(),
    updateCompany: vi.fn(),
  })
}

function renderAs(role: number) {
  useAuthStore.setState({
    auth: {
      ...originalAuth,
      user: { id: 1, username: 'tester', role },
    },
  })
  return render(<EnterpriseOverview />)
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  useAuthStore.setState({ auth: originalAuth })
})

test('shows an empty state when the user has no companies', () => {
  mockCompanies([])
  renderAs(ROLE.USER)

  expect(screen.getByText('No companies yet')).toBeInTheDocument()
  expect(
    screen.getAllByRole('button', { name: 'Create Company' })
  ).not.toHaveLength(0)
})

test('opens the company creation form from the top action', async () => {
  const user = userEvent.setup()
  mockCompanies([])
  renderAs(ROLE.USER)

  await user.click(screen.getAllByRole('button', { name: 'Create Company' })[0])

  expect(await screen.findByText('Create your company')).toBeInTheDocument()
  expect(screen.getByLabelText('Company Name')).toBeInTheDocument()
})

test('renders every stored company as a card', () => {
  mockCompanies([COMPANY, { ...COMPANY, id: 2, name: 'Globex Labs' }])

  renderAs(ROLE.USER)

  expect(screen.getByText('Acme Cloud')).toBeInTheDocument()
  expect(screen.getByText('Globex Labs')).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'View details' })).toHaveLength(
    2
  )
})

test('opens the company profile from a card', async () => {
  const user = userEvent.setup()
  mockCompanies([COMPANY])
  renderAs(ROLE.USER)

  await user.click(screen.getByRole('button', { name: 'View details' }))

  expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
  expect(
    screen.getAllByRole('button', { name: 'Close' }).length
  ).toBeGreaterThan(0)
})
