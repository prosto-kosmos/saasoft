import { reactive, type InjectionKey } from 'vue'
import type { AccountType } from '@/types/account'
import { LABELS_MAX, LOGIN_MAX, PASSWORD_MAX } from '@/constants/accounts'

export type AccountField = 'labels' | 'login' | 'password'

export interface AccountErrors {
  labels?: string
  login?: string
  password?: string
}

export type AccountValidation = ReturnType<typeof useAccountValidation>

export const AccountValidationKey: InjectionKey<AccountValidation> = Symbol('accountValidation')

export function useAccountValidation() {
  const errors = reactive<Record<string, AccountErrors>>({})

  function getErrors(id: string): AccountErrors {
    return errors[id] ?? {}
  }

  function setError(id: string, field: AccountField, message: string | undefined) {
    if (!errors[id]) errors[id] = {}
    if (message) {
      errors[id][field] = message
    } else {
      delete errors[id][field]
      if (Object.keys(errors[id]).length === 0) delete errors[id]
    }
  }

  function validateLabels(id: string, value: string): boolean {
    if (value.length > LABELS_MAX) {
      setError(id, 'labels', `Максимум ${LABELS_MAX} символов`)
      return false
    }
    setError(id, 'labels', undefined)
    return true
  }

  function validateLogin(id: string, value: string): boolean {
    const v = value.trim()
    if (!v) {
      setError(id, 'login', 'Обязательное поле')
      return false
    }
    if (v.length > LOGIN_MAX) {
      setError(id, 'login', `Максимум ${LOGIN_MAX} символов`)
      return false
    }
    setError(id, 'login', undefined)
    return true
  }

  function validatePassword(id: string, value: string, type: AccountType): boolean {
    if (type === 'ldap') {
      setError(id, 'password', undefined)
      return true
    }
    if (!value) {
      setError(id, 'password', 'Обязательное поле')
      return false
    }
    if (value.length > PASSWORD_MAX) {
      setError(id, 'password', `Максимум ${PASSWORD_MAX} символов`)
      return false
    }
    setError(id, 'password', undefined)
    return true
  }

  function clearErrors(id: string) {
    delete errors[id]
  }

  return {
    errors,
    getErrors,
    setError,
    validateLabels,
    validateLogin,
    validatePassword,
    clearErrors,
  }
}
