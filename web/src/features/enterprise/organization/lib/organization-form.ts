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
import * as z from 'zod'

export const organizationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please enter the organization name')
    .max(100, 'Organization name must be at most 100 characters'),
  parentId: z.number().int().min(0),
  description: z
    .string()
    .trim()
    .max(500, 'Organization description must be at most 500 characters'),
})

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>

export type EnterpriseOrganization = OrganizationFormValues & {
  id: number
  enterpriseId: number
}

export type OrganizationTreeNode = EnterpriseOrganization & {
  children: OrganizationTreeNode[]
}

export const ORGANIZATION_FORM_DEFAULT_VALUES: OrganizationFormValues = {
  name: '',
  parentId: 0,
  description: '',
}

/**
 * Groups a flat organization list into a forest keyed by parent id. Nodes
 * whose parent is missing (for example after a filtered fetch) are attached
 * to the root so the tree never silently drops rows.
 */
export function buildOrganizationTree(
  organizations: EnterpriseOrganization[]
): OrganizationTreeNode[] {
  const nodeById = new Map<number, OrganizationTreeNode>()
  for (const organization of organizations) {
    nodeById.set(organization.id, { ...organization, children: [] })
  }
  const roots: OrganizationTreeNode[] = []
  for (const node of nodeById.values()) {
    const parent = node.parentId !== 0 ? nodeById.get(node.parentId) : undefined
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

/**
 * Keeps only nodes whose name matches the query or that contain a matching
 * descendant, so the visible tree always shows the path to every match.
 * Matching is case-insensitive and returns the original nodes when the query
 * is blank.
 */
export function filterOrganizationTree(
  nodes: OrganizationTreeNode[],
  query: string
): OrganizationTreeNode[] {
  const keyword = query.trim().toLowerCase()
  if (keyword === '') return nodes
  const matched: OrganizationTreeNode[] = []
  for (const node of nodes) {
    const children = filterOrganizationTree(node.children, keyword)
    if (node.name.toLowerCase().includes(keyword) || children.length > 0) {
      matched.push({ ...node, children })
    }
  }
  return matched
}

/**
 * Collects the id of the given organization together with every descendant.
 * Used to exclude invalid parent candidates while editing.
 */
export function collectOrganizationSubtreeIds(
  organizations: EnterpriseOrganization[],
  rootId: number
): Set<number> {
  const childrenByParent = new Map<number, number[]>()
  for (const organization of organizations) {
    const siblings = childrenByParent.get(organization.parentId) ?? []
    siblings.push(organization.id)
    childrenByParent.set(organization.parentId, siblings)
  }
  const ids = new Set<number>()
  const queue = [rootId]
  while (queue.length > 0) {
    const current = queue.pop() as number
    if (ids.has(current)) continue
    ids.add(current)
    for (const childId of childrenByParent.get(current) ?? []) {
      queue.push(childId)
    }
  }
  return ids
}
