# VAANI Mobile Structure - Multi-Transaction Type Support

## Overview
VAANI is live in Vyapar mobile app. Currently supports **Expense transactions** with expansion to **Payment In** and **Payment Out** in progress.

## Supported Transaction Types

### Current Sprint
| Type | Status | Entry Points |
|------|--------|--------------|
| Expense | Live | home_screen_pop_up, expense_screen, add_expense_intro_popup |
| Payment In | In Development | payment_in_screen, add_payment_in_intro_popup |
| Payment Out | In Development | payment_out_screen, add_payment_out_intro_popup |

### Next Sprint
| Type | Status | Entry Points |
|------|--------|--------------|
| Sale Invoice | Planned | sale_invoice_screen, add_sale_invoice_intro_popup |
| Sale Order | Planned | sale_order_screen, add_sale_order_intro_popup |
| Delivery Challan | Planned | delivery_challan_screen, add_delivery_challan_intro_popup |

## Event Structure

Events are organized into 7 main categories with **transaction_type** as a required property for all events.

### 1. Session Events
| Event | Description | Key Properties |
|-------|-------------|----------------|
| `VN_opened` | User enters VAANI | source, used_vn_before, transaction_type |
| `VN_session_started` | Session begins | transaction_type, session_id |
| `VN_session_ended` | Session ends | session_id, transaction_type, exit_reason, time_spent_seconds |

### 2. Voice Input Events
| Event | Description | Key Properties |
|-------|-------------|----------------|
| `VN_mic_button_clicked` | Mic tap (on/off) | mic_status, session_id, transaction_type |
| `VN_mute_toggle` | Mute checkbox toggle | mute_status, session_id, transaction_type |
| `VN_recording_completed` | Recording stops | session_id, recording_duration_ms, auto_stop, transaction_type |
| `VN_voice_processed` | Transcription ready | session_id, transcript_length, transaction_type |
| `VN_audio_uploaded` | Audio uploaded to S3 | time_taken_ms, session_id, transaction_type, network_* |
| `VN_stt_received` | STT received | time_taken_ms, session_id, transaction_type, transcript_length |
| `VN_ai_data_received` | AI invoice ready | time_taken_ms, session_id, transaction_type, fields_extracted_count |

### 3. Transaction Events (Generic)
| Event | Description | Key Properties |
|-------|-------------|----------------|
| `VN_transaction_saved` | Transaction saved | transaction_type, session_id, vn_item_count, final_item_count, items_edited, vn_total_amount, final_total_amount, amount_edited, + type-specific props |
| `VN_transaction_cancelled` | Transaction cancelled | transaction_type, session_id, time_spent_seconds, cancel_stage, had_data |
| `VN_transaction_review_shown` | Review screen shown | session_id, transaction_type, fields_shown, missing_fields, time_to_review_ms |

**Deprecated Events:**
- `VN_expense_saved` → Use `VN_transaction_saved` with `transaction_type: "expense"`
- `VN_expense_cancelled` → Use `VN_transaction_cancelled` with `transaction_type: "expense"`

### 4. Suggestion Events
| Event | Description | Key Properties |
|-------|-------------|----------------|
| `VN_category_suggestion_selected` | Category changed (Expense) | user_selected, server_sent, session_id, transaction_type |
| `VN_item_suggestion_selected` | Item name changed | user_selected, server_sent, session_id, transaction_type, item_index |
| `VN_payment_type_suggestion_selected` | Payment type changed | user_selected, server_sent, session_id, transaction_type |
| `VN_party_suggestion_selected` | Party changed (Payment) | user_selected, server_sent, session_id, transaction_type, is_existing_party, selection_source |
| `VN_field_edited` | Any field edited | session_id, transaction_type, field_name, field_old_value, field_new_value, edit_method |

### 5. Feedback Events
| Event | Description | Key Properties |
|-------|-------------|----------------|
| `VN_feedback` | Star rating submitted | stars, session_id, transaction_type, transaction_saved |
| `VN_feedback_closed` | Rating dismissed | session_id, transaction_type |
| `VN_feature_feedback` | Feature request | features, session_id, transaction_type |
| `VN_feature_feedback_closed` | Feature dismissed | session_id, transaction_type |
| `VN_exit_feedback` | Exit reasons | exit_reasons, session_id, transaction_type, stage |

