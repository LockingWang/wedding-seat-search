<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { checkinScan } from '@/services/appsScriptApi'

const route = useRoute()
const qrPayload = ref('')
const loading = ref(false)
const result = ref(null)
const errorMessage = ref('')
const cameraState = ref('idle')
const scannedValue = ref('')
const videoEl = ref(null)
const scanInterval = ref(null)
const streamRef = ref(null)
const detectorSupported = ref(false)
const autoScanEnabled = ref(false)
const cooldownUntil = ref(0)
const nowTick = ref(Date.now())
const cooldownTimer = ref(null)
const enableSound = ref(true)
const enableVibrate = ref(true)
const cooldownSeconds = ref(2)
const scanHistory = ref([])
const resultHideTimer = ref(null)
const errorHideTimer = ref(null)

const eventSlug = computed(() => route.query.eventSlug || 'demo')
const token = computed(() => route.params.token)
const cooldownActive = computed(() => nowTick.value < cooldownUntil.value)

function mapErrorMessage(err) {
  if (err?.message === 'TOKEN_EXPIRED') {
    return '簽到連結已過期，請向主辦方重新取得。'
  }
  return err?.message || '掃碼失敗'
}

async function onScan(payload = qrPayload.value) {
  if (cooldownActive.value) return
  if (!payload) return
  loading.value = true
  errorMessage.value = ''
  try {
    const scanResult = await checkinScan(eventSlug.value, token.value, payload)
    result.value = scanResult
    scannedValue.value = payload
    cooldownUntil.value = Date.now() + cooldownSeconds.value * 1000
    scanHistory.value = [
      {
        id: Date.now(),
        payload,
        name: scanResult?.name || scanResult?.guest_key || payload,
        table: scanResult?.table || 'N/A',
        scannedAt: new Date().toLocaleTimeString('zh-TW'),
      },
      ...scanHistory.value,
    ].slice(0, 10)
    if (enableVibrate.value && navigator.vibrate) {
      navigator.vibrate(80)
    }
    if (enableSound.value) {
      playBeep()
    }
    if (resultHideTimer.value) clearTimeout(resultHideTimer.value)
    resultHideTimer.value = setTimeout(() => {
      result.value = null
    }, 2500)
  } catch (err) {
    result.value = null
    errorMessage.value = mapErrorMessage(err)
    if (errorHideTimer.value) clearTimeout(errorHideTimer.value)
    errorHideTimer.value = setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  } finally {
    loading.value = false
  }
}

function playBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 1046
    gain.gain.value = 0.06
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.12)
  } catch {
    // ignore audio permission/support issues
  }
}

async function runBarcodeDetection() {
  if (!videoEl.value || loading.value || cooldownActive.value) return
  try {
    const BarcodeDetectorClass = window.BarcodeDetector
    if (!BarcodeDetectorClass) return
    const detector = new BarcodeDetectorClass({
      formats: ['qr_code'],
    })
    const barcodes = await detector.detect(videoEl.value)
    if (!barcodes?.length) return
    const nextPayload = String(barcodes[0].rawValue || '').trim()
    if (!nextPayload || nextPayload === scannedValue.value) return
    qrPayload.value = nextPayload
    await onScan(nextPayload)
  } catch {
    // ignore intermittent detector errors
  }
}

function stopCamera() {
  if (scanInterval.value) {
    clearInterval(scanInterval.value)
    scanInterval.value = null
  }
  if (streamRef.value) {
    streamRef.value.getTracks().forEach((track) => track.stop())
    streamRef.value = null
  }
  cameraState.value = 'idle'
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraState.value = 'unsupported'
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    streamRef.value = stream
    if (videoEl.value) videoEl.value.srcObject = stream
    cameraState.value = 'active'
    detectorSupported.value = 'BarcodeDetector' in window
    autoScanEnabled.value = detectorSupported.value
    if (autoScanEnabled.value) {
      scanInterval.value = setInterval(runBarcodeDetection, 800)
    }
  } catch {
    cameraState.value = 'denied'
  }
}

