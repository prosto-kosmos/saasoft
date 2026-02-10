import type { AccountType } from '@/types/account'

export const LABELS_MAX = 50
export const LOGIN_MAX = 100
export const PASSWORD_MAX = 100

export const ACCOUNT_TYPE_OPTIONS: { label: string; value: AccountType }[] = [
  { label: 'Локальная', value: 'local' },
  { label: 'LDAP', value: 'ldap' },
]
