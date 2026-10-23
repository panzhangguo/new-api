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
export type ApiResponse<T> = {
  success: boolean
  message?: string
  data?: T
}

// The Go backend exposes snake_case field names (credit_code, founded_at,
// ...). The frontend domain types use camelCase. Convert at the API boundary
// so form code and components stay idiomatic on the TypeScript side.

const CAMEL_TO_SNAKE_RE = /([a-z0-9])([A-Z])/g
const SNAKE_TO_CAMEL_RE = /_([a-z])/g

export function camelToSnake(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelToSnake)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value)) {
      out[key.replace(CAMEL_TO_SNAKE_RE, '$1_$2').toLowerCase()] =
        camelToSnake(v)
    }
    return out
  }
  return value
}

export function snakeToCamel(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(snakeToCamel)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value)) {
      out[key.replace(SNAKE_TO_CAMEL_RE, (_, c) => c.toUpperCase())] =
        snakeToCamel(v)
    }
    return out
  }
  return value
}
