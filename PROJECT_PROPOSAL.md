# 婚宴座位查詢平台企劃書（Google Sheets 純讀取版草案）

## 1) 產品願景與定位
- 將座位查詢從一次性網頁升級為可重複使用、可自助管理、可商業化的服務平台。
- 平台不提供名單編輯，改由使用者自行在 Google Sheets 維護資料，平台只做格式驗證與讀取展示。
- 讓不懂技術的使用者也能在 10-20 分鐘內完成建立活動、綁定 Sheet、發布查詢頁。
- 平台前端維持純靜態部署，帳號與資料存取邏輯由 Google Apps Script + Google Sheets 承擔。
- 核心價值為降低現場接待壓力、提升賓客體驗、快速上線。

## 2) 目標使用者
- 新人與婚禮籌備者（主要決策者）。
- 代辦者（如婚顧、親友）可協助操作，但產品定位仍以新人帳戶為中心，計費依活動數量計算。
- 賓客（僅需掃描 QR Code 查詢，不需登入）。

## 3) 主要使用情境
- 新訪客進入 Landing Page，先了解產品價值、使用流程與常見問題，再決定註冊。
- 新人建立婚宴活動，設定婚紗照與主題色。
- 新人依規範建立 Google Sheet 並開啟共用權限，將 Sheet 連結貼到平台。
- 新人將婚紗照上傳到自己的 Google Drive，將圖片分享連結填入指定工作表欄位。
- 平台驗證欄位格式與可讀性，成功後建立公開查詢頁。
- 一鍵產生 QR Code（可下載印製），或產生 LINE 分享連結（可自訂分享內文）。
- 賓客到場掃碼開啟查詢頁，輸入姓名或識別資訊查座位。
- 若要改名單，主辦方直接在 Google Sheet 修改，平台僅重新讀取。
- 管理端可一鍵下載全賓客 QR 圖卡（含 QR Code、賓客姓名、桌號）供現場列印。
- 現場可使用掃碼簽到頁，開啟即啟動鏡頭，掃碼成功後自動將該賓客標記為已簽到。
- 提供接待人員專用連結，選擇男方或女方後，可依桌次查看賓客並手動點擊簽到。

## 4) 功能規劃（分階段）

### MVP（第一階段，最小可行）
- 行銷型 Landing Page（產品介紹、特色、方案、操作流程、FAQ、註冊 CTA）。
- 管理者註冊/登入。
- Email 驗證碼註冊與登入（OTP）。
- 建立活動（活動名稱、日期、場地、封面照/婚紗照）。
- Google Sheet 綁定（貼上連結、權限檢查、欄位格式驗證）。
- Google Drive 圖片連結欄位（分享連結轉換為可顯示 URL）。
- 公開查詢頁（姓名查詢、查無提示、返回重查）。
- QR Code 產生與下載（PNG/SVG）。
- LINE 分享連結產生（可自訂分享內文）。
- 活動頁面基礎客製（Logo、主圖、主色系）。
- 設定頁內建教學（步驟導引、欄位範例、錯誤排除提示）。
- 基本後台儀表（查詢次數、時段分佈、最近同步狀態）。

### V1（第二階段，商用可用）
- Google Sheets 持續同步（唯讀快取與失敗重試）。
- 多活動管理（同帳號可管理多場活動）。
- 權限機制維持單一角色 `owner`（帳戶擁有者），但資料結構保留角色欄位以支援未來擴充。
- 密碼重設與裝置風險控管（異常登入驗證碼）。
- 進階查詢策略（同名消歧、別名、手機末碼）。
- 列印素材中心（多款 QR 海報模板）。
- 一鍵下載全賓客 QR 圖卡（圖片含 QR、姓名、桌號，支援批次匯出 ZIP）。
- 掃碼簽到系統（開啟頁面即啟鏡頭、掃到即簽到、避免重複簽到）。
- 接待人員專用連結（男方/女方分流、依桌次名單檢視、手動簽到）。
- 手機優化與弱網快取。

### V2（第三階段，擴展）
- 付費開通機制（依活動數量計費，達流量門檻後啟用）。
- 簽到統計強化（時段分佈、未到名單、男方/女方到場率）。
- 通知整合（LINE/Email 發送查詢連結）。
- API 與 webhook（串接外部系統）。

## 5) 系統架構建議
- 前端：Vue 3 + Vuetify（延續現有技術）。
- 後端：Google Apps Script Web App（作為 API 層）。
- 資料儲存：Google Sheets（帳號、活動、設定、日誌；不存完整賓客主檔於平台 DB）。
- 檔案儲存：婚紗照可先採 Google Drive 公開連結或上傳到指定雲端空間。
- 第三方整合：Google Sheets API（讀取賓客資料）與 GmailApp（寄送驗證碼）。
- 部署：前端 Vercel/Cloudflare Pages，API 以 Apps Script Web App 發布。

## 5.1) 架構說明（純前端 + Apps Script）
- 瀏覽器前端僅呼叫 Apps Script API，不直接持有 Google 主帳號敏感憑證。
- Apps Script 負責註冊、登入、發碼、驗碼、活動設定、Sheet 連線測試與查詢代理。
- Google Sheets 分表建議：`users`、`events`、`sheet_connections`、`otp_codes`、`query_logs`、`sync_logs`。
- 來賓查詢流程可走「前端 -> Apps Script -> 目標 Sheet」，避免直接暴露來源 Sheet 結構。

## 6) 資料模型（核心）
- `users`：帳號資料（email、password_hash、email_verified、plan_status）。
- `events`：活動資料（名稱、日期、主題、公開 slug、sheet 設定）。
- `sheet_connections`：Google Sheet 連結資訊（sheetId、工作表名稱、欄位映射、同步狀態）。
- `event_members`：目前僅存 `owner`（帳戶擁有者）關聯；保留 `role`、`status` 等欄位供未來擴充。
- `query_logs`：查詢紀錄（匿名化與統計，不記錄完整個資）。
- `sync_logs`：同步與驗證錯誤紀錄。
- `otp_codes`：驗證碼記錄（email、code_hash、expires_at、attempt_count、used_at）。
- `guest_checkins`：簽到紀錄（guest_key、checkin_status、checkin_at、checkin_by、checkin_channel）。

