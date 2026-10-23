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
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Form,
  FormControl,
  FormDescription,
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
  COMPANY_SIZE_OPTIONS,
  COMPANY_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
} from '../constants'
import {
  COMPANY_FORM_DEFAULT_VALUES,
  companyFormSchema,
  type CompanyFormValues,
} from '../lib/company-form'

type FormSectionProps = {
  title: string
  children: ReactNode
}

function FormSection(props: FormSectionProps) {
  return (
    <section className='space-y-4'>
      <h3 className='text-sm font-medium'>{props.title}</h3>
      <div className='grid gap-4 sm:grid-cols-2'>{props.children}</div>
    </section>
  )
}

type CompanyFormProps = {
  formId: string
  defaultValues?: CompanyFormValues
  onSubmit: (values: CompanyFormValues) => void
}

export function CompanyForm(props: CompanyFormProps) {
  const { t } = useTranslation()
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: props.defaultValues ?? COMPANY_FORM_DEFAULT_VALUES,
  })

  return (
    <Form {...form}>
      <form
        id={props.formId}
        onSubmit={form.handleSubmit(props.onSubmit)}
        className='space-y-6'
      >
        <FormSection title={t('Basic Information')}>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='sm:col-span-2'>
                <FormLabel>{t('Company Name')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('Enter your company name')}
                  />
                </FormControl>
                <FormDescription>
                  {t('The legal name shown on your business license.')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='creditCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Unified Social Credit Code')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('18-character unified social credit code')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='companyType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Company Type')}</FormLabel>
                <Select
                  items={COMPANY_TYPE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.label),
                  }))}
                  onValueChange={(value) =>
                    value !== null && field.onChange(value)
                  }
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select company type')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {COMPANY_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.label)}
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
            name='industry'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Industry')}</FormLabel>
                <Select
                  items={INDUSTRY_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.label),
                  }))}
                  onValueChange={(value) =>
                    value !== null && field.onChange(value)
                  }
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select industry')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.label)}
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
            name='companySize'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Company Size')}</FormLabel>
                <Select
                  items={COMPANY_SIZE_OPTIONS.map((option) => ({
                    value: option.value,
                    label: t(option.label),
                  }))}
                  onValueChange={(value) =>
                    value !== null && field.onChange(value)
                  }
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select company size')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {COMPANY_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.label)}
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
            name='foundedAt'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Founded Date')}</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title={t('Registration Information')}>
          <FormField
            control={form.control}
            name='legalRepresentative'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Legal Representative')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("Enter the legal representative's name")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='registeredAddress'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Registered Address')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('Enter the registered address')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='officeAddress'
            render={({ field }) => (
              <FormItem className='sm:col-span-2'>
                <FormLabel>{t('Office Address (optional)')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('Enter the office address')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title={t('Contact Information')}>
          <FormField
            control={form.control}
            name='contactName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Contact Name')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('Enter the contact name')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='contactPhone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Contact Phone')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('Enter the contact phone number')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='contactEmail'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Contact Email')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='email'
                    placeholder={t('Enter the contact email')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='website'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Website (optional)')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('https://example.com')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title={t('About the Company')}>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='sm:col-span-2'>
                <FormLabel>{t('Description')}</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder={t(
                      "Describe your company's business, products, and services"
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>
      </form>
    </Form>
  )
}
