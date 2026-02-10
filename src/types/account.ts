export type AccountType = 'ldap' | 'local'

export interface LabelItem {
  text: string
}

export interface Account {
  id: string
  labels: LabelItem[]
  type: AccountType
  login: string
  password: string | null
}

export interface AccountFormState {
  labels: string
  type: AccountType
  login: string
  password: string
}