## 7) QR Code 與現場流程設計
- 每個活動提供唯一公開查詢網址，例如 `/e/{eventSlug}`。
- 後台一鍵產生 QR Code，支援 PNG/SVG/PDF。
- 支援一鍵批次產生全賓客 QR 圖卡（每張含 QR、賓客姓名、桌號）並下載 ZIP。
- 可搭配短網址以提升掃描容錯率。
- 現場建議至少兩個掃碼點（入口、接待台）。
- 同名率高時，查詢頁加入第二驗證欄位（手機末碼等）。
- 名單異動流程固定為「更新 Google Sheet -> 平台自動/手動重新讀取」。

## 7.1) 掃碼簽到與接待流程
- 簽到頁開啟後預設啟動相機，對準賓客 QR 後即執行簽到。
- 掃碼成功時，系統將該賓客 `checkin_status` 更新為「已簽到」，並記錄簽到時間與來源。
- 若重複掃到已簽到賓客，需顯示「已簽到」提示，避免重複入場紀錄。
- 提供接待人員專用頁：先選擇「男方接待」或「女方接待」，再顯示對應桌次與名單。
- 接待人員可透過名單上的簽到按鈕手動簽到，並同步寫回簽到欄位。
- 簽到與手動點擊皆需有即時回饋（成功、失敗、離線重試）。

## 8) Google Sheets 作為資料來源策略
- 採單一模式：Google Sheets 為唯一名單資料來源，平台僅唯讀。
- 使用者需依平台模板建立欄位（如 `name`, `table`, `title`, `alias`, `phone_last3`）。
- 建議擴充欄位：`side`（男方/女方）、`guest_qr_code`、`checkin_status`、`checkin_at`。
- 使用者需將 Sheet 設為「知道連結的檢視者可讀取」或授權平台服務帳號讀取。
- 平台提供連線測試、欄位驗證、預覽資料、錯誤提示。
- 同步方式建議為手動同步 + 定時同步（5-15 分鐘），並顯示最近成功同步時間。

## 8.2) 婚紗照上傳與圖片連結策略（Google Drive 自管）
- 採用使用者自有雲端空間：使用者自行上傳圖片到 Google Drive，平台不代管原始圖片檔。
- 使用者需提供可公開讀取的分享連結（至少「知道連結可檢視」）。
- 平台在讀取時將 Drive 分享連結轉為可顯示圖片 URL（例如轉為 `uc?export=view&id=...`）。
- 建議工作表欄位：`cover_image_url`（封面）、`hero_image_url`（主視覺）、`gallery_image_urls`（多張，以逗號分隔）。
- 驗證規則：網址格式、是否可讀、檔案類型為圖片、檔案大小建議上限（例如 2MB）。
- 顯示策略：若連結失效或權限變更，前端顯示預設圖片並提示管理者修正連結。

## 8.1) 帳號密碼與驗證碼流程（Apps Script）
- 註冊：使用者輸入 email + password，Apps Script 建立帳號並寄送 OTP 驗證碼。
- 驗證：使用者輸入 OTP，Apps Script 驗證成功後將 `email_verified` 設為 true。
- 登入：先檢查密碼雜湊，再回傳短效 session token（建議 JWT 或自訂簽章 token）。
- 忘記密碼：寄送 OTP，驗證後可重設密碼。
- 驗證碼安全策略：5 分鐘有效、錯誤次數上限、重送間隔、單日寄送上限。

## 9) 安全與法規
- 管理後台強制登入（帳號密碼 + Email 驗證碼）。
- API 需具備限流、查詢防濫用與基本 WAF 能力。
- 查詢頁僅返回必要欄位，避免過度曝露個資。
- 平台不保存完整賓客主檔，活動結束後可清除快取與連線資訊。
- 設定日誌匿名化與保存週期（例如 90 天）。
- 密碼不可明文保存，需使用雜湊（建議 bcrypt 或等效方案）。
- Apps Script 端要做 CORS 白名單與簽章驗證，避免 API 被任意網站濫用。

## 10) 商業模式建議
- 現階段全部功能維持免費，用於驗證需求與累積流量。
- 當流量達到預設門檻後，啟用「固定金額開通功能」機制。
- 計費單位為活動數量（每建立或開通一場活動計費），不以使用者身份區分。
- 婚顧或代辦者若要協助新人操作，仍比照一般用戶流程與同一計費規則。
- 功能開通建議採「按活動解鎖」：未開通活動可編輯設定，但發布與分享功能需開通後使用。

## 11) 開發時程建議（高層）
- 第 0 階段（1 週）：需求凍結、流程稿、資料模型定稿。
- 第 1 階段（2-3 週）：MVP 核心功能 + Apps Script API + OTP 驗證上線。
- 第 2 階段（1-2 週）：Google Sheets、權限、安全強化與優化。
- 第 3 階段（1 週）：壓測、資安檢查、上線文件。

## 12) 成功指標（KPI）
- 活動建立完成率 > 80%。
- Sheet 連線成功率 > 95%。
- 查詢頁首屏載入 < 2 秒（行動網路）。
- 現場查詢成功率 > 98%。
- 活動當日客服介入率逐季下降。

## 13) 風險與對策
- 網路不穩：前端快取、CDN、精簡查詢頁資源。
- 同名誤判：第二條件驗證與現場人工覆核流程。
- Google API 配額或授權異常：提示授權檢查、提供最近成功快取資料與重試機制。
- Sheet 欄位被誤改：提供欄位驗證與錯誤定位（列/欄提示）。
- 臨時換桌需求：直接修改 Google Sheet，平台可手動觸發立即同步。
- 驗證信寄送失敗：重送機制、備援寄件帳號、明確錯誤提示。
- Apps Script 配額限制：錯峰同步、快取查詢結果、升級 Google Workspace 配額。

