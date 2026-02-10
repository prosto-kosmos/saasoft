<script setup lang="ts">
import { provide } from 'vue'
import { useAccountValidation, AccountValidationKey } from '@/composables/useAccountValidation'
import { useAccountsStore } from '@/stores/accounts'
import AccountsFormRow from './AccountsFormRow.vue'
import AccountsFormHeader from './AccountsFormHeader.vue'
import Button from 'primevue/button'
import Message from 'primevue/message'

const store = useAccountsStore()
const validation = useAccountValidation()

provide(AccountValidationKey, validation)

function addAccount() {
  store.addAccount()
}

function removeAccount(id: string) {
  store.removeAccount(id)
  validation.clearErrors(id)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <header class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-xl font-semibold m-0">Учетные записи</h2>
      <Button icon="pi pi-plus" rounded aria-label="Добавить учетную запись" @click="addAccount" />
    </header>

    <Message severity="info" :closable="false" class="w-full">
      Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
    </Message>

    <div class="flex flex-col gap-3">
      <AccountsFormHeader />

      <AccountsFormRow
        v-for="account in store.accounts"
        :key="account.id"
        :account="account"
        @remove="removeAccount"
      />
    </div>
  </div>
</template>
