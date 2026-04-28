import guestList from '@/assets/guest_list.json'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_APPS_SCRIPT_BASE_URL || ''
const API_MODE = (import.meta.env.VITE_API_MODE || 'auto').toLowerCase()
const FORCE_MOCK = API_MODE === 'mock'
const FORCE_API = API_MODE === 'api'

function normalizeName(input) {
  return (input || '').trim()
}

async function apiRequest(path, { method = 'GET', token, body } = {}) {
  if (!API_BASE_URL) throw new Error('API_BASE_URL_NOT_SET')

  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    // ignore non-json responses
  }

  if (!res.ok) {
    throw new Error(json?.message || `API_ERROR_${res.status}`)
  }

  return json
}

function mockDelay() {
  return new Promise((resolve) => setTimeout(resolve, 250))
}

async function runWithMode(apiCall, mockCall) {
  if (FORCE_MOCK) {
    await mockDelay()
    return mockCall()
  }

  try {
    return await apiCall()
  } catch (err) {
    if (FORCE_API) throw err
    await mockDelay()
    return mockCall(err)
  }
}

function buildGuestKey(index) {
  return `g_${String(index + 1).padStart(3, '0')}`
}

function createMockGuests() {
  return guestList.data.map((g, index) => ({
    guest_key: buildGuestKey(index),
    name: g.name,
    title: g.title || '',
    table: g.table,
    side: index % 2 === 0 ? 'groom' : 'bride',
    checkin_status: 'pending',
    checkin_at: '',
  }))
}

function assertActiveToken(token) {
  if (!token || String(token).includes('expired')) {
    throw new Error('TOKEN_EXPIRED')
  }
}

function withEventSlug(url, eventSlug) {
  if (!url) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}eventSlug=${encodeURIComponent(eventSlug)}`
}

export async function publicSearch(eventSlug, { name }) {
  const normalized = normalizeName(name)
  if (!normalized) return null

  return runWithMode(
    async () =>
      apiRequest(`/public/events/${eventSlug}/search`, {
        method: 'POST',
        body: { name: normalized },
      }).then((r) => (r?.success ? r.data?.guest ?? null : null)),
    async () => {
      const found = guestList.data.find((g) => g.name.includes(normalized))
      if (!found) return null
      return { name: found.name, title: found.title, table: found.table }
    },
  )
}

export async function authLogin(email, password) {
  return runWithMode(
    async () => {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      if (!res?.success) throw new Error(res?.message || 'LOGIN_FAILED')
      return res.data
    },
    async () => ({
      access_token: `mock-token-${Date.now()}`,
      expires_in: 3600,
      user: { user_id: `u_mock_${Date.now()}`, email, plan_status: 'free' },
    }),
  )
}

export async function authRegister(email, password) {
  return runWithMode(
    async () => {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: { email, password },
      })

      if (!res?.success) throw new Error(res?.message || 'REGISTER_FAILED')
      return res.data
    },
    async () => ({ user_id: `u_mock_${Date.now()}`, email, email_verified: false }),
  )
}

export async function authSendOtp(email, purpose = 'register') {
  return runWithMode(
    async () => {
      const res = await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: { email, purpose },
      })
      if (!res?.success) throw new Error(res?.message || 'SEND_OTP_FAILED')
      return res.data
    },
    async () => ({
      expires_in: 300,
      next_retry_in: 30,
      otp_token: `otp_mock_${Date.now()}`,
    }),
  )
}

export async function authVerifyOtp(email, otpCode, purpose = 'register') {
  return runWithMode(
    async () => {
      const res = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: { email, otp_code: otpCode, purpose },
      })
      if (!res?.success) throw new Error(res?.message || 'VERIFY_OTP_FAILED')
      return res.data
    },
    async () => {
      if (otpCode !== '123456') {
        throw new Error('OTP 驗證失敗（Mock：請輸入 123456）')
      }
      return { verified: true }
    },
  )
}

export async function authResetPassword(email, otpCode, password) {
  return runWithMode(
    async () => {
      const res = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: { email, otp_code: otpCode, password },
      })
      if (!res?.success) throw new Error(res?.message || 'RESET_PASSWORD_FAILED')
      return res.data
    },
    async () => {
      if (otpCode !== '123456') {
        throw new Error('重設失敗（Mock：請輸入 123456）')
      }
      return { reset: true }
    },
  )
}

export async function validateSheet(eventSlug, sheetUrl) {
  return runWithMode(
    async () => {
      const res = await apiRequest(`/events/${eventSlug}/sheet/validate`, {
        method: 'POST',
        body: { sheet_url: sheetUrl },
      })
      return res?.data || null
    },
    async () => ({
      is_valid: Boolean(sheetUrl),
      sheet_id: 'mock_sheet',
      missing_columns: [],
      warnings: [],
    }),
  )
}

export async function syncSheet(eventSlug) {
  return runWithMode(
    async () => {
      const res = await apiRequest(`/events/${eventSlug}/sheet/sync`, {
        method: 'POST',
      })
      return res?.data || null
    },
    async () => ({ status: 'ok', synced_at: new Date().toISOString() }),
  )
}

export async function createLineShareLink(eventSlug, text) {
  return runWithMode(
    async () => {
      const res = await apiRequest(`/events/${eventSlug}/share/line-link`, {
        method: 'POST',
        body: { line_share_text: text },
      })
      return res?.data?.url || null
    },
    async () => `https://example.com/line-share/${eventSlug}`,
  )
}

