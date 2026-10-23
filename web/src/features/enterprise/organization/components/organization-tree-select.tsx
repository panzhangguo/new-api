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
import { Check, ChevronDown, FolderTree } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import {
  buildOrganizationTree,
  filterOrganizationTree,
  type EnterpriseOrganization,
  type OrganizationTreeNode,
} from '../lib/organization-form'

type OrganizationTreeSelectProps = {
  id?: string
  value: number
  onValueChange: (value: number) => void
  organizations: EnterpriseOrganization[]
  placeholder?: string
  disabled?: boolean
}

export function OrganizationTreeSelect(props: OrganizationTreeSelectProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const tree = useMemo(
    () => buildOrganizationTree(props.organizations),
    [props.organizations]
  )
  const filtered = useMemo(
    () => filterOrganizationTree(tree, query),
    [tree, query]
  )
  const selected = props.organizations.find(
    (organization) => organization.id === props.value
  )

  const renderNodes = (nodes: OrganizationTreeNode[], depth: number) =>
    nodes.map((node) => {
      const isSelected = node.id === props.value
      return (
        <div key={node.id}>
          <CommandItem
            value={String(node.id)}
            onSelect={() => {
              props.onValueChange(node.id)
              setOpen(false)
              setQuery('')
            }}
            style={{ paddingLeft: `${8 + depth * 16}px` }}
          >
            <FolderTree className='text-muted-foreground size-4 shrink-0' />
            <span className='truncate'>{node.name}</span>
            {isSelected && <Check className='text-primary ml-auto size-4' />}
          </CommandItem>
          {node.children.length > 0 && renderNodes(node.children, depth + 1)}
        </div>
      )
    })

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setQuery('')
      }}
    >
      <PopoverTrigger
        render={
          <Button
            id={props.id}
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={props.disabled}
            className={cn(
              'border-input w-full justify-between font-normal',
              !selected && 'text-muted-foreground'
            )}
          />
        }
      >
        <span className='flex min-w-0 items-center gap-2'>
          <FolderTree className='size-4 shrink-0' />
          <span className='truncate'>
            {selected?.name ?? props.placeholder ?? t('Select a department')}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 opacity-50 transition-transform',
            open && 'rotate-180'
          )}
        />
      </PopoverTrigger>
      <PopoverContent
        align='start'
        className='w-[var(--anchor-width)] overflow-hidden p-0'
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={t('Search departments...')}
          />
          <CommandList>
            <CommandEmpty>{t('No matching departments')}</CommandEmpty>
            {renderNodes(filtered, 0)}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