### 6. Error Events
| Event | Description | Key Properties |
|-------|-------------|----------------|
| `VN_api_error` | Backend API failure | error_type, session_id, transaction_type, api_endpoint, error_code, retry_count |
| `VN_error_occurred` | Client-side error | error_type, session_id, transaction_type, error_details |

### 7. Intro Popup Events
| Event | Description | Key Properties |
|-------|-------------|----------------|
| `VN_intro_popup_add_manual` | User chose manual | transaction_type, source |
| `VN_intro_popup_use_vaani` | User chose VAANI | transaction_type, source |

## Key Data Tracked

### Session Data
| Property | Description |
|----------|-------------|
| `session_id` | Unique ID for each VAANI session |
| `transaction_type` | expense, payment_in, payment_out, sale_invoice, etc. |
| `source` | Entry point location |
| `used_vn_before` | Has user used VAANI before |

### Recording Data
| Property | Description |
|----------|-------------|
| `recording_duration_ms` | Length of recording |
| `auto_stop` | Whether timeout triggered |
| `transcript_length` | Length of transcribed text |
| `recording_number` | Which recording in session (1st, 2nd, etc.) |
| `language_detected` | hi, en, hinglish |
| `audio_size_bytes` | File size |

### Transaction Comparison (VAANI vs Final)

**Common Properties (All Types):**
| VAANI | Final | Edited |
|-------|-------|--------|
| `vn_item_count` | `final_item_count` | `items_edited` |
| `vn_total_amount` | `final_total_amount` | `amount_edited` |
| `vn_payment_type` | `final_payment_type` | `payment_type_edited` |

**Expense-Specific:**
| VAANI | Final | Edited |
|-------|-------|--------|
| `vn_category` | `final_category` | `category_edited` |

**Payment-Specific (Payment In/Out):**
| VAANI | Final | Edited |
|-------|-------|--------|
| `vn_party_name` | `final_party_name` | `party_edited` |
| `vn_phone` | `final_phone` | - |
| - | - | `is_new_party` |

### Performance Metrics
| Property | Description |
|----------|-------------|
| `time_to_create_invoice` | Seconds from start to save |
| `time_spent_seconds` | Total time in session |
| `time_to_review_ms` | Time to reach review screen |
| `user_chats_count` | Conversation turns |
| `time_taken_ms` | For audio upload, STT, AI processing |

### Network Metrics
| Property | Description |
|----------|-------------|
| `network_ping_ms` | Ping latency |
| `network_download_mbps` | Download speed |
| `network_upload_mbps` | Upload speed |

### Cancel/Exit Tracking
| Property | Description |
|----------|-------------|
| `cancel_stage` | recording, processing, review, editing |
| `exit_reason` | saved, cancelled, error, timeout, back_pressed |
| `had_data` | Was there extracted data before cancel |

## Implementation Files

### VaaniEventConstants.kt
Defines all event names and property keys as constants:
- `Events` - All event name constants (30+ events)
- `Properties` - All property key constants (60+ properties)
- `SourceValues` - Entry point constants for all transaction types
- `UseCaseType` - Transaction type constants
- `ErrorType` - Error type constants
- `CancelStage` - Cancel stage constants
- `ExitReason` - Exit reason constants
- `FieldName` - Field name constants for VN_field_edited
- `EditMethod` - Edit method constants

### VaaniEventLogger.kt
Contains logging functions for each event:
- All functions now require `transactionType` parameter
- New functions: `logTransactionSaved`, `logTransactionCancelled`, `logTransactionReviewShown`, `logPartySuggestionSelected`, `logFieldEdited`
- Deprecated functions preserved for backward compatibility

## VAANI Flow

1. User opens VAANI from entry point → `VN_opened`
2. Session starts → `VN_session_started`
3. User taps mic → `VN_mic_button_clicked`
4. Records voice → `VN_recording_completed`
5. Audio uploads → `VN_audio_uploaded`
6. STT received → `VN_stt_received`
7. AI data ready → `VN_ai_data_received`
8. Review screen shown → `VN_transaction_review_shown`
9. User may edit fields → `VN_field_edited`, `VN_*_suggestion_selected`
10. User saves or cancels → `VN_transaction_saved` or `VN_transaction_cancelled`
11. Feedback collected → `VN_feedback`, `VN_exit_feedback`
12. Session ends → `VN_session_ended`

All steps are tracked with timing, edit tracking, network performance, and transaction type.