export async function getReceptionLinks(eventSlug) {
  return runWithMode(
    async () => {
      const res = await apiRequest(`/events/${eventSlug}/reception-links`, { method: 'GET' })
      if (!res?.data) return null
      return {
        scan: withEventSlug(res.data.scan, eventSlug),
        host_groom: withEventSlug(res.data.host_groom, eventSlug),
        host_bride: withEventSlug(res.data.host_bride, eventSlug),
      }
    },
    async () => ({
      scan: withEventSlug(`https://example.com/reception/scan/mock-token-${eventSlug}`, eventSlug),
      host_groom: withEventSlug(`https://example.com/reception/host/groom-mock-${eventSlug}`, eventSlug),
      host_bride: withEventSlug(`https://example.com/reception/host/bride-mock-${eventSlug}`, eventSlug),
    }),
  )
}

export async function getReceptionGuests(eventSlug, side = 'all') {
  return runWithMode(
    async () => {
      const res = await apiRequest(`/events/${eventSlug}/checkins`, { method: 'GET' })
      const guests = res?.data?.guests || []
      if (side === 'all') return guests
      return guests.filter((g) => g.side === side)
    },
    async () => {
      const guests = createMockGuests()
      if (side === 'all') return guests
      return guests.filter((g) => g.side === side)
    },
  )
}

export async function checkinScan(eventSlug, token, qrPayload) {
  assertActiveToken(token)
  return runWithMode(
    async () => {
      const res = await apiRequest('/checkins/scan', {
        method: 'POST',
        body: { event_slug: eventSlug, scanner_token: token, qr_payload: qrPayload },
      })
      return res?.data || null
    },
    async () => {
      const match = createMockGuests().find((g) => g.guest_key === qrPayload || g.name === qrPayload)
      if (!match) {
        throw new Error('無效 QR 或查無賓客')
      }
      return {
        guest_key: match.guest_key,
        checkin_status: 'checked_in',
        checkin_at: new Date().toISOString(),
        is_duplicate: false,
        name: match.name,
        table: match.table,
      }
    },
  )
}

export async function checkinManual(eventSlug, token, guestKey) {
  assertActiveToken(token)
  return runWithMode(
    async () => {
      const res = await apiRequest('/checkins/manual', {
        method: 'POST',
        body: { event_slug: eventSlug, host_token: token, guest_key: guestKey },
      })
      return res?.data || null
    },
    async () => {
      const match = createMockGuests().find((g) => g.guest_key === guestKey)
      if (!match) {
        throw new Error('找不到賓客資料')
      }
      return {
        guest_key: guestKey,
        checkin_status: 'checked_in',
        checkin_at: new Date().toISOString(),
        checkin_channel: 'host_click',
      }
    },
  )
}
