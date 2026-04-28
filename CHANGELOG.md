# Changelog

All notable changes to this project are documented in this file.

## [0.3.0] - 2026-04-28

### Added
- 建立完整產品企劃書 `PROJECT_PROPOSAL.md`（含產品策略、架構、資料規格、API 規格、簽到流程、驗收標準）。
- 建立對外版發版說明 `RELEASE_NOTES.md`。
- 建立開發模式環境範本 `.env.example`。
- 新增 API 模式切換能力（`VITE_API_MODE=mock|api|auto`）。
- 新增後台框架、登入註冊流程、公開查詢頁、接待掃碼頁、接待人員頁等多頁路由骨架。
- 新增簽到監看統計卡、最近簽到紀錄、接待連結管理。
- 新增掃碼成功回饋（音效/震動）、冷卻秒數調整、掃碼歷史紀錄。

### Changed
- `README.md` 由模板改寫為可交接文件（啟動流程、環境切換、測試路徑）。
- `src/services/appsScriptApi.js` 重構為統一 API/Mock 模式與 fallback 行為。
- `src/views` 多數頁面補齊 loading/error/empty 狀態。
- `.gitignore` 增加 `.env` 系列忽略規則，保留 `.env.example`。

### Notes
- 目前維持可演示與可串接狀態；部分流程仍為示範 UI（例如 QR 圖卡實際下載任務）。
- 切換真實後端時，建議先使用 `VITE_API_MODE=auto` 進行漸進驗證。
