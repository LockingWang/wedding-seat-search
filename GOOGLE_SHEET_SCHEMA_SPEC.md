# Wedding Seat Search Google Sheet 規格書

## 1) 定案（方案 A）
- 系統商端使用一份主 Google Sheet 管平台資料（帳號、活動、同步快照、簽到、token、日誌）。
- 客戶端使用自己的 Google Sheet 管活動設定與賓客名單。
- 簽到主資料寫在系統商端 Sheet 的 `event_checkins`，不依賴客戶端 Sheet 即時寫入。

## 2) 系統端主 Sheet
- 建議檔名：`wss_platform_db`

### 固定工作表名稱
- `platform_users`
- `platform_user_otps`
- `customer_events`
- `event_sheet_connections`
- `event_guests`
- `event_checkins`
- `event_reception_tokens`
- `event_query_logs`
- `system_logs`

### `platform_users` 欄位
```text
user_id,email,password_hash,email_verified,plan_status,account_status,display_name,last_login_at,created_at,updated_at
```

### `platform_user_otps` 欄位
```text
otp_id,user_id,email,purpose,otp_hash,expires_at,used_at,attempt_count,created_at,updated_at
```

### `customer_events` 欄位
```text
event_id,user_id,event_slug,event_name,event_date,venue_name,primary_color,line_share_text,cover_image_url,hero_image_url,is_published,unlock_status,created_at,updated_at
```

### `event_sheet_connections` 欄位
```text
connection_id,event_id,sheet_url,sheet_id,guest_sheet_name,settings_sheet_name,sync_mode,last_sync_at,last_sync_status,last_sync_message,is_valid,created_at,updated_at
```

### `event_guests` 欄位
```text
event_guest_id,event_id,guest_key,name,title,table_name,side,alias,phone_last3,note,qr_payload,is_active,source_updated_at,synced_at,created_at,updated_at
```

### `event_checkins` 欄位（簽到主表）
```text
checkin_id,event_id,event_guest_id,guest_key,checkin_status,checked_in_at,checked_in_by_type,checked_in_by_id,checkin_channel,last_action_at,created_at,updated_at
```

### `event_reception_tokens` 欄位
```text
reception_token_id,event_id,token,token_type,is_active,expires_at,created_by_user_id,last_used_at,created_at,updated_at
```

### `event_query_logs` 欄位
```text
query_log_id,event_id,keyword,matched_guest_key,is_success,query_source,created_at
```

### `system_logs` 欄位
```text
log_id,event_id,user_id,log_type,message,payload_json,created_at
```

## 3) 客戶端 Sheet
- 建議檔名：`wss_client_{event_slug}`

### 固定工作表名稱
- `event_settings`
- `guests`

### `event_settings` 欄位
```text
event_slug,event_name,event_date,venue_name,primary_color,cover_image_url,hero_image_url,line_share_text,is_published
```

### `guests` 欄位
```text
guest_key,name,title,table_name,side,alias,phone_last3,note,qr_payload,is_active
```

## 4) 關聯鍵
- 活動鍵：`event_slug`
- 賓客鍵：`guest_key`

## 5) 欄位維護責任
- 系統端 Sheet：欄位名稱與主流程欄位由系統維護，避免手動改名。
- 客戶端 Sheet：客戶可改資料列內容，但不要改工作表名稱與第一列欄位。

## 6) 資料流
1. 客戶更新 `event_settings` / `guests`
2. 系統同步到 `event_guests`
3. 現場簽到更新 `event_checkins`
4. 後台統計與接待頁讀 `event_checkins`

## 7) 結論
- 帳號、權限、簽到、統計、日誌：在系統端 Sheet
- 客戶主檔（活動設定、賓客名單）：在客戶端 Sheet
- 簽到主來源：`event_checkins`
