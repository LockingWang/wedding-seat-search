<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const eventName = ref('')
const eventDate = ref('')
const loading = ref(false)
const message = ref('')

const canSubmit = computed(() => Boolean(eventName.value.trim() && eventDate.value))

async function onSubmit() {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 400))
    message.value = '活動已建立（示範資料）'
    router.push('/app/events/demo/settings')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card class="pa-6">
    <h1 class="text-h5 mb-4">建立活動</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="eventName" label="活動名稱" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="eventDate" label="活動日期" type="date" />
      </v-col>
    </v-row>
    <v-btn color="primary" :disabled="!canSubmit || loading" @click="onSubmit">
      {{ loading ? '建立中...' : '儲存（示範）' }}
    </v-btn>
    <v-alert v-if="message" class="mt-4" type="success" variant="tonal">{{ message }}</v-alert>
  </v-card>
</template>