## 14) Landing Page 規格（行銷網站）

### 14.1) 目標
- 在 30 秒內讓訪客理解產品價值與使用方式，並導向註冊。
- 降低新手理解門檻，提前說明「Google Sheet + Google Drive 自管」模式。

### 14.2) 區塊結構（由上到下）
- `Hero`：主標語、副標語、主要 CTA（立即免費開始）、次要 CTA（觀看操作流程）。
- `Pain Points`：傳統紙本/口頭帶位痛點（排隊、同名混淆、臨時改位）。
- `Features`：QR 查詢、LINE 分享、Google Sheet 唯讀同步、Drive 圖片支援。
- `How It Works`：3-4 步驟圖文（註冊 -> 綁定 Sheet -> 產生 QR/分享 -> 賓客查詢）。
- `Demo/Preview`：查詢頁示意圖與手機畫面。
- `Pricing`：目前全免費，後續採按活動數量付費開通（先揭露未來計費方向）。
- `FAQ`：權限設定、Drive 圖片連結、同名處理、資料安全。
- `Final CTA`：再次導向註冊與登入。

### 14.3) 內容重點
- 明確標示「不代管賓客名單，資料由你自己 Google Sheet 維護」。
- 明確標示「可自行上傳婚紗照到 Google Drive，再貼連結即可顯示」。
- 強調上手時間（例如 10-20 分鐘）與現場效益（減少接待壓力）。

### 14.4) CTA 與轉換流程
- 主要 CTA：`立即建立我的婚宴查詢頁`。
- 次要 CTA：`先看 2 分鐘教學`。
- CTA 點擊後：未登入 -> 註冊頁；已登入 -> 建立活動頁。
- Landing Page 應提供錨點導覽，快速跳到功能、流程、FAQ。

### 14.5) SEO 與追蹤
- SEO 基本欄位：title、description、Open Graph（含預覽圖）。
- 追蹤事件：CTA 點擊、FAQ 展開、教學播放、註冊完成。
- KPI：Landing 訪客 -> 註冊轉換率、跳出率、平均停留時間。

## 15) 設定頁教學規格（登入後）

### 15.1) 教學目標
- 讓首次使用者在單一流程內完成活動建立與查詢頁發布。
- 讓使用者知道所有資料維護都在 Google Sheet/Drive 端完成。

### 15.2) 引導方式
- 首次登入顯示 `新手導覽`（可跳過、可稍後再看）。
- 設定頁右側固定 `教學側欄`：目前步驟、完成狀態、常見錯誤。
- 每一個欄位旁提供 `範例按鈕` 與 `說明 tooltip`。
- 提供 `複製模板` 按鈕：一鍵複製 Google Sheet 範本連結。

### 15.3) 教學步驟（Step-by-step）
- `Step 1` 建立活動基本資料（名稱、日期、主題色、封面圖欄位說明）。
- `Step 2` 準備 Google Sheet（欄位規範、分享權限設定）。
- `Step 3` 填入 Sheet 連結並測試（顯示驗證結果與錯誤定位）。
- `Step 4` 設定 Google Drive 圖片連結（分享連結轉可顯示 URL）。
- `Step 5` 產生 QR Code 或 LINE 分享連結（可自訂分享內文）。
- `Step 6` 匯出全賓客 QR 圖卡（確認版面含姓名/桌號，下載 ZIP）。
- `Step 7` 設定接待流程（掃碼簽到頁測試、男方/女方接待連結測試）。
- `Step 8` 發布前檢查（查詢預覽、同名測試、行動版檢視）。

### 15.4) 錯誤排除設計
- 權限錯誤：提示如何把 Sheet/Drive 設為可讀取。
- 格式錯誤：指出錯誤欄位名稱與建議修正格式。
- 連結錯誤：辨識是否為 Drive 分享頁連結，提供一鍵轉換建議。
- 同步失敗：顯示最後成功時間、重試按鈕、支援文件連結。

### 15.5) 教學資源型態
- 文字版快速指南（1 分鐘）。
- 圖解版步驟教學（每步 1 張圖）。
- 短影片（2-3 分鐘）示範完整建立流程。
- FAQ 與範例資料下載（Sheet 範本、圖片連結範例）。

### 15.6) 驗收標準（DoD）
- 新使用者在 20 分鐘內可獨立完成首次發布。
- 首次導覽完成率達 70% 以上。
- 教學頁點擊後的錯誤率（權限/格式）逐月下降。
- 教學內容與實際介面一致，更新版本同步維護。

## 16) 開發原則與品質標準

### 16.1) Clean Code 原則
- 以可讀性、可維護性、可測試性為優先，避免過度複雜設計。
- 命名需語意化且一致（頁面、元件、函式、欄位命名規範一致）。
- 單一職責原則：元件與函式聚焦單一任務，避免巨型檔案。
- 共用邏輯抽離為 composables/services，避免重複程式碼。
- PR 必須通過 lint/format，並附上變更說明與測試方式。

### 16.2) 使用者體驗與元件互動原則
- 關鍵操作皆需有即時回饋（loading、成功、失敗、可復原提示）。
- 表單操作需提供明確狀態（必填、格式錯誤、下一步引導）。
- 元件互動要一致（按鈕樣式、禁用狀態、動效節奏、提示語氣）。
- 優先降低認知負擔：一次只要求使用者完成一件事。
- 錯誤訊息需可行動（告訴使用者為何錯與怎麼修正）。

### 16.3) RWD（Responsive Web Design）強制要求
- 必須採 Mobile First，優先確保手機操作流暢。
- 主要斷點建議：`<600`、`600-959`、`960-1263`、`>=1264`。
- Landing Page、設定頁、查詢頁皆需在手機/平板/桌機可用且易讀。
- 觸控操作區需符合最小點擊區域（建議 >= 44px）。
- 圖片、卡片、表單、導覽列需在小螢幕避免溢出與遮擋。

