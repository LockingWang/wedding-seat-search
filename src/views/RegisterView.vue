<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authRegister, authSendOtp, authVerifyOtp } from '@/services/apiClient'
import { isMockAvailable } from '@/utils/runtimeMode'

const router = useRouter()
const email = ref('')
const password = ref('')
const otpCode = ref('')
const otpSent = ref(false)
const message = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function onSendOtp() {
  if (!email.value || !password.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await authRegister(email.value, password.value)
    await authSendOtp(email.value, 'register')
    otpSent.value = true
    message.value = isMockAvailable
      ? '驗證碼已寄出（測試模式可輸入 123456）'
      : '驗證碼已寄出，請至信箱確認。'
  } catch (err) {
    errorMessage.value = err.message || '寄送驗證碼失敗'
  } finally {
    isSubmitting.value = false
  }
}

async function onVerifyOtp() {
  if (!otpCode.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await authVerifyOtp(email.value, otpCode.value, 'register')
    router.push('/login')
  } catch (err) {
    errorMessage.value = err.message || '驗證失敗'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <v-container class="py-10" style="max-width: 520px">
    <h1 class="text-h4 mb-6">註冊帳號</h1>
    <v-form @submit.prevent="onSendOtp">
      <v-text-field v-model="email" label="Email" type="email" required />
      <v-text-field v-model="password" label="密碼" type="password" required />
      <v-btn block color="primary" type="submit" :disabled="isSubmitting || otpSent">
        {{ isSubmitting ? '處理中...' : '送出註冊並寄送驗證碼' }}
      </v-btn>
    </v-form>

    <v-text-field
      v-if="otpSent"
      v-model="otpCode"
      class="mt-4"
      label="輸入 Email 驗證碼"
      maxlength="6"
    />
    <v-btn v-if="otpSent" block color="secondary" :disabled="isSubmitting" @click="onVerifyOtp">
      驗證並完成註冊
    </v-btn>

    <v-alert v-if="message" class="mt-4" type="success" variant="tonal">{{ message }}</v-alert>
    <v-alert v-if="errorMessage" class="mt-4" type="error" variant="tonal">
      {{ errorMessage }}
    </v-alert>
  </v-container>
</template>
