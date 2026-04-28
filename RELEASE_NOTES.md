# Release Notes (Draft)

## v0.3.0 - Product Skeleton to Usable Demo

### Highlights
- 完成多頁路由架構（公開頁、後台、接待頁、掃碼頁）。
- 完成帳號流程骨架（註冊、登入、忘記密碼、OTP 驗證流程）。
- 完成 Apps Script API service 層，支援 `mock` / `api` / `auto` 模式切換。
- 完成公開查詢頁與後台基本流程（Sheet 驗證、分享連結、簽到監看）。
- 完成接待簽到流程（掃碼頁 + 手動簽到頁）與核心 UX 補強。

### New
- `src/services/apiClient.js`
  - API call 與 fallback mock 統一封裝。
  - 新增 OTP、Sheet、LINE 分享、簽到等方法。
- `src/stores/auth.js`
  - 登入狀態與 token 管理。
- `src/layouts/AppDashboardLayout.vue`
  - 後台主版面與模式標籤（API/MOCK/AUTO）。
- 多個新頁面（登入、註冊、活動管理、簽到監看、接待頁等）。

### UX Improvements
- 掃碼頁支援：
  - 鏡頭啟動與 fallback 手動輸入。
  - 自動掃描（支援 `BarcodeDetector` 時）。
  - 成功音效與震動開關。
  - 掃碼冷卻秒數可調整。
  - 最近掃碼紀錄與提示自動消退。
- 接待頁支援：
  - 男方/女方分流。
  - 桌次分組 / 表格切換。
  - 搜尋、狀態篩選、排序、僅顯示未簽到。
- 簽到監看頁支援：
  - 即時統計卡。
  - 最近簽到紀錄。
  - 手動更新節流（避免過度刷新）。

### Dev Experience
- 新增 `.env.example`。
- `README.md` 重寫為可交接版本（啟動、模式切換、測試路徑）。
- `.gitignore` 更新（忽略 `.env*`，保留 `.env.example`）。

### Known Limitations
- 目前 QR 產生/下載為示範 UI，尚未串接真實檔案輸出。
- 掃碼頁目前使用瀏覽器能力，裝置差異仍需真機驗證。
- 後台活動資料多為示範資料，待接入實際 API 與持久化。

### Next Suggested Steps
1. 串接真實 Apps Script API（`VITE_API_MODE=api`）。
2. 補齊 QR 圖卡匯出與下載任務流程。
3. 增加 E2E 自動化測試（登入、查詢、簽到三條主路徑）。
