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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import { EnterpriseJoinPanel } from '../components/enterprise-join-panel'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}))
vi.mock('@/features/auth/api', () => ({
  getEnterpriseInvitation: vi.fn(),
  joinEnterprise: vi.fn(),
}))

const { getEnterpriseInvitation, joinEnterprise } =
  await import('@/features/auth/api')
const { toast } = await import('sonner')

const originalAuth = useAuthStore.getState().auth

function renderPanel() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> })
  const joinRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/join',
    component: () => <EnterpriseJoinPanel />,
  })
  const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: () => null,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([joinRoute, dashboardRoute]),
    history: createMemoryHistory({ initialEntries: ['/join'] }),
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return router
}

beforeEach(() => {
  vi.clearAllMocks()
  window.history.replaceState(
    null,
    '',
    '/join?aff=AB12&enterprise=1&organization=10'
  )
  useAuthStore.setState({
    auth: {
      ...originalAuth,
      user: { id: 2, username: 'tester', role: ROLE.USER, aff_code: 'CD34' },
    },
  })
})

afterEach(() => {
  cleanup()
  useAuthStore.setState({ auth: originalAuth })
  window.history.replaceState(null, '', '/')
})

test('shows the invited company and department for a signed-in user', async () => {
  vi.mocked(getEnterpriseInvitation).mockResolvedValue({
    success: true,
    message: '',
    data: { enterprise_name: 'Acme Cloud', organization_name: 'Engineering' },
  })
  renderPanel()

  expect(await screen.findByText(/Signed in as tester/)).toBeInTheDocument()
  expect(await screen.findByText('Acme Cloud')).toBeInTheDocument()
  expect(screen.getByText('Engineering')).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Join organization' })
  ).toBeEnabled()
})

test('joins with the existing account and goes to the dashboard', async () => {
  const user = userEvent.setup()
  vi.mocked(getEnterpriseInvitation).mockResolvedValue({
    success: true,
    message: '',
    data: { enterprise_name: 'Acme Cloud', organization_name: 'Engineering' },
  })
  vi.mocked(joinEnterprise).mockResolvedValue({
    success: true,
    message: '',
    data: { already_joined: false },
  })
  const router = renderPanel()

  await user.click(
    await screen.findByRole('button', { name: 'Join organization' })
  )

  await waitFor(() =>
    expect(vi.mocked(joinEnterprise)).toHaveBeenCalledWith({
      aff_code: 'AB12',
      enterprise_id: 1,
      organization_id: 10,
    })
  )
  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
  expect(vi.mocked(toast.success)).toHaveBeenCalledWith(
    'You have joined the organization!'
  )
})

test('reports an already joined invitation without joining again', async () => {
  const user = userEvent.setup()
  vi.mocked(getEnterpriseInvitation).mockResolvedValue({
    success: true,
    message: '',
    data: { enterprise_name: 'Acme Cloud', organization_name: 'Engineering' },
  })
  vi.mocked(joinEnterprise).mockResolvedValue({
    success: true,
    message: '',
    data: { already_joined: true },
  })
  const router = renderPanel()

  await user.click(
    await screen.findByRole('button', { name: 'Join organization' })
  )

  expect(vi.mocked(toast.info)).toHaveBeenCalledWith(
    'You have already joined this organization'
  )
  await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
})