### 16.4) 互動與效能基線
- 首屏內容優先渲染，非必要資源延遲載入。
- 圖片需壓縮與尺寸適配，避免造成查詢頁卡頓。
- 動畫需簡潔且不阻塞主要流程，尊重使用者可讀性。
- 查詢、同步、發送驗證碼等動作應避免重複觸發（防連點）。

### 16.5) 可用性驗收（UX DoD）
- 新使用者可在無人協助下完成：註冊 -> 綁定 Sheet -> 發布查詢頁。
- 主要操作流程（建立活動、驗證連線、分享）不可超過 3 次關鍵點擊層級。
- 任何錯誤狀態皆有清楚提示與下一步操作建議。
- 手機直式畫面下可完整完成所有核心功能。

## 17) 簽到頁與接待頁 UI 規格（可實作）

### 17.1) 掃碼簽到頁（Reception Scanner）
- **頁面目標**：接待人員開啟頁面後立即可掃碼簽到，減少現場等待。
- **進入方式**：管理端產生專用連結（含活動識別與短效 token）。
- **載入行為**：進頁自動請求相機權限，成功後直接開啟後鏡頭預覽。
- **主要區塊**：頂部狀態列、掃碼框、最近簽到結果卡、底部操作列。
- **底部操作**：手電筒開關、切換鏡頭、手動輸入備援、暫停/繼續掃描。

### 17.2) 掃碼簽到頁欄位與資訊
- 頂部狀態列：活動名稱、當前接待身份（男方/女方/總接待）、網路狀態。
- 最近簽到結果卡：`name`、`table`、`side`、簽到時間、操作結果。
- 掃碼資料最小格式：`eventSlug` + `guestKey` + 防偽簽章（避免任意偽造 QR）。
- 顯示語言與文案需一致，成功與錯誤提示最多 1 行主文 + 1 行說明。

### 17.3) 掃碼簽到頁互動狀態
- `idle`：等待掃碼（顯示「請將 QR 對準框內」）。
- `processing`：驗證中（顯示 loading，暫停二次掃描）。
- `success`：簽到成功（綠色回饋 + 音效/震動，可關閉）。
- `duplicate`：已簽到（黃色提示 + 已簽到時間）。
- `invalid`：無效 QR（紅色提示，建議改用手動搜尋）。
- `offline`：離線模式（暫存簽到佇列，恢復連線後自動補送）。

### 17.4) 掃碼簽到頁錯誤訊息規範
- 相機權限被拒：`無法啟用相機，請允許瀏覽器相機權限。`
- 無法識別 QR：`此 QR 無效或非本活動，請重新確認。`
- 已簽到：`{name} 已於 {time} 完成簽到。`
- 寫入失敗：`簽到送出失敗，已加入重試佇列。`
- 權杖過期：`簽到連結已過期，請向主辦方取得新連結。`

### 17.5) 接待人員頁（Host Desk）
- **頁面目標**：無法掃碼時仍可快速從桌次名單完成簽到。
- **進入流程**：開啟接待連結 -> 選擇 `男方接待` 或 `女方接待` -> 進入桌次清單。
- **主要區塊**：身份切換區、桌次索引區、賓客清單區、快速搜尋列。
- **清單顯示**：桌名/桌號、賓客姓名、稱謂、簽到狀態、簽到按鈕。
- **互動行為**：點擊簽到後立即更新該列狀態，並顯示成功提示。

### 17.6) 接待人員頁互動與篩選
- 支援依 `桌次`、`姓名`、`簽到狀態` 篩選。
- 支援「僅看未簽到」快速模式，便於尖峰時段操作。
- 同名顯示強化：同名時加上桌次與 side 標記，避免誤點。
- 手動簽到需二次確認（可設定開/關），避免誤操作。
- 若已簽到再點擊，顯示「已簽到於 xx:xx」而非重複寫入。

### 17.7) RWD 與裝置規格（簽到/接待頁）
- 手機直式優先（`360x800` 起），重要按鈕固定底部可單手點擊。
- 平板橫式提供雙欄（桌次列表 / 賓客明細）以提高接待效率。
- 桌機版可顯示更多欄位（最後更新時間、簽到來源、操作者）。
- 最小可點擊區域 >= 44px，避免現場快速操作誤觸。

### 17.8) 權限與連結安全（簽到/接待）
- 簽到連結與接待連結皆使用短效 token（建議 8-24 小時有效）。
- token 綁定活動與角色，過期後不可寫入簽到資料。
- 可由管理端一鍵失效舊連結並重發新連結。
- 所有簽到動作需留下 `checkin_by` 與 `checkin_channel` 以便追蹤。

### 17.9) 驗收標準（簽到/接待 DoD）
- 掃碼頁首次開啟至可掃描時間 <= 3 秒（正常網路）。
- 接待人員可在 2 次點擊內完成單一賓客手動簽到。
- 重複簽到率低於 1%，且可追溯操作來源。
- 手機環境下連續簽到 100 人無致命中斷或明顯卡頓。

## 18) Google Sheet 欄位最終規格（可直接使用）

### 18.1) 工作表清單
- `event_settings`：活動與頁面設定（活動名稱、日期、主視覺等）。
- `guests`：賓客主資料（查詢、QR 產生、接待清單來源）。
- `checkins`：簽到紀錄（掃碼與手動簽到都寫入）。
- `system_logs`（選用）：同步/驗證錯誤與操作紀錄。

### 18.2) `event_settings` 欄位定義
- `event_slug`（必填）：活動識別碼，格式建議 `a-z0-9-`，例如 `harry-wedding-2026`。
- `event_name`（必填）：活動名稱。
- `event_date`（必填）：活動日期，格式 `YYYY-MM-DD`。
- `venue_name`（選填）：場地名稱。
- `primary_color`（選填）：主色，格式 `#RRGGBB`。
- `cover_image_url`（選填）：封面圖連結（可為 Drive 分享連結，系統轉換）。
- `hero_image_url`（選填）：主視覺連結（可為 Drive 分享連結，系統轉換）。
- `line_share_text`（選填）：LINE 預設分享內文。
- `is_published`（必填）：是否發布，值為 `true` 或 `false`。

