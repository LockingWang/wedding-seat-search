<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import { createLineShareLink } from '@/services/appsScriptApi'

const route = useRoute()
const lineShareText = ref('')
const shareUrl = ref('')
const isGenerating = ref(false)
const copied = ref(false)
const errorMessage = ref('')

async function onGenerateLine() {
  isGenerating.value = true
  shareUrl.value = ''
  copied.value = false
  errorMessage.value = ''
  try {
    shareUrl.value = await createLineShareLink(route.params.eventSlug, lineShareText.value)
    if (!shareUrl.value) {
      errorMessage.value = '連結產生失敗，請稍後再試。'
    }
  } finally {
    isGenerating.value = false
  }
}

async function onCopyLink() {
  if (!shareUrl.value) return
  await navigator.clipboard?.writeText(shareUrl.value)
  copied.value = true
}
</script>

<template>
  <v-card class="pa-6">
    <h1 class="text-h5 mb-4">發布與分享</h1>
    <v-textarea v-model="lineShareText" label="LINE 分享內文" rows="3" />
    <div class="d-flex ga-3 flex-wrap">
      <v-btn color="primary" :disabled="isGenerating" @click="onGenerateLine">
        {{ isGenerating ? '產生中...' : '產生 LINE 分享連結' }}
      </v-btn>
      <v-btn variant="tonal" :disabled="!shareUrl" @click="onCopyLink">
        複製連結
      </v-btn>
    </div>

    <v-alert v-if="shareUrl" class="mt-4" type="success" variant="tonal">
      <div>LINE 分享連結已生成：</div>
      <div style="word-break: break-all">{{ shareUrl }}</div>
    </v-alert>
    <v-alert v-if="copied" class="mt-4" type="success" variant="tonal">分享連結已複製。</v-alert>
    <v-alert v-if="errorMessage" class="mt-4" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>
  </v-card>
</template>
