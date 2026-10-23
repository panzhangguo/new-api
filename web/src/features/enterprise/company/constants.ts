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
export const COMPANY_TYPE_OPTIONS = [
  { value: 'limited_liability', label: 'Limited Liability Company' },
  { value: 'joint_stock', label: 'Joint-Stock Company' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'individual_business', label: 'Individual Business' },
  { value: 'other', label: 'Other' },
] as const

export const INDUSTRY_OPTIONS = [
  { value: 'internet_software', label: 'Internet & Software' },
  { value: 'artificial_intelligence', label: 'Artificial Intelligence' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail_ecommerce', label: 'Retail & E-Commerce' },
  { value: 'business_services', label: 'Business Services' },
  { value: 'media_entertainment', label: 'Media & Entertainment' },
  { value: 'other', label: 'Other' },
] as const

export const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1,000 employees' },
  { value: '1000+', label: '1,000+ employees' },
] as const

export function getOptionLabel(
  options: readonly { value: string; label: string }[],
  value: string
) {
  return options.find((option) => option.value === value)?.label ?? value
}