### 18.3) `guests` 欄位定義
- `guest_key`（必填）：賓客唯一鍵，建議 UUID 或不可重複字串。
- `name`（必填）：賓客姓名。
- `title`（選填）：稱謂（先生/小姐/貴賓等）。
- `table`（必填）：桌名或桌號（例如 `A1`、`主桌`）。
- `side`（選填）：`groom`（男方）或 `bride`（女方）。
- `alias`（選填）：別名或暱稱（逗號分隔）。
- `phone_last3`（選填）：手機末三碼（僅數字）。
- `note`（選填）：備註。
- `qr_payload`（選填）：自訂 QR 內容；若空值由系統自動組合。
- `active`（必填）：是否啟用，值為 `true` 或 `false`。

### 18.4) `checkins` 欄位定義
- `guest_key`（必填）：對應 `guests.guest_key`。
- `checkin_status`（必填）：`pending` 或 `checked_in`。
- `checkin_at`（選填）：簽到時間，ISO 格式（例如 `2026-04-28T14:30:00+08:00`）。
- `checkin_by`（選填）：操作者識別（scanner token id / host token id / owner id）。
- `checkin_channel`（選填）：`qr_scan` 或 `host_click`。
- `updated_at`（必填）：最後更新時間（ISO 格式）。

### 18.5) `system_logs` 欄位定義（選用）
- `log_id`：紀錄 ID。
- `event_slug`：活動識別碼。
- `log_type`：`sync_error`、`validation_error`、`auth_error`、`checkin_error`。
- `message`：錯誤或事件摘要。
- `payload`：原始資料（可裁切、不可含敏感資訊）。
- `created_at`：建立時間（ISO 格式）。

### 18.6) 欄位驗證規則（最小集合）
- 必填欄位不可為空白（僅空格也視為空值）。
- `event_slug`、`guest_key` 必須唯一，不可重複。
- `side` 僅接受 `groom` / `bride`。
- `checkin_status` 僅接受 `pending` / `checked_in`。
- `phone_last3` 僅接受 3 位數字。
- 圖片欄位若為 Drive 分享連結，需可轉為可顯示 URL 且可讀取。

### 18.7) `guests` 範例資料列
| guest_key | name | title | table | side | alias | phone_last3 | note | qr_payload | active |
|---|---|---|---|---|---|---|---|---|---|
| g_001 | 王小明 | 先生 | A1 | groom | 小明,阿明 | 123 | 高中同學 |  | true |
| g_002 | 陳小美 | 小姐 | A1 | bride | 美美 | 456 |  |  | true |
| g_003 | 李大華 | 貴賓 | 主桌 | groom |  | 789 | 長輩 |  | true |

### 18.8) `event_settings` 範例資料列
| event_slug | event_name | event_date | venue_name | primary_color | cover_image_url | hero_image_url | line_share_text | is_published |
|---|---|---|---|---|---|---|---|---|
| harry-wedding-2026 | 王府婚宴 | 2026-11-07 | 圓山大飯店 | #D63384 | https://drive.google.com/file/d/xxx/view?usp=sharing | https://drive.google.com/file/d/yyy/view?usp=sharing | 歡迎參加我們的婚禮，點此查詢座位 | false |

### 18.9) `checkins` 範例資料列
| guest_key | checkin_status | checkin_at | checkin_by | checkin_channel | updated_at |
|---|---|---|---|---|---|
| g_001 | pending |  |  |  | 2026-04-28T13:00:00+08:00 |
| g_002 | checked_in | 2026-04-28T14:35:12+08:00 | host_token_01 | host_click | 2026-04-28T14:35:12+08:00 |
| g_003 | checked_in | 2026-04-28T14:40:45+08:00 | scanner_token_02 | qr_scan | 2026-04-28T14:40:45+08:00 |

### 18.10) 上線前檢查清單（Sheet）
- `event_settings`、`guests`、`checkins` 工作表皆已建立。
- 必填欄位名稱完全一致（避免大小寫或底線差異）。
- Google Sheet 與圖片連結權限已設定為可讀取。
- 使用測試賓客完成一次掃碼簽到與一次手動簽到。
- 成功產生全賓客 QR 圖卡並完成下載測試。

## 19) Apps Script API 規格（MVP + V1）

### 19.1) API 設計原則
- 採 REST 風格，統一回傳 JSON。
- 所有寫入型 API 需驗證 token 與角色（目前僅 `owner` / reception token）。
- 回傳格式固定：`{ success, code, message, data }`。
- 時間欄位一律使用 ISO 8601（含時區）。

### 19.2) 認證與帳號 API
- `POST /auth/register`：註冊帳號，建立 `users` 資料。
- `POST /auth/send-otp`：發送 Email 驗證碼（註冊/忘記密碼共用）。
- `POST /auth/verify-otp`：驗證 OTP。
- `POST /auth/login`：帳密登入，回傳 session token。
- `POST /auth/forgot-password`：發送重設密碼 OTP。
- `POST /auth/reset-password`：驗證 OTP 後重設密碼。
- `POST /auth/logout`：登出並失效 token（伺服端黑名單或版本號機制）。

### 19.3) 活動與設定 API
- `POST /events`：建立活動。
- `GET /events`：取得目前帳號活動列表（含開通狀態）。
- `GET /events/{eventSlug}`：取得活動設定與同步狀態。
- `PATCH /events/{eventSlug}`：更新活動基本設定（名稱、日期、主題、分享文案）。
- `POST /events/{eventSlug}/publish`：切換活動發布狀態。
- `POST /events/{eventSlug}/sheet/validate`：驗證 Sheet 連線與欄位格式。
- `POST /events/{eventSlug}/sheet/sync`：手動觸發同步（讀取最新名單）。

