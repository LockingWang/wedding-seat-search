<template>
  <v-card class="pa-6">
    <h1 class="text-h5 mb-2">活動設定</h1>
    <p class="mb-4">管理活動名稱、主題顏色、圖片連結與分享文案。</p>
    <div class="d-flex ga-3 flex-wrap">
      <v-btn variant="tonal" :to="`${$route.path.replace('/settings', '/sheet')}`">前往資料連線</v-btn>
      <v-btn color="primary" :to="`${$route.path.replace('/settings', '/publish')}`">前往發布分享</v-btn>
    </div>
  </v-card>
</template>
