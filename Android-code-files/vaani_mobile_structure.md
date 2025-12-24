# VAANI Mobile Structure - Expense Feature

## Overview
Yes, VAANI is currently live in Vyapar mobile app for **Expense transactions only**.

## Entry Points (Where Users Can Access VAANI)

Users can open VAANI from 3 places:

1. **home_screen_pop_up** - Floating button/popup on main screen
2. **expense_screen** - Direct entry from expense listing screen
3. **add_expense_intro_popup** - When user clicks to add new expense

## Event Structure

Events are organized into 5 main categories:

### 1. Entry & Session Events
- `VN_opened` - When user enters VAANI from any source
- `VN_session_started` - Session begins
- `VN_session_ended` - Session ends

### 2. Voice Input Events
- `VN_mic_button_clicked` - User taps mic (on/off)
- `VN_mute_toggle` - User toggles mute checkbox
- `VN_recording_completed` - Recording stops (manual or auto-timeout)
- `VN_voice_processed` - Transcription received from backend
- `VN_audio_uploaded` - Audio file uploaded to S3
- `VN_stt_received` - Speech-to-text received
- `VN_ai_data_received` - AI invoice data received

### 3. Expense Management Events
- `VN_expense_saved` - User confirms and saves expense
- `VN_expense_cancelled` - User cancels/exits without saving

### 4. Suggestion Selection Events
- `VN_category_suggestion_selected` - User picks different category
- `VN_item_suggestion_selected` - User picks different item name
- `VN_payment_type_suggestion_selected` - User picks different payment type

### 5. Feedback Events
- `VN_feedback` - Star rating submitted
- `VN_feedback_closed` - Rating popup dismissed
- `VN_feature_feedback` - Feature request submitted
- `VN_feature_feedback_closed` - Feature feedback dismissed
- `VN_exit_feedback` - Exit reasons submitted

### 6. Error Events
- `VN_api_error` - Backend API failures (server_error, no_internet, audio_process_failed)
- `VN_error_occurred` - Client-side errors (chat_limit_exceeded, time_limit_exceeded, permission_denied)

### 7. Intro Popup Events
- `VN_intro_popup_add_manual` - User chooses manual entry instead
- `VN_intro_popup_use_vaani` - User chooses VAANI

## Key Data Tracked

### Session Data
- `session_id` - Unique ID for each VAANI session
- `use_case_type` - Always "Expense" for now
- `source` - Entry point location
- `user_has_used_vaani_before` - Boolean flag

### Recording Data
- `recording_duration_ms` - Length of recording
- `auto_stop` - Whether timeout triggered
- `transcript_length` - Length of transcribed text

### Expense Comparison (VAANI vs Final)
- Item counts: `vn_item_count` vs `final_item_count`
- Amounts: `vn_total_amount` vs `final_total_amount`
- Category: `vn_category` vs `final_category`
- Payment type: `vn_payment_type` vs `final_payment_type`
- `items_edited` - Boolean if user changed items
- `category_edited` - Boolean if user changed category

### Performance Metrics
- `time_to_create_invoice` - Seconds from start to save
- `time_spent_seconds` - Total time in session
- `user_chats_count` - Number of back-and-forth messages
- `time_taken_ms` - For audio upload, STT, AI processing

### Network Metrics
- `network_ping_ms` - Ping latency
- `network_download_mbps` - Download speed
- `network_upload_mbps` - Upload speed

## Implementation Files

### VaaniEventConstants.kt
Defines all event names and property keys as constants. Organized into nested objects:
- `Events` - All event name constants
- `Properties` - All property key constants
- `SourceValues` - Entry point constants
- `UseCaseType` - Transaction type constants
- `ErrorType` - Error type constants

### VaaniEventLogger.kt
Contains logging functions for each event. Each function:
- Builds property map
- Calls `Analytics.logEventToAllPlatforms()`
- Includes proper documentation

## Current Limitations

1. Only supports Expense transactions
2. Mobile only (Android implementation shown)
3. Uses Mixpanel for analytics
4. Session-based tracking (no cross-session history)

## What This Tells Us

From the event structure, VAANI mobile flow works like:

1. User opens VAANI from one of 3 entry points
2. Taps mic to start recording
3. Speaks expense details
4. Audio uploaded → STT → AI processing → Invoice created
5. User reviews invoice (can edit category/items/payment)
6. User saves or cancels
7. Feedback collected

All steps are tracked with timing, edit tracking, and network performance data.
