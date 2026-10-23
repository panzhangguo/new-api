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
import { expect, test, vi } from 'vitest'

import { OrganizationTree } from '../components/organization-tree'
import type { OrganizationTreeNode } from '../lib/organization-form'

function node(
  id: number,
  name: string,
  parentId: number,
  children: OrganizationTreeNode[] = []
): OrganizationTreeNode {
  return {
    id,
    name,
    parentId,
    enterpriseId: 1,
    description: '',
    children,
  }
}

const TREE: OrganizationTreeNode[] = [
  node(1, 'Headquarters', 0, [
    node(2, 'Engineering', 1, [node(3, 'Platform', 2)]),
    node(4, 'Sales', 1),
  ]),
]

function renderTree() {
  return render(
    <OrganizationTree
      nodes={TREE}
      selectedId={null}
      onSelect={vi.fn()}
      onEdit={vi.fn()}
    />
  )
}

test('collapses a node and hides its descendants', async () => {
  const user = userEvent.setup()
  renderTree()

  expect(screen.getByText('Engineering')).toBeInTheDocument()
  await user.click(screen.getAllByRole('button', { name: 'Collapse' })[0])

  expect(screen.queryByText('Engineering')).not.toBeInTheDocument()
  expect(screen.queryByText('Sales')).not.toBeInTheDocument()
  expect(screen.getByText('Headquarters')).toBeInTheDocument()
})

test('expands a collapsed node again', async () => {
  const user = userEvent.setup()
  renderTree()

  await user.click(screen.getAllByRole('button', { name: 'Collapse' })[0])
  const expandButton = screen.getByRole('button', { name: 'Expand' })
  expect(expandButton).toHaveAttribute('aria-expanded', 'false')

  await user.click(expandButton)

  expect(screen.getByText('Engineering')).toBeInTheDocument()
  expect(
    screen.getAllByRole('button', { name: 'Collapse' })[0]
  ).toHaveAttribute('aria-expanded', 'true')
})

test('search keeps matching nodes and their ancestor path only', async () => {
  const user = userEvent.setup()
  renderTree()

  await user.type(screen.getByLabelText('Search organizations'), 'plat')

  expect(screen.getByText('Headquarters')).toBeInTheDocument()
  expect(screen.getByText('Engineering')).toBeInTheDocument()
  expect(screen.getByText('Platform')).toBeInTheDocument()
  expect(screen.queryByText('Sales')).not.toBeInTheDocument()
})

test('search reveals collapsed matches and reports an empty result', async () => {
  const user = userEvent.setup()
  renderTree()

  await user.click(screen.getAllByRole('button', { name: 'Collapse' })[0])
  await user.type(screen.getByLabelText('Search organizations'), 'platform')
  expect(screen.getByText('Platform')).toBeInTheDocument()

  await user.clear(screen.getByLabelText('Search organizations'))
  await user.type(screen.getByLabelText('Search organizations'), 'unknown')
  expect(screen.getByText('No matching organizations')).toBeInTheDocument()
})