### 19.4) 查詢與公開頁 API
- `GET /public/events/{eventSlug}/config`：查詢頁設定（主題、圖像、文案）。
- `POST /public/events/{eventSlug}/search`：賓客查詢（姓名/末三碼）。
- `GET /public/events/{eventSlug}/stats`（選用）：公開頁匿名統計摘要。
- 查詢 API 回傳需最小化（只含必要欄位：姓名、桌次、稱謂）。

### 19.5) QR 與分享 API
- `POST /events/{eventSlug}/qrcodes/generate`：批次產生賓客 QR 圖卡。
- `GET /events/{eventSlug}/qrcodes/download`：下載 ZIP（圖卡含姓名與桌號）。
- `POST /events/{eventSlug}/share/line-link`：產生 LINE 分享連結（可帶自訂文案）。
- `GET /events/{eventSlug}/reception-links`：取得掃碼簽到/接待人員連結。
- `POST /events/{eventSlug}/reception-links/rotate`：使舊連結失效並重發。

### 19.6) 簽到 API
- `POST /checkins/scan`：掃碼簽到寫入（來源 `qr_scan`）。
- `POST /checkins/manual`：接待頁手動簽到（來源 `host_click`）。
- `GET /events/{eventSlug}/checkins`：取得簽到清單與統計。
- `POST /events/{eventSlug}/checkins/revert`（選用）：撤銷簽到（需 owner 權限）。

### 19.7) 計費與開通 API（預留）
- `GET /billing/plans`：查詢方案資訊（目前可回傳 free-only）。
- `GET /billing/events-usage`：活動使用量。
- `POST /billing/events/{eventSlug}/unlock`：活動開通（未啟用前先保留 stub）。

## 20) 權杖與授權模型

### 20.1) token 類型
- `owner_session_token`：後台管理使用，短效 + 可續期。
- `reception_scan_token`：掃碼頁專用，短效、僅能寫簽到。
- `reception_host_token`：接待頁專用，短效、僅能讀桌次與手動簽到。

### 20.2) 權限矩陣（現階段）
- `owner`：活動設定、同步、發佈、QR 匯出、連結重發、查詢統計、簽到管理。
- `reception_scan_token`：只能呼叫 `POST /checkins/scan` 與必要查詢。
- `reception_host_token`：只能讀接待名單與呼叫 `POST /checkins/manual`。

### 20.3) 安全策略
- 所有 token 需包含 `eventSlug`，避免跨活動誤用。
- token 過期即拒絕寫入，回傳 `TOKEN_EXPIRED`。
- 重要操作（重發連結、發布活動）需再次驗證 owner session 有效。

## 21) 錯誤碼與回應規範

### 21.1) 通用錯誤碼
- `INVALID_REQUEST`：參數錯誤或缺少必填。
- `UNAUTHORIZED`：未登入或 token 無效。
- `FORBIDDEN`：權限不足。
- `NOT_FOUND`：活動或賓客不存在。
- `CONFLICT`：狀態衝突（例如重複簽到）。
- `RATE_LIMITED`：操作過於頻繁。
- `INTERNAL_ERROR`：系統例外。

### 21.2) 業務錯誤碼
- `SHEET_PERMISSION_DENIED`：Sheet 無讀取權限。
- `SHEET_SCHEMA_INVALID`：Sheet 欄位不符合規格。
- `DRIVE_IMAGE_UNREADABLE`：圖片連結無法讀取。
- `OTP_EXPIRED`：驗證碼逾時。
- `OTP_ATTEMPTS_EXCEEDED`：驗證碼錯誤次數超限。
- `CHECKIN_DUPLICATED`：該賓客已簽到。
- `EVENT_NOT_UNLOCKED`：活動尚未開通付費功能（計費啟用後生效）。

### 21.3) 回應範例
```json
{
  "success": false,
  "code": "CHECKIN_DUPLICATED",
  "message": "該賓客已完成簽到",
  "data": {
    "guest_key": "g_002",
    "checkin_at": "2026-04-28T14:35:12+08:00"
  }
}
```

## 22) 測試策略與品質保證

### 22.1) 測試分層
- 單元測試：連結轉換、欄位驗證、查詢比對、狀態轉換。
- 整合測試：前端 -> Apps Script -> Sheets 寫入/讀取流程。
- 端對端測試：註冊、建活動、綁 Sheet、發布、查詢、簽到。
- 裝置測試：iOS Safari、Android Chrome、桌機 Chrome/Safari。

### 22.2) 關鍵測試案例
- Drive 分享連結轉換後可正確顯示圖片。
- 同名賓客可用次要條件正確辨識。
- 離線簽到佇列恢復後可正確補寫且不重複。
- 同步後 QR 匯出圖卡資訊與 Sheet 一致（姓名/桌號不錯置）。
- token 過期後簽到寫入應被拒絕且提示重取連結。

### 22.3) 發版門檻（Release Gate）
- lint / format 全數通過。
- 核心 E2E 流程全綠（至少 10 條關鍵路徑）。
- 手機版 RWD 人工驗收通過（至少 4 種常見解析度）。
- 高風險功能（簽到、QR 匯出、Sheet 驗證）需有錄影驗證或測試報告。

## 23) 專案里程碑與交付物

### 23.1) 里程碑 M0（規格凍結）
- 交付：最終企劃書、欄位規格、API 規格、畫面流程圖。
- 完成條件：產品、設計、開發三方確認不再大改核心流程。

### 23.2) 里程碑 M1（MVP 可用）
- 交付：Landing Page、註冊登入、活動設定、查詢頁、LINE 分享、基本 QR。
- 完成條件：新人可獨立建立並發布一場活動。

### 23.3) 里程碑 M2（現場可運營）
- 交付：批次 QR 圖卡匯出、掃碼簽到頁、接待人員頁、簽到紀錄。
- 完成條件：可支援活動現場報到，具備重試與錯誤提示機制。

