# Wedding Seat Search

婚宴座位查詢系統（Vue 3 + Vite + Vuetify），目前已具備：
- Landing Page 與後台骨架
- 註冊/登入/OTP（含 mock 流程）
- Google Sheet/Drive 串接 API service（可 mock 或真實 API）
- 公開查詢頁、接待簽到頁、接待人員頁
- 簽到統計、接待連結管理、QR 流程骨架

> 後端方向已改為自製 server（部署到 EC2）。前端使用通用 API base URL 串接。

## 1. 開發環境需求

- Node.js 18+
- npm 9+

## 2. 安裝與啟動

```sh
npm install
cp .env.example .env
npm run dev
```

預設開發網址（由 `vite.config.js` 設定）：
- `http://localhost:3000`

## 3. 環境變數

請在 `.env` 設定以下變數：

```env
VITE_API_MODE=auto
VITE_API_BASE_URL=
```

### `VITE_API_MODE`

- `mock`：只使用本地 mock（不呼叫後端）
- `api`：只呼叫 API（失敗不 fallback）
- `auto`：先呼叫 API，失敗時 fallback mock（建議開發預設）

### `VITE_API_BASE_URL`

自製後端（EC2）API base URL。  
例如：
`https://api.your-domain.com`

## 4. 常用指令

```sh
npm run dev
npm run lint
npm run build
npm run preview
```

## 5. 功能測試路徑（手動）

### 公開頁
- Landing：`/`
- 查詢頁：`/e/demo`

### 帳號流程
- 註冊：`/register`
- 登入：`/login`
- 忘記密碼：`/forgot-password`

> Mock OTP 驗證碼：`123456`

### 後台（需先登入）
- 後台首頁：`/app`
- 活動列表：`/app/events`
- 建立活動：`/app/events/new`
- 活動設定（示例）：`/app/events/demo/settings`
- Sheet 連線（示例）：`/app/events/demo/sheet`
- 發布分享（示例）：`/app/events/demo/publish`
- QR 圖卡（示例）：`/app/events/demo/qrcards`
- 簽到監看（示例）：`/app/events/demo/checkins`

### 接待流程
- 掃碼簽到（示例）：`/reception/scan/mock-token-demo?eventSlug=demo`
- 接待人員（示例）：`/reception/host/groom-mock-demo?eventSlug=demo`

## 6. 掃碼與接待測試建議

- 掃碼頁支援：
  - 鏡頭模式（瀏覽器支援 `BarcodeDetector` 時自動偵測）
  - 手動輸入 payload fallback
- 可調整掃碼冷卻秒數，預設 2 秒
- 可開關成功音效與震動
- 接待頁支援：
  - 男方/女方分流
  - 桌次分組與表格兩種檢視
  - 僅看未簽到快速篩選

## 7. 目前狀態說明

- 專案已具備完整前端流程與 mock 演練能力
- 若要切真實後端，只需：
  1. 設好 `VITE_API_BASE_URL`
  2. 將 `VITE_API_MODE` 切到 `api` 或 `auto`

## 8. 文件

- 產品企劃書：`PROJECT_PROPOSAL.md`
- Google Sheet 規格書：`GOOGLE_SHEET_SCHEMA_SPEC.md`
