<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { checkinManual, getReceptionGuests } from '@/services/apiClient'

const route = useRoute()
const side = ref('all')
const keyword = ref('')
const statusFilter = ref('all')
const sortBy = ref('table')
const viewMode = ref('grouped')
const quickPendingOnly = ref(false)
const loading = ref(false)
const guests = ref([])
const message = ref('')
const errorMessage = ref('')

const eventSlug = computed(() => route.query.eventSlug || 'demo')
const token = computed(() => route.params.token)

const filteredGuests = computed(() => {
  let list = [...guests.value]

  if (side.value !== 'all') {
    list = list.filter((g) => g.side === side.value)
  }

  if (quickPendingOnly.value) {
    list = list.filter((g) => g.checkin_status === 'pending')
  } else if (statusFilter.value !== 'all') {
    list = list.filter((g) => g.checkin_status === statusFilter.value)
  }

  const q = keyword.value.trim().toLowerCase()
  if (q) {
    list = list.filter((g) => `${g.name} ${g.table}`.toLowerCase().includes(q))
  }

  if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
  } else if (sortBy.value === 'checkin_at') {
    list.sort((a, b) => (b.checkin_at || '').localeCompare(a.checkin_at || ''))
  } else {
    list.sort((a, b) => String(a.table).localeCompare(String(b.table), 'zh-Hant'))
  }

  return list
})

const groupedByTable = computed(() => {
  const groups = new Map()
  filteredGuests.value.forEach((guest) => {
    const key = guest.table || '未指定桌次'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(guest)
  })

  return Array.from(groups.entries())
    .sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'zh-Hant'))
    .map(([table, members]) => ({ table, members }))
})

async function loadGuests() {
  loading.value = true
  try {
    guests.value = await getReceptionGuests(eventSlug.value, 'all')
  } finally {
    loading.value = false
  }
}

async function onManualCheckin(guest) {
  errorMessage.value = ''
  message.value = ''
  try {
    const res = await checkinManual(eventSlug.value, token.value, guest.guest_key)
    guest.checkin_status = res.checkin_status
    guest.checkin_at = res.checkin_at
    message.value = `${guest.name} 簽到成功`
  } catch (err) {
    errorMessage.value = err.message === 'TOKEN_EXPIRED' ? '接待連結已過期，請重新取得。' : err.message || '簽到失敗'
  }
}

onMounted(loadGuests)
</script>

<template>
  <v-container class="py-6">
    <v-card class="pa-6">
      <h1 class="text-h5 mb-2">接待人員頁</h1>
      <p class="mb-4">可依男方/女方分流，並手動點擊簽到。</p>

      <v-btn-toggle v-model="side" mandatory class="mb-4">
        <v-btn value="all">全部</v-btn>
        <v-btn value="groom">男方</v-btn>
        <v-btn value="bride">女方</v-btn>
      </v-btn-toggle>
      <v-btn-toggle v-model="viewMode" mandatory class="mb-4 ml-3">
        <v-btn value="grouped">桌次分組</v-btn>
        <v-btn value="table">清單表格</v-btn>
      </v-btn-toggle>
      <v-chip
        class="mb-4 ml-3"
        :color="quickPendingOnly ? 'primary' : undefined"
        :variant="quickPendingOnly ? 'flat' : 'outlined'"
        @click="quickPendingOnly = !quickPendingOnly"
      >
        僅顯示未簽到
      </v-chip>

      <v-row class="mb-3">
        <v-col cols="12" md="5">
          <v-text-field v-model="keyword" label="搜尋姓名或桌次" density="comfortable" hide-details />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="statusFilter"
            :items="[
              { title: '全部狀態', value: 'all' },
              { title: '未簽到', value: 'pending' },
              { title: '已簽到', value: 'checked_in' },
            ]"
            item-title="title"
            item-value="value"
            label="狀態"
            density="comfortable"
            hide-details
          />
        </v-col>
        <v-col cols="6" md="4">
          <v-select
            v-model="sortBy"
            :items="[
              { title: '依桌次排序', value: 'table' },
              { title: '依姓名排序', value: 'name' },
              { title: '依簽到時間排序', value: 'checkin_at' },
            ]"
            item-title="title"
            item-value="value"
            label="排序"
            density="comfortable"
            hide-details
          />
        </v-col>
      </v-row>

      <div v-if="viewMode === 'grouped'" class="d-grid ga-4">
        <v-card v-for="group in groupedByTable" :key="group.table" variant="outlined">
          <v-card-title>{{ group.table }}</v-card-title>
          <v-table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>方別</th>
                <th>狀態</th>
                <th>簽到時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="guest in group.members" :key="guest.guest_key">
                <td>{{ guest.name }}</td>
                <td>{{ guest.side }}</td>
                <td>{{ guest.checkin_status }}</td>
                <td>{{ guest.checkin_at || '-' }}</td>
                <td>
                  <v-btn
                    size="small"
                    color="primary"
                    :disabled="loading || guest.checkin_status === 'checked_in'"
                    @click="onManualCheckin(guest)"
                  >
                    {{ guest.checkin_status === 'checked_in' ? '已簽到' : '簽到' }}
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </div>

      <v-table v-else>
        <thead>
          <tr>
            <th>姓名</th>
            <th>桌次</th>
            <th>方別</th>
            <th>狀態</th>
            <th>簽到時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guest in filteredGuests" :key="guest.guest_key">
            <td>{{ guest.name }}</td>
            <td>{{ guest.table }}</td>
            <td>{{ guest.side }}</td>
            <td>{{ guest.checkin_status }}</td>
            <td>{{ guest.checkin_at || '-' }}</td>
            <td>
              <v-btn
                size="small"
                color="primary"
                :disabled="loading || guest.checkin_status === 'checked_in'"
                @click="onManualCheckin(guest)"
              >
                {{ guest.checkin_status === 'checked_in' ? '已簽到' : '簽到' }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <v-alert v-if="message" class="mt-4" type="success" variant="tonal">{{ message }}</v-alert>
      <v-alert v-if="errorMessage" class="mt-4" type="error" variant="tonal">
        {{ errorMessage }}
      </v-alert>
    </v-card>
  </v-container>
</template>
