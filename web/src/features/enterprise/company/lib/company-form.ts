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

export const companyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please enter your company name')
    .max(100, 'Company name must be at most 100 characters'),
  creditCode: z
    .string()
    .trim()
    .min(1, 'Please enter the unified social credit code')
    .regex(
      /^[0-9A-HJ-NPQRTUWXY]{18}$/i,
      'Enter an 18-character unified social credit code'
    ),
  companyType: z.string().min(1, 'Please select a company type'),
  industry: z.string().min(1, 'Please select an industry'),
  companySize: z.string().min(1, 'Please select a company size'),
  foundedAt: z.string().min(1, 'Please select the founded date'),
  legalRepresentative: z
    .string()
    .trim()
    .min(1, 'Please enter the legal representative'),
  registeredAddress: z
    .string()
    .trim()
    .min(1, 'Please enter the registered address'),
  officeAddress: z.string().trim(),
  contactName: z.string().trim().min(1, 'Please enter the contact name'),
  contactPhone: z
    .string()
    .trim()
    .min(1, 'Please enter the contact phone number')
    .regex(/^\+?[0-9\s()-]{6,20}$/, 'Enter a valid phone number'),
  contactEmail: z
    .string()
    .trim()
    .min(1, 'Please enter the contact email')
    .email({ message: 'Please enter a valid email address' }),
  website: z
    .string()
    .trim()
    .refine((value) => value === '' || /^https?:\/\/[^\s]+$/i.test(value), {
      message: 'Enter a valid website URL (starting with http:// or https://)',
    }),
  description: z
    .string()
    .trim()
    .max(500, 'Company description must be at most 500 characters'),
})

export type CompanyFormValues = z.infer<typeof companyFormSchema>

export type EnterpriseCompany = CompanyFormValues & { id: number }

export const COMPANY_FORM_DEFAULT_VALUES: CompanyFormValues = {
  name: '',
  creditCode: '',
  companyType: '',
  industry: '',
  companySize: '',
  foundedAt: '',
  legalRepresentative: '',
  registeredAddress: '',
  officeAddress: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  website: '',
  description: '',
}

export function normalizeCompanyForm(
  values: CompanyFormValues
): CompanyFormValues {
  return {
    ...values,
    creditCode: values.creditCode.toUpperCase(),
  }
}
