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
  ChevronRight,
  Folder,
  FolderOpen,
  PencilLine,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import {
  filterOrganizationTree,
  type OrganizationTreeNode,
} from '../lib/organization-form'

type OrganizationTreeProps = {
  nodes: OrganizationTreeNode[]
  selectedId: number | null
  onSelect: (node: OrganizationTreeNode) => void
  onEdit: (node: OrganizationTreeNode) => void
}

type TreeNodeListProps = OrganizationTreeProps & {
  depth: number
  expandedIds: Set<number>
  onToggle: (id: number) => void
}

type TreeNodeItemProps = Omit<TreeNodeListProps, 'nodes'> & {
  node: OrganizationTreeNode
}

function OrganizationTreeNodes(props: TreeNodeListProps) {
  return (
    <ul className={cn(props.depth > 0 && 'border-border ml-3 border-l')}>
      {props.nodes.map((node) => (
        <OrganizationTreeNodeItem
          key={node.id}
          node={node}
          depth={props.depth}
          selectedId={props.selectedId}
          onSelect={props.onSelect}
          onEdit={props.onEdit}
          expandedIds={props.expandedIds}
          onToggle={props.onToggle}
        />
      ))}
    </ul>
  )
}

function OrganizationTreeNodeItem(props: TreeNodeItemProps) {
  const { t } = useTranslation()
  const hasChildren = props.node.children.length > 0
  const expanded = props.expandedIds.has(props.node.id)
  const isSelected = props.node.id === props.selectedId

  return (
    <li className={cn('relative', props.depth > 0 && 'pl-4')}>
      {props.depth > 0 && (
        <span
          aria-hidden='true'
          className='bg-border absolute top-4 left-0 h-px w-4'
        />
      )}
      <div
        className={cn(
          'group hover:bg-accent flex items-center gap-1 rounded-md pr-1',
          isSelected && 'bg-accent'
        )}
      >
        {hasChildren ? (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            aria-label={expanded ? t('Collapse') : t('Expand')}
            aria-expanded={expanded}
            className='text-muted-foreground size-6 shrink-0'
            onClick={() => props.onToggle(props.node.id)}
          >
            <ChevronRight
              aria-hidden='true'
              className={cn(
                'size-3.5 transition-transform',
                expanded && 'rotate-90'
              )}
            />
          </Button>
        ) : (
          <span aria-hidden='true' className='size-6 shrink-0' />
        )}
        <button
          type='button'
          aria-current={isSelected ? 'true' : undefined}
          onClick={() => props.onSelect(props.node)}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left text-sm',
            isSelected && 'text-accent-foreground font-medium'
          )}
        >
          {expanded && hasChildren ? (
            <FolderOpen
              aria-hidden='true'
              className='text-muted-foreground size-4 shrink-0'
            />
          ) : (
            <Folder
              aria-hidden='true'
              className='text-muted-foreground size-4 shrink-0'
            />
          )}
          <span className='truncate'>{props.node.name}</span>
        </button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={t('Edit organization')}
          className='size-6 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
          onClick={() => props.onEdit(props.node)}
        >
          <PencilLine aria-hidden='true' className='size-3.5' />
        </Button>
      </div>
      {hasChildren && expanded && (
        <OrganizationTreeNodes
          nodes={props.node.children}
          depth={props.depth + 1}
          selectedId={props.selectedId}
          onSelect={props.onSelect}
          onEdit={props.onEdit}
          expandedIds={props.expandedIds}
          onToggle={props.onToggle}
        />
      )}
    </li>
  )
}

function collectOrganizationIds(nodes: OrganizationTreeNode[]): number[] {
  const ids: number[] = []
  for (const node of nodes) {
    ids.push(node.id, ...collectOrganizationIds(node.children))
  }
  return ids
}

export function OrganizationTree(props: OrganizationTreeProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set())

  const isSearching = query.trim() !== ''
  const visibleNodes = useMemo(
    () => filterOrganizationTree(props.nodes, query),
    [props.nodes, query]
  )
  const expandedIds = useMemo(() => {
    if (isSearching) {
      return new Set(collectOrganizationIds(visibleNodes))
    }
    const ids = new Set(collectOrganizationIds(props.nodes))
    for (const id of collapsedIds) ids.delete(id)
    return ids
  }, [collapsedIds, isSearching, props.nodes, visibleNodes])

  const toggle = (id: number) => {
    setCollapsedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='relative'>
        <Search
          aria-hidden='true'
          className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2'
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('Search organizations')}
          aria-label={t('Search organizations')}
          className='h-8 pl-8'
        />
      </div>
      {visibleNodes.length === 0 ? (
        <p className='text-muted-foreground px-2 py-6 text-center text-sm'>
          {t('No matching organizations')}
        </p>
      ) : (
        <OrganizationTreeNodes
          nodes={visibleNodes}
          depth={0}
          selectedId={props.selectedId}
          onSelect={props.onSelect}
          onEdit={props.onEdit}
          expandedIds={expandedIds}
          onToggle={toggle}
        />
      )}
    </div>
  )
}
