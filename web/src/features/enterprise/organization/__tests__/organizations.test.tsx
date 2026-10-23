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
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { EnterpriseOrganizations } from '@/features/enterprise'
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import type { EnterpriseCompany } from '../../company/lib/company-form'
import type { OrganizationMember } from '../api'
import type { EnterpriseOrganization } from '../lib/organization-form'

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api')>()
  return { ...actual, moveOrganizationMembers: vi.fn() }
})
vi.mock('../../company/hooks/use-enterprise-companies', () => ({
  useEnterpriseCompanies: vi.fn(),
}))
vi.mock('../hooks/use-enterprise-organizations', () => ({
  useEnterpriseOrganizations: vi.fn(),
}))
vi.mock('../hooks/use-organization-members', () => ({
  useOrganizationMembers: vi.fn(),
}))

const { moveOrganizationMembers } = await import('../api')
const { useEnterpriseCompanies } =
  await import('../../company/hooks/use-enterprise-companies')
const { useEnterpriseOrganizations } =
  await import('../hooks/use-enterprise-organizations')
const { useOrganizationMembers } =
  await import('../hooks/use-organization-members')

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

const ROOT_ORG: EnterpriseOrganization = {
  id: 10,
  enterpriseId: 1,
  parentId: 0,
  name: 'Headquarters',
  description: '',
}