### 23.4) 里程碑 M3（收費準備完成）
- 交付：活動開通狀態欄位、計費 stub API、後台開通流程 UI。
- 完成條件：雖然仍免費，但可隨時切換到按活動開通模式。

## 24) 非功能需求（NFR）

### 24.1) 可用性
- 系統上線可用率目標：99.5%（不含 Google 服務中斷）。
- 重大事故（無法查詢/簽到）需在 30 分鐘內可回復基本服務。

### 24.2) 效能
- 查詢 API p95 < 800ms（正常網路）。
- 簽到 API p95 < 1000ms（含寫入與狀態更新）。
- QR 批次產生 500 人以內，10 分鐘內可完成下載準備。

### 24.3) 可維運性
- 所有錯誤都要有可追蹤 `request_id`。
- 關鍵動作記錄於 `system_logs`（不含敏感個資）。
- 提供管理端健康檢查頁（Sheet 可讀、寄信可用、token 驗證可用）。

### 24.4) 相容性
- 支援近兩年主流瀏覽器版本。
- 行動端優先支援 iOS Safari 與 Android Chrome。
- 不依賴需安裝 App 的能力，使用瀏覽器即可完成核心流程。

## 25) API 請求與回應欄位規格（精簡版）

### 25.1) `POST /auth/register`
- **Request**
  - `email`（string, required）
  - `password`（string, required, min 8）
- **Response data**
  - `user_id`（string）
  - `email`（string）
  - `email_verified`（boolean）

### 25.2) `POST /auth/login`
- **Request**
  - `email`（string, required）
  - `password`（string, required）
- **Response data**
  - `access_token`（string）
  - `expires_in`（number, 秒）
  - `user`（object: `user_id`, `email`, `plan_status`）

### 25.3) `POST /events`
- **Request**
  - `event_name`（string, required）
  - `event_date`（string, required, `YYYY-MM-DD`）
  - `venue_name`（string, optional）
  - `primary_color`（string, optional）
- **Response data**
  - `event_slug`（string）
  - `created_at`（string, ISO）

### 25.4) `POST /events/{eventSlug}/sheet/validate`
- **Request**
  - `sheet_url`（string, required）
  - `worksheet_map`（object, optional）
- **Response data**
  - `is_valid`（boolean）
  - `sheet_id`（string）
  - `missing_columns`（array<string>）
  - `warnings`（array<string>）

### 25.5) `POST /public/events/{eventSlug}/search`
- **Request**
  - `name`（string, required）
  - `phone_last3`（string, optional）
- **Response data**
  - `matched`（boolean）
  - `guest`（object | null: `name`, `title`, `table`, `side`）

### 25.6) `POST /events/{eventSlug}/qrcodes/generate`
- **Request**
  - `card_template`（string, optional）
  - `include_fields`（array<string>, optional; default: `["name","table"]`）
- **Response data**
  - `job_id`（string）
  - `total_cards`（number）
  - `status`（string: `queued`）

### 25.7) `GET /events/{eventSlug}/qrcodes/download`
- **Query**
  - `job_id`（string, required）
- **Response data**
  - `status`（string: `processing` | `ready` | `failed`）
  - `download_url`（string | null）
  - `expires_at`（string | null, ISO）

### 25.8) `POST /checkins/scan`
- **Request**
  - `event_slug`（string, required）
  - `qr_payload`（string, required）
  - `scanner_token`（string, required）
- **Response data**
  - `guest_key`（string）
  - `checkin_status`（string）
  - `checkin_at`（string, ISO）
  - `is_duplicate`（boolean）

### 25.9) `POST /checkins/manual`
- **Request**
  - `event_slug`（string, required）
  - `guest_key`（string, required）
  - `host_token`（string, required）
- **Response data**
  - `guest_key`（string）
  - `checkin_status`（string）
  - `checkin_at`（string, ISO）
  - `checkin_channel`（string: `host_click`）

## 26) 前端資訊架構（IA）與路由規劃

### 26.1) 公開路由
- `/`：Landing Page（行銷內容 + CTA）。
- `/register`：註冊頁。
- `/login`：登入頁。
- `/forgot-password`：忘記密碼頁。
- `/e/:eventSlug`：賓客查詢頁。
- `/reception/scan/:token`：掃碼簽到頁（鏡頭模式）。
- `/reception/host/:token`：接待人員頁（桌次/名單手動簽到）。

### 26.2) 後台路由（需 owner 登入）
- `/app`：後台首頁（活動概覽）。
- `/app/events`：活動列表。
- `/app/events/new`：建立活動。
- `/app/events/:eventSlug/settings`：活動設定頁。
- `/app/events/:eventSlug/sheet`：Sheet 綁定與驗證頁。
- `/app/events/:eventSlug/publish`：發布與分享頁（QR/LINE）。
- `/app/events/:eventSlug/qrcards`：QR 圖卡匯出頁。
- `/app/events/:eventSlug/checkins`：簽到監看與統計頁。
- `/app/help`：教學中心（步驟、FAQ、影片）。

### 26.3) 導覽原則
- 後台側邊欄固定 5 大入口：活動、資料連線、發布分享、簽到、教學。
- 行動版改底部導覽（最多 4 項）+ 更多選單。
- 所有關鍵頁提供返回活動概覽捷徑，避免迷路。

## 27) 開發 Backlog（可直接建 Issue）

### 27.1) Epic A：帳號與安全
- A1：註冊/登入/登出流程（含 OTP 驗證）。
- A2：忘記密碼與 OTP 重送節流。
- A3：session token 驗證與過期處理。
- A4：API 錯誤碼統一與前端提示映射。

### 27.2) Epic B：活動與資料連線
- B1：活動 CRUD（目前以建立/修改為主）。
- B2：Sheet 連結驗證與欄位檢查。
- B3：Drive 圖片連結轉換與顯示 fallback。
- B4：同步狀態顯示與重試機制。

