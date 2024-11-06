<template>
  <v-container class="wedding-theme">
    <h1 class="title">婚宴賓客座位查詢</h1>

    <div v-if="!showResult" :class="['search-container', fadeClass]">
      <v-text-field
        v-model="searchName"
        label="請輸入賓客姓名 🌸"
        clearable
        class="search-input"
        variant="outlined"
        hide-details
      ></v-text-field>
      <v-btn @click="onSearch" class="search-btn" outlined> 搜尋 </v-btn>
    </div>

    <div v-else-if="showResult && result" :class="['result-card', fadeClass]">
      <v-card-title class="guest-name">
        <span class="guest-name-main">{{ result.name }}</span>
        <span v-if="result.title" class="guest-title">{{ result.title }} 您好!</span>
      </v-card-title>

      <v-card-text>
        <p class="welcome-message">您的座位在</p>
        <p class="guest-table">{{ result.table }} 🥂</p>
        <p class="welcome-message">💖 歡迎來到我們的婚禮💖</p>
      </v-card-text>
      <v-btn @click="resetSearch" class="back-btn">返回</v-btn>
    </div>

    <v-alert v-else-if="searchName && !result && showResult" :class="['no-result', fadeClass]">
      很抱歉，查詢不到相關姓名 💐
      <br />
      請點擊「返回」再試一次喔！💖
      <br />
      或詢問現場招待人員，感恩。💍
      <v-btn color="pink" @click="resetSearch" class="back-btn">返回</v-btn>
    </v-alert>
  </v-container>
</template>

<script setup>
import { ref, nextTick } from 'vue'

import guestList from '@/assets/guest_list.json'

const searchName = ref('')
const result = ref(null)
const showResult = ref(false)
const fadeClass = ref('') // 用來控制動畫類名

const onSearch = async () => {
  fadeClass.value = 'fade-out' // 先淡出
  await nextTick() // 等待 DOM 更新
  setTimeout(() => {
    result.value = guestList.data.find((guest) => guest.name.includes(searchName.value))
    showResult.value = true
    fadeClass.value = 'fade-in' // 淡入新結果
  }, 300) // 控制淡出時間
}

const resetSearch = async () => {
  fadeClass.value = 'fade-out' // 先淡出
  await nextTick()
  setTimeout(() => {
    searchName.value = ''
    result.value = null
    showResult.value = false
    fadeClass.value = 'fade-in' // 回到搜尋頁面時淡入
  }, 300)
}
</script>

<style scoped>
.wedding-theme {
  height: 100vh;
  position: relative;
  padding: 40px;
  overflow: hidden;
}

.wedding-theme::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/src/assets/bg-img2.jpg'); /* 背景圖案 */
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 1;
}

.wedding-theme > * {
  position: relative;
  z-index: 2;
}

.title {
  font-family: 'Dancing Script', cursive;
  color: #d63384;
  font-size: 2em;
  margin-bottom: 20px;
  text-align: center;
}

.search-input {
  margin-bottom: 20px;
  font-size: 1.2em;
}

.result-card {
  background-color: #ffedef;
  border: 2px solid #d63384;
  border-radius: 15px;
  color: #5a2a62;
  padding: 20px;
}

.guest-name {
  font-size: 1em;
  font-weight: bold;
  color: #d63384;
  display: flex;
  justify-content: center;
  align-items: center;
}

.guest-name-main {
  font-size: 1.8em;
}

.guest-title {
  font-size: 1.4em;
  color: #ff82a9; /* 粉紅色 */
  margin-left: 5px;
}

.guest-table {
  font-size: 1.8em;
  color: #5a2a62;
  text-align: center;
  margin-top: 10px;
  background: white;
  border-radius: 5px;
  border: 1px solid #5a2a62;
}

.welcome-message {
  font-size: 1.2em;
  text-align: center;
  color: #5a2a62;
  margin-top: 15px;
}

/* 定義淡入和淡出動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 淡入淡出的類 */
.fade-in {
  animation: fadeIn 0.5s ease forwards;
}

.fade-out {
  animation: fadeOut 0.3s ease forwards;
}

.no-result {
  background-color: #ffe6f0; /* 柔和的粉白色背景 */
  color: #cc6699; /* 細緻的粉紅色字體 */
  border: 1px solid #f2a8c1; /* 輕微的粉色邊框 */
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  font-family: 'Dancing Script', cursive; /* 手寫風格字體 */
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
}

.back-btn {
  margin-top: 10px;
  color: #ffffff;
  background-color: #d63384; /* 按鈕淡粉紅色背景 */
  width: 100%;
}

/* 搜尋按鈕 */
.search-btn {
  background: linear-gradient(to right, #ff9bcb, #ffd9e6); /* 粉紅色到粉白色漸變 */
  color: #ffffff; /* 文字顏色 */
  border-radius: 5px; /* 輪廓圓滑 */
  padding: 10px 20px; /* 增加內邊距 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 輕微陰影效果 */
  transition: all 0.3s ease; /* 平滑過渡 */
  width: 100%;
  color: #5a2a62;
}

.search-btn:hover {
  background: linear-gradient(to right, #ff80ab, #ffe6f2); /* 更深的漸變色，為懸停效果 */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3); /* 增加陰影 */
}
</style>
