<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { isApiOnlyMode, runtimeMode } from '@/utils/runtimeMode'

const router = useRouter()
const authStore = useAuthStore()

const displayName = computed(() => authStore.user?.email || 'Owner')
const modeLabel = computed(() => `模式：${runtimeMode.toUpperCase()}`)

const menuItems = [
  { title: '活動列表', to: '/app/events' },
  { title: '建立活動', to: '/app/events/new' },
  { title: '教學中心', to: '/app/help' },
]

function onLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <v-layout class="min-height-screen">
    <v-app-bar elevation="1">
      <v-app-bar-title>Wedding Seat Search Console</v-app-bar-title>
      <v-spacer />
      <v-chip
        class="mr-3"
        size="small"
        :color="isApiOnlyMode ? 'success' : 'warning'"
        :variant="isApiOnlyMode ? 'flat' : 'tonal'"
      >
        {{ modeLabel }}
      </v-chip>
      <span class="mr-4">{{ displayName }}</span>
      <v-btn color="primary" variant="tonal" @click="onLogout">登出</v-btn>
    </v-app-bar>

    <v-navigation-drawer permanent>
      <v-list nav density="comfortable">
        <v-list-item
          v-for="item in menuItems"
          :key="item.to"
          :title="item.title"
          :to="item.to"
          rounded="lg"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<style scoped>
.min-height-screen {
  min-height: 100vh;
}
</style>