### 27.3) Epic C：公開查詢體驗
- C1：賓客查詢 UI（姓名 + 末三碼）。
- C2：查詢結果/查無結果/錯誤狀態完整設計。
- C3：查詢頁效能優化與行動裝置適配。

### 27.4) Epic D：分享與 QR
- D1：LINE 分享連結產生與自訂文案。
- D2：單活動 QR 下載。
- D3：全賓客 QR 圖卡批次產生與 ZIP 下載。
- D4：QR 圖卡模板（最少 1 款正式版）。

### 27.5) Epic E：簽到與接待
- E1：掃碼簽到頁（相機、掃碼、結果提示）。
- E2：接待人員頁（男方/女方分流、桌次列表、手動簽到）。
- E3：重複簽到防呆與撤銷簽到（選用）。
- E4：簽到統計頁（已到/未到、時段分佈）。

### 27.6) Epic F：Landing Page 與教學
- F1：Landing Page 區塊與文案上線。
- F2：設定頁教學側欄與 step-by-step 導覽。
- F3：FAQ/影片/範本下載整合。

### 27.7) Epic G：品質與發布
- G1：RWD 驗收（手機/平板/桌機）。
- G2：E2E 核心流程測試腳本。
- G3：監控與日誌（request_id、錯誤追蹤）。
- G4：上線手冊與回滾流程。

## 28) 風險優先級與應對順序（P0/P1/P2）

### 28.1) P0（必先解決）
- **Sheet 權限或欄位錯誤導致不可查詢**：建立嚴格驗證、錯誤定位、上線前檢查。
- **簽到寫入失敗**：建立重試佇列與離線緩存，避免現場無法報到。
- **token 外洩或過期策略不足**：短效 token、可旋轉重發、最小權限。
- **QR 圖卡錯置（姓名/桌號對錯）**：匯出前預覽與抽樣驗證。

### 28.2) P1（應在上線前完善）
- **Drive 圖片失效或無權限**：fallback 圖 + 後台告警。
- **同名誤判**：加次要條件（末三碼/side）與人工覆核入口。
- **Apps Script 配額瓶頸**：錯峰同步、快取、請求限流。

### 28.3) P2（可持續優化）
- **Landing 轉換率低**：A/B 測試標題與 CTA。
- **教學完成率低**：優化導覽步驟與輔助文案。
- **簽到效率不穩定**：持續優化 UI 與掃碼辨識容錯。

## 29) Sprint 切分建議（4 個 Sprint）

### 29.1) Sprint 1（帳號 + 活動骨架）
- 註冊/登入/OTP、活動建立、基本後台框架。
- Landing Page 第一版 + 基本路由。
- 完成條件：可登入並建立活動草稿。

### 29.2) Sprint 2（資料連線 + 公開查詢）
- Sheet 綁定驗證、Drive 圖片連結處理、公開查詢頁。
- LINE 分享連結生成功能。
- 完成條件：可成功發布並讓賓客查到座位。

### 29.3) Sprint 3（QR 匯出 + 現場簽到）
- 批次 QR 圖卡、ZIP 下載、掃碼簽到頁、接待頁。
- 簽到寫入/防重複/失敗重試。
- 完成條件：可支援現場完整報到流程。

### 29.4) Sprint 4（穩定化 + 上線準備）
- 教學中心、錯誤訊息優化、RWD 收斂、E2E 與壓測。
- 監控、日誌、回滾流程與上線清單。
- 完成條件：達成 MVP 上線門檻。

## 30) MVP 上線邊界（In / Out）

### 30.1) In Scope（本次必上）
- 註冊登入與 OTP 驗證。
- 活動建立與 Sheet 綁定驗證。
- 賓客公開查詢頁與 LINE 分享。
- 全賓客 QR 圖卡匯出。
- 掃碼簽到頁與接待手動簽到頁。
- 基礎教學導覽與 FAQ。

### 30.2) Out of Scope（延後）
- webhook 對外開放。
- 複雜多角色權限系統（目前只有 owner）。
- 白標品牌能力。
- 深度商業分析儀表板。

## 31) 上線檢查清單（Go-Live Checklist）

### 31.1) 功能檢查
- 完整跑過主流程：註冊 -> 建活動 -> 綁 Sheet -> 發布 -> 查詢 -> 簽到。
- 全賓客 QR 匯出與下載正常，抽樣內容一致。
- LINE 分享連結可在手機正常開啟且內容正確。

### 31.2) 安全檢查
- 所有寫入 API 都有 token 驗證。
- OTP 機制具過期、錯誤次數與重送限制。
- 接待連結可失效重發，舊連結不可再用。

### 31.3) 相容與 RWD 檢查
- iOS Safari / Android Chrome 核心流程全綠。
- 手機、平板、桌機版面無關鍵遮擋與溢位。
- 掃碼頁在低階手機仍可完成連續簽到。

### 31.4) 維運檢查
- system logs 有 request_id 且可追查。
- 關鍵錯誤有告警與可讀訊息。
- 回滾方案文件可被非開發角色理解並執行。

## 32) 上線後 30 天觀察指標

### 32.1) 產品指標
- 活動發布成功率。
- 賓客查詢成功率。
- 現場簽到成功率與平均簽到時間。

### 32.2) 體驗指標
- 教學導覽完成率。
- FAQ 點擊率與常見錯誤類型。
- 接待人員操作步驟平均點擊數。

### 32.3) 穩定性指標
- API 錯誤率與 p95 延遲。
- QR 匯出失敗率。
- 簽到重複寫入率與離線補送成功率。

## 33) 結論與執行建議
- 本專案採「純前端部署 + Apps Script 資料層 + Google Sheet/Drive 自管」可行且成本可控。
- 產品核心應優先確保「查得到、簽得到、現場不卡」三件事。
- 商業策略已對齊為「目前全免費，未來按活動數量開通計費」。
- 建議先以 MVP 快速上線驗證真實場域，再逐步擴展收費與進階能力。
