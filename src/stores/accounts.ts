import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Account, LabelItem } from '@/types/account'
import { mockAccounts } from '@/mock/accounts'

const STORAGE_KEY = 'accounts'

function loadFromStorage(): Account[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Account[]
      return Array.isArray(parsed) ? parsed : mockAccounts
    }
  } catch {
    // ignore
  }
  return [...mockAccounts]
}

function saveToStorage(accounts: Account[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch {
    // ignore
  }
}

function labelsToString(items: LabelItem[]): string {
  return items
    .map((item) => item.text.trim())
    .filter(Boolean)
    .join('; ')
}

function parseLabels(value: string): LabelItem[] {
  if (!value.trim()) return []
  return value
    .split(';')
    .map((s) => ({ text: s.trim() }))
    .filter((item) => item.text)
}

export const useAccountsStore = defineStore('accounts', () => {
  const items = ref<Account[]>(loadFromStorage())

  const accounts = computed(() => items.value)

  function addAccount(): Account {
    const account: Account = {
      id: crypto.randomUUID(),
      labels: [],
      type: 'local',
      login: '',
      password: '',
    }
    items.value = [...items.value, account]
    saveToStorage(items.value)
    return account
  }

  function removeAccount(id: string) {
    items.value = items.value.filter((a) => a.id !== id)
    saveToStorage(items.value)
  }

  function updateAccount(id: string, data: Partial<Omit<Account, 'id'>>) {
    const index = items.value.findIndex((a) => a.id === id)
    const current = items.value[index]
    if (index === -1 || !current) return
    const next = [...items.value]
    next[index] = {
      id: current.id,
      labels: data.labels ?? current.labels,
      type: data.type ?? current.type,
      login: data.login ?? current.login,
      password: data.password !== undefined ? data.password : current.password,
    }
    items.value = next
    saveToStorage(items.value)
  }

  return {
    accounts,
    addAccount,
    removeAccount,
    updateAccount,
    labelsToString,
    parseLabels,
  }
})