function toggleCamera() {
  if (cameraState.value === 'active') {
    stopCamera()
  } else {
    startCamera()
  }
}

onMounted(startCamera)
onMounted(() => {
  cooldownTimer.value = setInterval(() => {
    nowTick.value = Date.now()
  }, 250)
})

onBeforeUnmount(() => {
  stopCamera()
  if (cooldownTimer.value) {
    clearInterval(cooldownTimer.value)
    cooldownTimer.value = null
  }
  if (resultHideTimer.value) {
    clearTimeout(resultHideTimer.value)
    resultHideTimer.value = null
  }
  if (errorHideTimer.value) {
    clearTimeout(errorHideTimer.value)
    errorHideTimer.value = null
  }
})
</script>

<template>
  <v-container class="py-6">
    <v-card class="pa-6">
      <h1 class="text-h5 mb-2">掃碼簽到頁</h1>
      <p class="mb-4">可直接啟動鏡頭，若裝置不支援可改手動輸入 QR payload。</p>
      <video
        ref="videoEl"
        class="scan-preview mb-4"
        autoplay
        muted
        playsinline
        v-show="cameraState === 'active'"
      />
      <v-alert v-if="cameraState === 'unsupported'" type="warning" variant="tonal" class="mb-4">
        目前裝置不支援鏡頭掃碼，請改用手動輸入。
      </v-alert>
      <v-alert v-if="cameraState === 'denied'" type="warning" variant="tonal" class="mb-4">
        尚未取得相機權限，請允許後再試。
      </v-alert>
      <div class="mb-4">
        <v-btn variant="outlined" @click="toggleCamera">
          {{ cameraState === 'active' ? '關閉鏡頭' : '啟動鏡頭' }}
        </v-btn>
      </div>
      <div class="d-flex ga-4 mb-4">
        <v-switch v-model="enableSound" label="成功音效" color="primary" hide-details />
        <v-switch v-model="enableVibrate" label="成功震動" color="primary" hide-details />
      </div>
      <v-select
        v-model="cooldownSeconds"
        class="mb-4"
        :items="[1, 2, 3, 4, 5]"
        label="掃描冷卻秒數"
        density="comfortable"
      />
      <v-alert
        v-if="cameraState === 'active' && !detectorSupported"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        目前瀏覽器不支援自動條碼偵測，請改用手動輸入。
      </v-alert>
      <v-alert
        v-if="cameraState === 'active' && detectorSupported"
        type="success"
        variant="tonal"
        class="mb-4"
      >
        自動掃描啟用中，鏡頭偵測到 QR 後會自動簽到。
      </v-alert>
      <v-text-field v-model="qrPayload" label="QR Payload（例如 g_001 或 王小明）" />
      <v-btn color="primary" :disabled="loading" @click="onScan">
        {{ loading ? '簽到中...' : '模擬掃碼簽到' }}
      </v-btn>
      <div v-if="cooldownActive" class="text-caption mt-1">
        為避免重複簽到，掃描冷卻中...
      </div>
      <div v-if="scannedValue" class="text-caption mt-2">最近掃描：{{ scannedValue }}</div>

      <v-alert v-if="result" class="mt-4" type="success" variant="tonal">
        簽到成功：{{ result.name || result.guest_key }}（{{ result.table || 'N/A' }}）
      </v-alert>
      <v-alert v-if="errorMessage" class="mt-4" type="error" variant="tonal">
        {{ errorMessage }}
      </v-alert>

      <v-card class="mt-6" variant="outlined">
        <v-card-title>最近掃碼紀錄（最多 10 筆）</v-card-title>
        <v-table>
          <thead>
            <tr>
              <th>時間</th>
              <th>賓客</th>
              <th>桌次</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!scanHistory.length">
              <td colspan="4">目前尚無掃碼紀錄</td>
            </tr>
            <tr v-for="row in scanHistory" :key="row.id">
              <td>{{ row.scannedAt }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.table }}</td>
              <td>{{ row.payload }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </v-card>
  </v-container>
</template>

<style scoped>
.scan-preview {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 12px;
  background: #111;
}
</style>
