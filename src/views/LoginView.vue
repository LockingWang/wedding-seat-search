<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authLogin } from '@/services/apiClient'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')

async function onSubmit() {
  if (!email.value || !password.value) return
  const res = await authLogin(email.value, password.value)
  if (!res?.access_token) return
  authStore.login(res.access_token, { email: res.user?.email || email.value })
  router.push('/app')
}
</script>

<template>
  <v-container class="py-10" style="max-width: 520px">
    <h1 class="text-h4 mb-6">登入後台</h1>
    <v-form @submit.prevent="onSubmit">
      <v-text-field v-model="email" label="Email" type="email" required />
      <v-text-field v-model="password" label="密碼" type="password" required />
      <v-btn block color="primary" type="submit">登入</v-btn>
    </v-form>
    <div class="mt-4 d-flex ga-4">
      <router-link to="/register">註冊帳號</router-link>
      <router-link to="/forgot-password">忘記密碼</router-link>
    </div>
  </v-container>
</template>
