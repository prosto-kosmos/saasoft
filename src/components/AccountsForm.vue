<script setup lang="ts">
import { reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAccountsStore } from '@/stores/accounts'
import type { AccountType } from '@/types/account'

const store = useAccountsStore()

const accountTypeOptions: { label: string; value: AccountType }[] = [
  { label: 'Локальная', value: 'local' },
  { label: 'LDAP', value: 'ldap' },
]

const errors = reactive<Record<string, { labels?: string; login?: string; password?: string }>>({})

const LABELS_MAX = 50
const LOGIN_MAX = 100
const PASSWORD_MAX = 100

function getErrors(id: string) {
  return errors[id] ?? {}
}

function setError(id: string, field: 'labels' | 'login' | 'password', message: string | undefined) {
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
  const v = value
  if (!v) {
    setError(id, 'password', 'Обязательное поле')
    return false
  }
  if (v.length > PASSWORD_MAX) {
    setError(id, 'password', `Максимум ${PASSWORD_MAX} символов`)
    return false
  }
  setError(id, 'password', undefined)
  return true
}

function onLabelsBlur(accountId: string, value: string) {
  const valid = validateLabels(accountId, value)
  if (valid) {
    store.updateAccount(accountId, { labels: store.parseLabels(value) })
  }
}

function onLoginBlur(accountId: string, value: string) {
  const valid = validateLogin(accountId, value)
  if (valid) {
    store.updateAccount(accountId, { login: value.trim() })
  }
}

function onPasswordBlur(accountId: string, value: string, type: AccountType) {
  const valid = validatePassword(accountId, value, type)
  if (valid) {
    store.updateAccount(accountId, { password: type === 'local' ? value : null })
  }
}

function onTypeChange(accountId: string, value: AccountType) {
  const account = store.accounts.find((a) => a.id === accountId)
  if (!account) return
  store.updateAccount(accountId, {
    type: value,
    password: value === 'ldap' ? null : (account.password ?? ''),
  })
  if (value === 'local') {
    validatePassword(accountId, account.password ?? '', value)
  } else {
    setError(accountId, 'password', undefined)
  }
}

function onLabelsInput(accountId: string, value: string) {
  store.updateAccount(accountId, { labels: store.parseLabels(value) })
}

function onLoginInput(accountId: string, value: string) {
  store.updateAccount(accountId, { login: value })
}

function onPasswordInput(accountId: string, value: string, type: AccountType) {
  if (type === 'local') {
    store.updateAccount(accountId, { password: value })
  }
}

function addAccount() {
  store.addAccount()
}

function removeAccount(id: string) {
  store.removeAccount(id)
  delete errors[id]
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-xl font-semibold m-0">Учетные записи</h2>
      <Button icon="pi pi-plus" rounded @click="addAccount" aria-label="Добавить учетную запись" />
    </div>

    <Message severity="info" :closable="false" class="w-full">
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
    </Message>

    <div class="flex flex-col gap-3">
      <div class="flex flex-nowrap items-center gap-2">
        <div class="flex-1 min-w-0 text-sm font-medium text-gray-500">Метки</div>
        <div class="flex-1 min-w-0 text-sm font-medium text-gray-500">Тип записи</div>
        <div class="flex-1 min-w-0 text-sm font-medium text-gray-500">Логин</div>
        <div class="flex-1 min-w-0 text-sm font-medium text-gray-500">Пароль</div>
        <div class="w-10 flex-none"></div>
      </div>

      <div
        v-for="account in store.accounts"
        :key="account.id"
        class="flex flex-nowrap items-start gap-2"
      >
        <div class="flex-1 min-w-0 flex flex-col">
          <InputText
            :model-value="store.labelsToString(account.labels)"
            :invalid="!!getErrors(account.id).labels"
            fluid
            :maxlength="LABELS_MAX"
            @update:model-value="(v: string | undefined) => onLabelsInput(account.id, v ?? '')"
            @blur="
              (e: FocusEvent) => onLabelsBlur(account.id, (e.target as HTMLInputElement).value)
            "
          />
        </div>

        <div class="flex-1 min-w-0 flex flex-col">
          <Select
            :model-value="account.type"
            :options="accountTypeOptions"
            option-label="label"
            option-value="value"
            @update:model-value="(v: AccountType) => onTypeChange(account.id, v)"
            class="w-full"
          />
        </div>

        <div class="flex-1 min-w-0 flex flex-col">
          <InputText
            :model-value="account.login"
            :invalid="!!getErrors(account.id).login"
            fluid
            :maxlength="LOGIN_MAX"
            @update:model-value="(v: string | undefined) => onLoginInput(account.id, v ?? '')"
            @blur="(e: FocusEvent) => onLoginBlur(account.id, (e.target as HTMLInputElement).value)"
          />
        </div>

        <div class="flex-1 min-w-0 flex flex-col">
          <Password
            v-if="account.type === 'local'"
            :model-value="account.password ?? ''"
            :invalid="!!getErrors(account.id).password"
            fluid
            :maxlength="PASSWORD_MAX"
            toggle-mask
            @update:model-value="
              (v: string | undefined) => onPasswordInput(account.id, v ?? '', account.type)
            "
            @blur="onPasswordBlur(account.id, account.password ?? '', account.type)"
          />
          <span v-else class="text-gray-500 text-sm py-2">—</span>
        </div>

        <div class="w-10 flex-none flex items-center justify-center pt-1">
          <Button
            icon="pi pi-trash"
            severity="secondary"
            text
            rounded
            @click="removeAccount(account.id)"
            aria-label="Удалить учетную запись"
          />
        </div>
      </div>
    </div>
  </div>
</template>
