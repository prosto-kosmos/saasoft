<script setup lang="ts">
import { inject } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { useAccountsStore } from '@/stores/accounts'
import type { Account, AccountType } from '@/types/account'
import { ACCOUNT_TYPE_OPTIONS } from '@/constants/accounts'
import { LABELS_MAX, LOGIN_MAX, PASSWORD_MAX } from '@/constants/accounts'
import { AccountValidationKey } from '@/composables/useAccountValidation'

const props = defineProps<{
  account: Account
}>()

const emit = defineEmits<{
  remove: [id: string]
}>()

const store = useAccountsStore()
const validation = inject(AccountValidationKey)!

const fieldErrors = () => validation.getErrors(props.account.id)

function handleLabelsBlur(value: string) {
  if (validation.validateLabels(props.account.id, value)) {
    store.updateAccount(props.account.id, { labels: store.parseLabels(value) })
  }
}

function handleLoginBlur(value: string) {
  if (validation.validateLogin(props.account.id, value)) {
    store.updateAccount(props.account.id, { login: value.trim() })
  }
}

function handlePasswordBlur(value: string) {
  if (validation.validatePassword(props.account.id, value, props.account.type)) {
    store.updateAccount(props.account.id, {
      password: props.account.type === 'local' ? value : null,
    })
  }
}

function handleTypeChange(value: AccountType) {
  store.updateAccount(props.account.id, {
    type: value,
    password: value === 'ldap' ? null : props.account.password ?? '',
  })
  if (value === 'local') {
    validation.validatePassword(props.account.id, props.account.password ?? '', value)
  } else {
    validation.setError(props.account.id, 'password', undefined)
  }
}

function handleRemove() {
  emit('remove', props.account.id)
}
</script>

<template>
  <div class="flex flex-nowrap items-start gap-2">
    <div class="flex-1 min-w-0 flex flex-col">
      <InputText
        :model-value="store.labelsToString(account.labels)"
        :invalid="!!fieldErrors().labels"
        fluid
        :maxlength="LABELS_MAX"
        @update:model-value="(v: string | undefined) => store.updateAccount(account.id, { labels: store.parseLabels(v ?? '') })"
        @blur="(e: FocusEvent) => handleLabelsBlur((e.target as HTMLInputElement).value)"
      />
    </div>

    <div class="flex-1 min-w-0 flex flex-col">
      <Select
        :model-value="account.type"
        :options="ACCOUNT_TYPE_OPTIONS"
        option-label="label"
        option-value="value"
        class="w-full"
        @update:model-value="handleTypeChange"
      />
    </div>

    <div class="flex-1 min-w-0 flex flex-col">
      <InputText
        :model-value="account.login"
        :invalid="!!fieldErrors().login"
        fluid
        :maxlength="LOGIN_MAX"
        @update:model-value="(v: string | undefined) => store.updateAccount(account.id, { login: v ?? '' })"
        @blur="(e: FocusEvent) => handleLoginBlur((e.target as HTMLInputElement).value)"
      />
    </div>

    <div class="flex-1 min-w-0 flex flex-col">
      <Password
        v-if="account.type === 'local'"
        :model-value="account.password ?? ''"
        :invalid="!!fieldErrors().password"
        fluid
        :maxlength="PASSWORD_MAX"
        toggle-mask
        @update:model-value="(v: string | undefined) => store.updateAccount(account.id, { password: v ?? '' })"
        @blur="handlePasswordBlur(account.password ?? '')"
      />
      <span v-else class="text-gray-500 text-sm py-2">—</span>
    </div>

    <div class="w-10 flex-none flex items-center justify-center pt-1">
      <Button
        icon="pi pi-trash"
        severity="secondary"
        text
        rounded
        aria-label="Удалить учетную запись"
        @click="handleRemove"
      />
    </div>
  </div>
</template>
