<template>
  <v-container class="py-10">
    <v-row align="center">
      <v-col cols="12" md="7">
        <h1 class="text-h3 font-weight-bold mb-4">婚宴座位查詢，一頁上線</h1>
        <p class="text-subtitle-1 mb-6">
          新人可自行綁定 Google Sheet 與 Drive 圖片，快速建立查詢頁、QR 圖卡與接待簽到流程。
        </p>
        <div class="d-flex ga-3 flex-wrap">
          <v-btn color="primary" to="/register">立即免費開始</v-btn>
          <v-btn variant="outlined" to="/login">登入後台</v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="5">
        <v-card variant="tonal" class="pa-6">
          <h2 class="text-h6 mb-3">快速流程</h2>
          <ol class="pl-5">
            <li>註冊與登入</li>
            <li>建立活動並綁定 Sheet</li>
            <li>發布查詢頁與 QR / LINE 分享</li>
          </ol>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
