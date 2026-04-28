<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getReceptionGuests, getReceptionLinks } from '@/services/apiClient'

const route = useRoute()
const loading = ref(false)
const links = ref(null)
const copied = ref('')
const statLoading = ref(false)
const stats = ref({
  total: 0,
  checkedIn: 0,
  pending: 0,
  groomCheckedIn: 0,
  brideCheckedIn: 0,
})
const recentCheckins = ref([])
const lastRefreshedAt = ref('')
const nextRefreshAt = ref(0)
const nowTick = ref(Date.now())
const refreshCooldownMs = 5000
const ticker = setInterval(() => {
  nowTick.value = Date.now()
}, 500)

const eventSlug = computed(() => route.params.eventSlug)

async function loadLinks() {
  loading.value = true
  try {
    links.value = await getReceptionLinks(eventSlug.value)
  } finally {
    loading.value = false
  }
}

async function copyLink(value, label) {
  if (!value) return
  await navigator.clipboard?.writeText(value)
  copied.value = `${label} 已複製`
}

async function loadStats() {
  if (Date.now() < nextRefreshAt.value) return
  statLoading.value = true
  try {
    const guests = await getReceptionGuests(eventSlug.value, 'all')
    const checkedIn = guests.filter((g) => g.checkin_status === 'checked_in')
    const groomCheckedIn = checkedIn.filter((g) => g.side === 'groom').length
    const brideCheckedIn = checkedIn.filter((g) => g.side === 'bride').length
    stats.value = {
      total: guests.length,
      checkedIn: checkedIn.length,
      pending: guests.length - checkedIn.length,
      groomCheckedIn,
      brideCheckedIn,
    }
    recentCheckins.value = [...checkedIn]
      .sort((a, b) => (b.checkin_at || '').localeCompare(a.checkin_at || ''))
      .slice(0, 10)
    lastRefreshedAt.value = new Date().toLocaleTimeString('zh-TW')
    nextRefreshAt.value = Date.now() + refreshCooldownMs
  } finally {
    statLoading.value = false
  }
}

const refreshCooldownActive = computed(() => nowTick.value < nextRefreshAt.value)

loadStats()
onBeforeUnmount(() => {
  clearInterval(ticker)
})
</script>

<template>
  <v-card class="pa-6">
    <h1 class="text-h5 mb-4">簽到監看</h1>
    <p class="mb-4">顯示已簽到/未簽到統計，並提供接待人員連結管理。</p>
    <v-row class="mb-2">
      <v-col cols="6" md="2">
        <v-card variant="tonal" class="pa-3">
          <div class="text-caption">總人數</div>
          <div class="text-h6">{{ statLoading ? '-' : stats.total }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="2">
        <v-card variant="tonal" class="pa-3">
          <div class="text-caption">已簽到</div>
          <div class="text-h6">{{ statLoading ? '-' : stats.checkedIn }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="2">
        <v-card variant="tonal" class="pa-3">
          <div class="text-caption">未簽到</div>
          <div class="text-h6">{{ statLoading ? '-' : stats.pending }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card variant="tonal" class="pa-3">
          <div class="text-caption">男方已簽到</div>
          <div class="text-h6">{{ statLoading ? '-' : stats.groomCheckedIn }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card variant="tonal" class="pa-3">
          <div class="text-caption">女方已簽到</div>
          <div class="text-h6">{{ statLoading ? '-' : stats.brideCheckedIn }}</div>
        </v-card>
      </v-col>
    </v-row>
    <div class="d-flex ga-3 flex-wrap">
      <v-btn variant="tonal" :disabled="loading" @click="loadLinks">
        {{ loading ? '載入中...' : '取得接待連結' }}
      </v-btn>
      <v-btn variant="outlined" :disabled="statLoading || refreshCooldownActive" @click="loadStats">
        {{ statLoading ? '更新中...' : refreshCooldownActive ? '請稍候再更新' : '更新統計' }}
      </v-btn>
    </div>
    <div class="text-caption mt-2">最近更新：{{ lastRefreshedAt || '-' }}</div>

    <v-list v-if="links" class="mt-4" lines="three">
      <v-list-item
        title="掃碼簽到連結"
        :subtitle="links.scan"
        @click="copyLink(links.scan, '掃碼簽到連結')"
      />
      <v-list-item
        title="男方接待連結"
        :subtitle="links.host_groom"
        @click="copyLink(links.host_groom, '男方接待連結')"
      />
      <v-list-item
        title="女方接待連結"
        :subtitle="links.host_bride"
        @click="copyLink(links.host_bride, '女方接待連結')"
      />
    </v-list>

    <v-card class="mt-6" variant="outlined">
      <v-card-title>最近簽到紀錄</v-card-title>
      <v-table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>桌次</th>
            <th>方別</th>
            <th>簽到時間</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!recentCheckins.length">
            <td colspan="4">目前尚無簽到紀錄</td>
          </tr>
          <tr v-for="guest in recentCheckins" :key="guest.guest_key">
            <td>{{ guest.name }}</td>
            <td>{{ guest.table }}</td>
            <td>{{ guest.side || '-' }}</td>
            <td>{{ guest.checkin_at || '-' }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-alert v-if="copied" class="mt-4" type="success" variant="tonal">{{ copied }}</v-alert>
  </v-card>
</template>
