<script setup>
import { ref } from 'vue'

const loading = ref(false)
const ready = ref(false)

async function onGenerate() {
  loading.value = true
  ready.value = false
  try {
    await new Promise((resolve) => setTimeout(resolve, 800))
    ready.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card class="pa-6">
    <h1 class="text-h5 mb-4">QR 圖卡匯出</h1>
    <p class="mb-4">一鍵批次產生全賓客 QR 圖卡（含姓名與桌號），完成後可下載 ZIP。</p>
    <v-btn color="primary" :disabled="loading" @click="onGenerate">
      {{ loading ? '產生中...' : '開始產生（示範）' }}
    </v-btn>
    <v-progress-linear v-if="loading" class="mt-4" indeterminate />
    <v-alert v-if="ready" class="mt-4" type="success" variant="tonal">
      QR 圖卡已產生完成（示範模式），可串接下載 API。
    </v-alert>
  </v-card>
</template>