const CHILD_ORG: EnterpriseOrganization = {
  id: 11,
  enterpriseId: 1,
  parentId: 10,
  name: 'Engineering',
  description: 'Product engineering.',
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

function mockOrganizations(
  organizations: EnterpriseOrganization[],
  isLoading = false
) {
  vi.mocked(useEnterpriseOrganizations).mockReturnValue({
    organizations,
    isLoading,
    isError: false,
    error: null,
    refetch: vi.fn(),
    createPending: false,
    updatePending: false,
    addOrganization: vi.fn(),
    updateOrganization: vi.fn(),
  })
}

function renderPage() {
  useAuthStore.setState({
    auth: {
      ...originalAuth,
      user: { id: 1, username: 'tester', role: ROLE.USER, aff_code: 'AB12' },
    },
  })
  return render(<EnterpriseOrganizations />)
}

beforeEach(() => {
  vi.mocked(useOrganizationMembers).mockReturnValue({
    members: [],
    total: 0,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })
})

afterEach(() => {
  useAuthStore.setState({ auth: originalAuth })
})

test('prompts to create a company when the user has none', () => {
  mockCompanies([])
  mockOrganizations([])
  renderPage()

  expect(screen.getByText('No companies yet')).toBeInTheDocument()
  expect(
    screen.getByText('Create a company before managing organizations.')
  ).toBeInTheDocument()
})

test('renders the organization hierarchy of the selected company', () => {
  mockCompanies([COMPANY])
  mockOrganizations([ROOT_ORG, CHILD_ORG])
  renderPage()

  expect(screen.getByText('Headquarters')).toBeInTheDocument()
  expect(screen.getByText('Engineering')).toBeInTheDocument()
  expect(screen.getByText('No organization selected')).toBeInTheDocument()
})

test('opens the creation dialog from the toolbar icon button', async () => {
  const user = userEvent.setup()
  mockCompanies([COMPANY])
  mockOrganizations([ROOT_ORG])
  renderPage()

  await user.click(screen.getByRole('button', { name: 'Create Organization' }))

  expect(await screen.findByText('Organization Name')).toBeInTheDocument()
  expect(screen.getByLabelText('Organization Name')).toBeInTheDocument()
})

test('opens the invitation drawer with the active company', async () => {
  const user = userEvent.setup()
  mockCompanies([COMPANY])
  mockOrganizations([ROOT_ORG])
  renderPage()

  await user.click(screen.getByRole('button', { name: 'Invite Employees' }))

  expect(await screen.findByDisplayValue('Acme Cloud')).toBeInTheDocument()
  expect(screen.getByDisplayValue('AB12')).toBeInTheDocument()
})

test('shows the empty employee table after selecting an organization', async () => {
  const user = userEvent.setup()
  mockCompanies([COMPANY])
  mockOrganizations([ROOT_ORG, CHILD_ORG])
  renderPage()

  await user.click(screen.getByText('Engineering'))

  expect(screen.getByText('No employees yet')).toBeInTheDocument()
  expect(
    screen.getByPlaceholderText('Filter by name, email or position...')
  ).toBeInTheDocument()
})

test('requests the next employee page from the server', async () => {
  const user = userEvent.setup()
  const members: OrganizationMember[] = Array.from(
    { length: 20 },
    (_, index) => ({
      id: 200 + index,
      userId: 2 + index,
      username: `user${index + 1}`,
      displayName: `Employee ${index + 1}`,
      email: `user${index + 1}@acme.example`,
      organizationName: 'Headquarters',
      createdTime: 0,
    })
  )
  mockCompanies([COMPANY])
  mockOrganizations([ROOT_ORG, CHILD_ORG])
  vi.mocked(useOrganizationMembers).mockReturnValue({
    members,
    total: 21,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })
  renderPage()

  await user.click(await screen.findByRole('button', { name: 'Headquarters' }))

  expect(await screen.findByText('Employee 1')).toBeInTheDocument()
  expect(vi.mocked(useOrganizationMembers)).toHaveBeenLastCalledWith(
    1,
    10,
    expect.objectContaining({ page: 1 })
  )

  await user.click(screen.getByRole('button', { name: 'Go to next page' }))

  await waitFor(() =>
    expect(vi.mocked(useOrganizationMembers)).toHaveBeenLastCalledWith(
      1,
      10,
      expect.objectContaining({ page: 2 })
    )
  )
})

test('opens the edit dialog from a tree node action', async () => {
  const user = userEvent.setup()
  mockCompanies([COMPANY])
  mockOrganizations([ROOT_ORG, CHILD_ORG])
  renderPage()

  await user.click(
    screen.getAllByRole('button', { name: 'Edit organization' })[0]
  )

  expect(await screen.findByText('Edit Organization')).toBeInTheDocument()
  expect(screen.getByLabelText('Organization Name')).toHaveValue('Headquarters')
})

test('moves the selected employee to another department', async () => {
  const user = userEvent.setup()
  const members: OrganizationMember[] = [
    {
      id: 101,
      userId: 2,
      username: 'alice',
      displayName: 'Alice',
      email: 'alice@acme.example',
      organizationName: 'Headquarters',
      createdTime: 0,
    },
  ]
  mockCompanies([COMPANY])
  mockOrganizations([ROOT_ORG, CHILD_ORG])
  vi.mocked(useOrganizationMembers).mockReturnValue({
    members,
    total: members.length,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  })
  vi.mocked(moveOrganizationMembers).mockResolvedValue({
    success: true,
    message: '',
    data: { moved: 1 },
  })
  renderPage()

  await user.click(screen.getByRole('button', { name: 'Headquarters' }))
  const checkboxes = await screen.findAllByRole('checkbox')
  await user.click(checkboxes[1])

  await user.click(
    await screen.findByRole('button', { name: 'Move to department' })
  )

  const dialog = await screen.findByRole('dialog')
  await user.click(within(dialog).getByRole('combobox'))
  await user.click(await screen.findByRole('option', { name: 'Engineering' }))
  await user.click(within(dialog).getByRole('button', { name: 'Move' }))

  await waitFor(() =>
    expect(moveOrganizationMembers).toHaveBeenCalledWith(1, 10, [101], 11)
  )
})

test('keeps both panels filling the page height with independent scrolling', () => {
  mockCompanies([COMPANY])
  mockOrganizations([])
  const { container } = renderPage()

  const list = container.querySelector(
    '[data-slot="organization-list"]'
  ) as HTMLElement
  const employees = container.querySelector(
    '[data-slot="organization-employees"]'
  ) as HTMLElement

  expect(list.className).toContain('min-h-0')
  expect(list.className).toContain('flex-1')
  expect(list.className).toContain('overflow-y-auto')
  expect(employees.className).toContain('flex-1')
  expect(employees.className).toContain('lg:min-h-0')
})
