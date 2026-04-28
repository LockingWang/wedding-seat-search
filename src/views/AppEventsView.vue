<script setup>
import { onMounted, ref } from 'vue'

const loading = ref(false)
const events = ref([])

async function loadEvents() {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    events.value = [{ slug: 'demo', name: '示範婚宴活動', status: '草稿' }]
  } finally {
    loading.value = false
  }
}

onMounted(loadEvents)
</script>

<template>
  <v-card class="pa-6">
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">活動列表</h1>
      <v-btn color="primary" to="/app/events/new">建立活動</v-btn>
    </div>
    <v-progress-linear v-if="loading" indeterminate class="mb-4" />
    <v-alert v-else-if="!events.length" type="info" variant="tonal" class="mb-4">
      目前還沒有活動，請先建立第一個活動。
    </v-alert>
    <v-table v-else>
      <thead>
        <tr>
          <th>活動名稱</th>
          <th>狀態</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in events" :key="event.slug">
          <td>{{ event.name }}</td>
          <td>{{ event.status }}</td>
          <td><router-link :to="`/app/events/${event.slug}/settings`">前往設定</router-link></td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>
