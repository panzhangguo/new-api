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
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import {
  ORGANIZATION_FORM_DEFAULT_VALUES,
  organizationFormSchema,
  type OrganizationFormValues,
} from '../lib/organization-form'

export type OrganizationParentOption = {
  id: number
  label: string
}

type OrganizationFormProps = {
  formId: string
  defaultValues?: OrganizationFormValues
  parentOptions: OrganizationParentOption[]
  onSubmit: (values: OrganizationFormValues) => void
}

export function OrganizationForm(props: OrganizationFormProps) {
  const { t } = useTranslation()
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: props.defaultValues ?? ORGANIZATION_FORM_DEFAULT_VALUES,
  })

  return (
    <Form {...form}>
      <form
        id={props.formId}
        onSubmit={form.handleSubmit(props.onSubmit)}
        className='space-y-4'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Organization Name')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('Enter the organization name')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='parentId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Parent Organization')}</FormLabel>
              <Select
                items={[
                  { value: '0', label: t('None (top level)') },
                  ...props.parentOptions.map((option) => ({
                    value: String(option.id),
                    label: option.label,
                  })),
                ]}
                onValueChange={(value) =>
                  value !== null && field.onChange(Number(value))
                }
                value={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('Select the parent organization')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    <SelectItem value='0'>{t('None (top level)')}</SelectItem>
                    {props.parentOptions.map((option) => (
                      <SelectItem key={option.id} value={String(option.id)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Description (optional)')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder={t('Describe the organization')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
