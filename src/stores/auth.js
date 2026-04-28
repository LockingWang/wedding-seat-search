import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const TOKEN_KEY = 'wedding-seat-search-token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function login(nextToken, nextUser) {
    token.value = nextToken
    user.value = nextUser ?? null
    localStorage.setItem(TOKEN_KEY, nextToken)
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  }
})
