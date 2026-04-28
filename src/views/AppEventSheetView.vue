<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { syncSheet, validateSheet } from '@/services/appsScriptApi'

const route = useRoute()
const sheetUrl = ref('')
const isValidating = ref(false)
const syncStatus = ref('')
const validationResult = ref(null)

async function onValidate() {
  if (!sheetUrl.value) return
  isValidating.value = true
  validationResult.value = null
  try {
    validationResult.value = await validateSheet(route.params.eventSlug, sheetUrl.value)
  } finally {
    isValidating.value = false
  }
}

async function onSync() {
  isValidating.value = true
  syncStatus.value = ''
  try {
    const res = await syncSheet(route.params.eventSlug)
    syncStatus.value = res?.status === 'ok' ? `同步完成：${res.synced_at}` : '同步完成'
  } finally {
    isValidating.value = false
  }
}
</script>

<template>
  <v-card class="pa-6">
    <h1 class="text-h5 mb-4">資料連線（Google Sheet）</h1>
    <v-text-field
      v-model="sheetUrl"
      label="Google Sheet 連結"
      placeholder="貼上共有的 Sheet 連結網址"
    />
    <div class="d-flex ga-3">
      <v-btn color="primary" :disabled="!sheetUrl || isValidating" @click="onValidate">
        {{ isValidating ? '驗證中...' : '驗證連線' }}
      </v-btn>
      <v-btn variant="outlined" :disabled="isValidating" @click="onSync">手動同步</v-btn>
    </div>

    <v-alert
      v-if="validationResult"
      class="mt-4"
      :type="validationResult.is_valid ? 'success' : 'error'"
      variant="tonal"
    >
      <div>驗證結果：{{ validationResult.is_valid ? '通過' : '未通過' }}</div>
      <div v-if="validationResult.missing_columns?.length">
        缺少欄位：{{ validationResult.missing_columns.join(', ') }}
      </div>
    </v-alert>

    <v-alert v-if="syncStatus" class="mt-4" type="info" variant="tonal">
      {{ syncStatus }}
    </v-alert>
  </v-card>
</template>
