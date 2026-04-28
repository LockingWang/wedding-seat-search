<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authResetPassword, authSendOtp } from '@/services/appsScriptApi'
import { isMockAvailable } from '@/utils/runtimeMode'

const router = useRouter()
const email = ref('')
const otpCode = ref('')
const newPassword = ref('')
const sent = ref(false)
const message = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function onSendOtp() {
  if (!email.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await authSendOtp(email.value, 'forgot_password')
    sent.value = true
    message.value = isMockAvailable
      ? '驗證碼已寄出（測試模式可輸入 123456）'
      : '驗證碼已寄出，請至信箱確認。'
  } catch (err) {
    errorMessage.value = err.message || '寄送驗證碼失敗'
  } finally {
    isSubmitting.value = false
  }
}

async function onResetPassword() {
  if (!email.value || !otpCode.value || !newPassword.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await authResetPassword(email.value, otpCode.value, newPassword.value)
    router.push('/login')
  } catch (err) {
    errorMessage.value = err.message || '重設密碼失敗'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <v-container class="py-10" style="max-width: 520px">
    <h1 class="text-h4 mb-6">忘記密碼</h1>
    <v-form @submit.prevent="onSendOtp">
      <v-text-field v-model="email" label="Email" type="email" required />
      <v-btn block color="primary" type="submit" :disabled="isSubmitting || sent">
        {{ isSubmitting ? '寄送中...' : '寄送驗證碼' }}
      </v-btn>
    </v-form>

    <div v-if="sent" class="mt-4">
      <v-text-field v-model="otpCode" label="驗證碼" maxlength="6" />
      <v-text-field v-model="newPassword" label="新密碼" type="password" />
      <v-btn block color="secondary" :disabled="isSubmitting" @click="onResetPassword">
        重設密碼
      </v-btn>
    </div>

    <v-alert v-if="message" class="mt-4" type="success" variant="tonal">{{ message }}</v-alert>
    <v-alert v-if="errorMessage" class="mt-4" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>
  </v-container>
</template>
