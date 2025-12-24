# VAANI Analytics Events - Implementation Guide

> **Document Purpose**: This document provides complete specifications for updating VAANI analytics events to support multiple transaction types (Expense, Payment In, Payment Out, and future types).
>
> **Target Audience**: Android Developer implementing event tracking changes in Vyapar app
>
> **Current State**: Events are hardcoded for Expense only
>
> **Target State**: Events support all transaction types dynamically

---

## Table of Contents

1. [Summary of Changes](#summary-of-changes)
2. [New Constants to Add](#new-constants-to-add)
3. [Event Specifications](#event-specifications)
   - [Session Events](#1-session-events)
   - [Voice Input Events](#2-voice-input-events)
   - [Transaction Events](#3-transaction-events)
   - [Suggestion Events](#4-suggestion-events)
   - [Feedback Events](#5-feedback-events)
   - [Error Events](#6-error-events)
   - [Intro Popup Events](#7-intro-popup-events)
4. [New Events to Add](#new-events-to-add)
5. [Deprecated Events](#deprecated-events)
6. [Implementation Checklist](#implementation-checklist)

---

## Summary of Changes

### Breaking Changes (Must Do)

| Change | Current | New | Why |
|--------|---------|-----|-----|
| Rename event | `VN_expense_saved` | `VN_transaction_saved` | Generic for all transaction types |
| Rename event | `VN_expense_cancelled` | `VN_transaction_cancelled` | Generic for all transaction types |
| Add property to all events | - | `transaction_type` | Track which transaction type is being used |
| Add property | - | `vn_party_name`, `final_party_name` | Payment In/Out require party tracking |

### New Constants Required

| Type | Values to Add |
|------|--------------|
| UseCaseType | `PAYMENT_IN`, `PAYMENT_OUT`, `SALE_INVOICE`, `SALE_ORDER`, `DELIVERY_CHALLAN` |
| SourceValues | `payment_in_screen`, `payment_out_screen`, `add_payment_in_intro_popup`, `add_payment_out_intro_popup` |

### New Events to Add

| Event | Purpose |
|-------|---------|
| `VN_party_suggestion_selected` | Track when user selects a different party/customer |
| `VN_transaction_review_shown` | Track when review screen appears |
| `VN_field_edited` | Track individual field edits (more granular) |

---

## New Constants to Add

### Update `VaaniEventConstants.kt`

```kotlin
// Use Case Type Values - ADD THESE
object UseCaseType {
    const val EXPENSE = "expense"           // Changed from "Expense" to lowercase for consistency
    const val PAYMENT_IN = "payment_in"     // NEW
    const val PAYMENT_OUT = "payment_out"   // NEW
    const val SALE_INVOICE = "sale_invoice" // NEW (for next sprint)
    const val SALE_ORDER = "sale_order"     // NEW (for next sprint)
    const val DELIVERY_CHALLAN = "delivery_challan" // NEW (for next sprint)
}

// Source Values - ADD THESE
object SourceValues {
    // Existing
    const val HOME_SCREEN_POP_UP = "home_screen_pop_up"
    const val EXPENSE_SCREEN = "expense_screen"
    const val ADD_EXPENSE_INTRO_POPUP = "add_expense_intro_popup"
    const val OTHER = "other"

    // NEW - Payment In sources
    const val PAYMENT_IN_SCREEN = "payment_in_screen"
    const val ADD_PAYMENT_IN_INTRO_POPUP = "add_payment_in_intro_popup"

    // NEW - Payment Out sources
    const val PAYMENT_OUT_SCREEN = "payment_out_screen"
    const val ADD_PAYMENT_OUT_INTRO_POPUP = "add_payment_out_intro_popup"
}

// Properties - ADD THESE
object Properties {
    // ... existing properties ...

    // NEW - Transaction type (CRITICAL - add to almost all events)
    const val TRANSACTION_TYPE = "transaction_type"

    // NEW - Party properties (for Payment In/Out)
    const val VAANI_PARTY_NAME = "vn_party_name"
    const val FINAL_PARTY_NAME = "final_party_name"
    const val PARTY_EDITED = "party_edited"

    // NEW - Phone property (for Payment In/Out)
    const val VAANI_PHONE = "vn_phone"
    const val FINAL_PHONE = "final_phone"

    // NEW - Field name for granular tracking
    const val FIELD_NAME = "field_name"
    const val FIELD_OLD_VALUE = "field_old_value"
    const val FIELD_NEW_VALUE = "field_new_value"
}
```

---

## Event Specifications

### 1. Session Events

#### `VN_opened`
**When**: User opens VAANI from any entry point

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `source` | String | Yes | Entry point (see SourceValues) | Understand where users discover VAANI |
| `used_vn_before` | Boolean | Yes | Has user used VAANI before | Track new vs returning users |
| `transaction_type` | String | **NEW - Yes** | "expense", "payment_in", "payment_out" | **Critical**: Know which flow user entered |

**Change Required**:
- Remove hardcoded `use_case_type = EXPENSE`
- Add `transaction_type` as parameter to `logVaaniOpened()`

```kotlin
// BEFORE
fun logVaaniOpened(source: String, hasExploredVaani: Boolean)

// AFTER
fun logVaaniOpened(source: String, hasExploredVaani: Boolean, transactionType: String)
```

---

#### `VN_session_started`
**When**: VAANI session begins (after splash/loading)

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `transaction_type` | String | **NEW - Yes** | "expense", "payment_in", "payment_out" | Track session by transaction type |
| `session_id` | String | **NEW - Yes** | Unique session identifier | Link all events in session |

**Change Required**:
- Remove hardcoded `use_case_type = EXPENSE`
- Add both parameters

```kotlin
// BEFORE
fun logSessionStarted()

// AFTER
fun logSessionStarted(transactionType: String, sessionId: String)
```

---

#### `VN_session_ended`
**When**: User exits VAANI (any exit path)

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | **NEW - Yes** | Session identifier | Link to session start |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Know which flow ended |
| `exit_reason` | String | **NEW - Optional** | "saved", "cancelled", "error", "timeout" | Understand exit patterns |
| `time_spent_seconds` | Long | **NEW - Yes** | Total time in session | Session duration tracking |

**Change Required**: Add all parameters

```kotlin
// BEFORE
fun logSessionEnded()

// AFTER
fun logSessionEnded(
    sessionId: String,
    transactionType: String,
    exitReason: String?,
    timeSpentSeconds: Long
)
```

---

### 2. Voice Input Events

#### `VN_mic_button_clicked`
**When**: User taps mic button to start/stop recording

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `mic_status` | Boolean | Yes | true=started recording, false=stopped | Track recording patterns |
| `session_id` | String | **NEW - Yes** | Session identifier | Link to session |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |

---

#### `VN_mute_toggle`
**When**: User toggles mute checkbox

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `mute_status` | Boolean | Yes | true=muted, false=unmuted | Track mute usage |
| `session_id` | String | Yes | Session identifier | Link to session |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |

---

#### `VN_recording_completed`
**When**: Voice recording finishes (manual stop or auto-timeout)

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `recording_duration_ms` | Long | Yes | Recording length in ms | Understand speaking patterns |
| `auto_stop` | Boolean | Yes | true=timeout, false=manual | Track timeout frequency |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare recording patterns across types |
| `recording_number` | Int | **NEW - Optional** | Which recording in session (1st, 2nd, etc) | Track multi-turn conversations |

---

#### `VN_audio_uploaded`
**When**: Audio file successfully uploaded to S3

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `time_taken_ms` | Long | Yes | Upload duration | Track upload performance |
| `network_ping_ms` | Long | Optional | Network latency | Correlate with speed |
| `network_download_mbps` | Double | Optional | Download speed | Network quality |
| `network_upload_mbps` | Double | Optional | Upload speed | Network quality |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |
| `audio_size_bytes` | Long | **NEW - Optional** | File size | Correlate with upload time |

---

#### `VN_stt_received`
**When**: Speech-to-text transcription received from server

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `time_taken_ms` | Long | Yes | Time from upload to STT | Track STT latency |
| `network_ping_ms` | Long | Optional | Network latency | Correlate with speed |
| `network_download_mbps` | Double | Optional | Download speed | Network quality |
| `network_upload_mbps` | Double | Optional | Upload speed | Network quality |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |
| `transcript_length` | Int | **NEW - Yes** | Character count of transcription | Understand input complexity |
| `language_detected` | String | **NEW - Optional** | "hi", "en", "hinglish" | Language distribution |

---

#### `VN_voice_processed`
**When**: Voice processing complete (transcription ready to show)

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `transcript_length` | Int | Yes | Character count | Understand input length |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |

---

#### `VN_ai_data_received`
**When**: AI-extracted invoice/transaction data received from server

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `time_taken_ms` | Long | Yes | Time from upload to data ready | Track AI latency |
| `network_ping_ms` | Long | Optional | Network latency | Correlate with speed |
| `network_download_mbps` | Double | Optional | Download speed | Network quality |
| `network_upload_mbps` | Double | Optional | Upload speed | Network quality |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |
| `fields_extracted_count` | Int | **NEW - Optional** | Number of fields AI filled | Track AI completeness |
| `has_missing_fields` | Boolean | **NEW - Optional** | Were follow-up questions needed | Track AI accuracy |

---

### 3. Transaction Events

#### `VN_transaction_saved` (RENAMED from `VN_expense_saved`)
**When**: User confirms and saves the transaction

> **IMPORTANT**: This replaces `VN_expense_saved`. Use the same event for ALL transaction types.

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `transaction_type` | String | **Yes** | "expense", "payment_in", "payment_out" | **Critical**: Know transaction type |
| `vn_item_count` | Int | Yes | Items count from VAANI | Compare AI vs final |
| `final_item_count` | Int | Yes | Final items count | Track user edits |
| `items_edited` | Boolean | Yes | Were items modified | Track edit rate |
| `vn_total_amount` | String | Yes | Total amount from VAANI | Compare AI vs final |
| `final_total_amount` | String | Yes | Final total amount | Track amount changes |
| `amount_edited` | Boolean | **NEW - Yes** | Was amount modified | Track amount edit rate |
| `vn_payment_type` | String | Yes | Payment type from VAANI | Compare AI vs final |
| `final_payment_type` | String | Yes | Final payment type | Track payment changes |
| `payment_type_edited` | Boolean | **NEW - Yes** | Was payment type modified | Track payment edit rate |
| `time_to_create_invoice` | Long | Yes | Seconds from start to save | Track total time |
| `user_chats_count` | Int | Yes | Conversation turns | Track conversation length |

**Expense-specific properties** (only when `transaction_type` = "expense"):

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `vn_category` | String | Yes | Category from VAANI |
| `final_category` | String | Yes | Final category |
| `category_edited` | Boolean | Yes | Was category modified |

**Payment-specific properties** (only when `transaction_type` = "payment_in" or "payment_out"):

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `vn_party_name` | String | **NEW - Yes** | Party name from VAANI |
| `final_party_name` | String | **NEW - Yes** | Final party name |
| `party_edited` | Boolean | **NEW - Yes** | Was party modified |
| `vn_phone` | String | **NEW - Optional** | Phone from VAANI (if extracted) |
| `final_phone` | String | **NEW - Optional** | Final phone |
| `is_new_party` | Boolean | **NEW - Optional** | Was this a new party or existing |

```kotlin
// Implementation example
fun logTransactionSaved(
    transactionType: String,
    sessionId: String,
    // Common properties
    vaaniItemCount: Int,
    finalItemCount: Int,
    vaaniTotalAmount: String,
    finalTotalAmount: String,
    vaaniPaymentType: String,
    finalPaymentType: String,
    timeToCreate: Long,
    userChatsCount: Int,
    // Expense-specific (nullable)
    vaaniCategory: String? = null,
    finalCategory: String? = null,
    // Payment-specific (nullable)
    vaaniPartyName: String? = null,
    finalPartyName: String? = null,
    vaaniPhone: String? = null,
    finalPhone: String? = null,
    isNewParty: Boolean? = null
)
```

---

#### `VN_transaction_cancelled` (RENAMED from `VN_expense_cancelled`)
**When**: User exits without saving

> **IMPORTANT**: This replaces `VN_expense_cancelled`. Use the same event for ALL transaction types.

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `transaction_type` | String | **Yes** | Transaction type | Know which flow was cancelled |
| `time_spent_seconds` | Long | Yes | Time spent before cancel | Understand drop-off timing |
| `cancel_stage` | String | **NEW - Yes** | Where user cancelled: "recording", "processing", "review", "editing" | Identify problematic stages |
| `had_data` | Boolean | **NEW - Optional** | Was there any extracted data | Did AI work before cancel |
| `cancel_reason` | String | **NEW - Optional** | If exit feedback collected | Understand why users cancel |

```kotlin
fun logTransactionCancelled(
    transactionType: String,
    sessionId: String,
    timeSpentSeconds: Long,
    cancelStage: String,
    hadData: Boolean? = null,
    cancelReason: String? = null
)
```

---

### 4. Suggestion Events

#### `VN_category_suggestion_selected`
**When**: User selects a different category (Expense only)

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `user_selected` | String | Yes | Category user chose | What user preferred |
| `server_sent` | String | Yes | Original AI category | What AI suggested |
| `transaction_type` | String | **NEW - Yes** | Always "expense" for this | Consistency |

> **Note**: This event is only for Expense. For payments, use `VN_party_suggestion_selected`.

---

#### `VN_item_suggestion_selected`
**When**: User selects a different item name

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `user_selected` | String | Yes | Item name user chose | What user preferred |
| `server_sent` | String | Yes | Original AI item | What AI suggested |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |
| `item_index` | Int | **NEW - Optional** | Which item (0-indexed) | Track multi-item edits |

---

#### `VN_payment_type_suggestion_selected`
**When**: User selects a different payment type

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `user_selected` | String | Yes | Payment type user chose | What user preferred |
| `server_sent` | String | Yes | Original AI payment type | What AI suggested |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |

---

#### `VN_party_suggestion_selected` (NEW EVENT)
**When**: User selects a different party/customer name (Payment In/Out)

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `user_selected` | String | Yes | Party name user chose | What user preferred |
| `server_sent` | String | Yes | Original AI party name | What AI suggested |
| `transaction_type` | String | Yes | "payment_in" or "payment_out" | Track by type |
| `is_existing_party` | Boolean | Optional | Selected from contacts/history | New vs existing party |
| `selection_source` | String | Optional | "search", "recent", "contacts", "typed" | How user found party |

```kotlin
// NEW function to add
fun logPartySuggestionSelected(
    userSelected: String,
    serverSent: String,
    sessionId: String,
    transactionType: String,
    isExistingParty: Boolean? = null,
    selectionSource: String? = null
)
```

---

### 5. Feedback Events

#### `VN_feedback`
**When**: User submits star rating

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `stars` | Int | Yes | Rating 1-5 | User satisfaction |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare satisfaction across types |
| `transaction_saved` | Boolean | **NEW - Optional** | Did user complete transaction | Context for rating |

---

#### `VN_feedback_closed`
**When**: User dismisses rating dialog without submitting

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |

---

#### `VN_feature_feedback`
**When**: User submits feature request/feedback

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `features` | String | Yes | Comma-separated features | What users want |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Context for feedback |

---

#### `VN_feature_feedback_closed`
**When**: User dismisses feature feedback without submitting

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |

---

#### `VN_exit_feedback`
**When**: User provides reasons for exiting

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `exit_reasons` | String | Yes | Comma-separated reasons | Understand drop-off |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare across types |
| `stage` | String | **NEW - Optional** | Where user was when exiting | Context for exit |

---

### 6. Error Events

#### `VN_api_error`
**When**: Backend API fails

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `error_type` | String | Yes | "no_internet", "server_error", "audio_process_failed", "timeout" | Categorize errors |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare error rates across types |
| `api_endpoint` | String | **NEW - Optional** | Which API failed | Debug specific endpoints |
| `error_code` | Int | **NEW - Optional** | HTTP status code | More granular tracking |
| `retry_count` | Int | **NEW - Optional** | How many retries attempted | Track retry behavior |

---

#### `VN_error_occurred`
**When**: Client-side error occurs

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `error_type` | String | Yes | "chat_limit_exceeded", "time_limit_exceeded", "permission_denied", "storage_full" | Categorize errors |
| `transaction_type` | String | **NEW - Yes** | Transaction type | Compare error rates across types |
| `error_details` | String | **NEW - Optional** | Additional context | Debug assistance |

---

### 7. Intro Popup Events

#### `VN_intro_popup_add_manual`
**When**: User chooses manual entry instead of VAANI

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `transaction_type` | String | **NEW - Yes** | Which transaction type | Track manual preference by type |
| `source` | String | **NEW - Yes** | Where popup appeared | Context for decision |

```kotlin
// NEW function signature
fun logIntroPopupAddManual(transactionType: String, source: String)
```

---

#### `VN_intro_popup_use_vaani`
**When**: User chooses to use VAANI

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `transaction_type` | String | **NEW - Yes** | Which transaction type | Track VAANI adoption by type |
| `source` | String | **NEW - Yes** | Where popup appeared | Context for decision |

```kotlin
// NEW function signature
fun logIntroPopupUseVaani(transactionType: String, source: String)
```

---

## New Events to Add

### `VN_transaction_review_shown` (NEW)
**When**: Review/confirmation screen appears to user

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `transaction_type` | String | Yes | Transaction type | Compare across types |
| `fields_shown` | Int | Yes | Number of fields displayed | Track UI complexity |
| `missing_fields` | Int | Yes | Fields user needs to fill | Track AI completeness |
| `time_to_review_ms` | Long | Yes | Time from start to review | Track time-to-value |

**Why Add This**: Understand the exact moment user sees extracted data. Helps measure:
- Time from speech to review
- How complete AI extraction is
- Drop-off at review stage vs later

```kotlin
fun logTransactionReviewShown(
    sessionId: String,
    transactionType: String,
    fieldsShown: Int,
    missingFields: Int,
    timeToReviewMs: Long
)
```

---

### `VN_field_edited` (NEW)
**When**: User manually edits any field

| Property | Type | Required | Description | Why We Need It |
|----------|------|----------|-------------|----------------|
| `session_id` | String | Yes | Session identifier | Link to session |
| `transaction_type` | String | Yes | Transaction type | Compare across types |
| `field_name` | String | Yes | Which field: "amount", "item_name", "category", "party_name", "payment_type" | Track problematic fields |
| `field_old_value` | String | Optional | Original AI value | What AI got wrong |
| `field_new_value` | String | Optional | User's correction | What was correct |
| `edit_method` | String | Optional | "keyboard", "suggestion", "voice" | How user corrected |

**Why Add This**: Granular tracking of which fields AI gets wrong most often. Current `items_edited` is boolean only - this gives us field-level insights.

```kotlin
fun logFieldEdited(
    sessionId: String,
    transactionType: String,
    fieldName: String,
    oldValue: String? = null,
    newValue: String? = null,
    editMethod: String? = null
)
```

---

## Deprecated Events

| Event | Status | Replacement |
|-------|--------|-------------|
| `VN_expense_saved` | DEPRECATED | Use `VN_transaction_saved` with `transaction_type: "expense"` |
| `VN_expense_cancelled` | DEPRECATED | Use `VN_transaction_cancelled` with `transaction_type: "expense"` |

**Migration Strategy**:
1. Add new event names to Constants
2. Update logger functions to use new names
3. Keep old function signatures but have them call new functions internally
4. Mark old functions as @Deprecated

```kotlin
@Deprecated("Use logTransactionSaved instead", ReplaceWith("logTransactionSaved(...)"))
fun logExpenseSaved(...) {
    logTransactionSaved(transactionType = "expense", ...)
}
```

---

## Implementation Checklist

### Phase 1: Constants Update
- [ ] Add new `UseCaseType` values: PAYMENT_IN, PAYMENT_OUT
- [ ] Add new `SourceValues`: payment_in_screen, payment_out_screen, etc.
- [ ] Add new properties: TRANSACTION_TYPE, VAANI_PARTY_NAME, FINAL_PARTY_NAME, PARTY_EDITED, etc.
- [ ] Rename EXPENSE value to lowercase "expense" for consistency

### Phase 2: Update Existing Events
- [ ] Add `transaction_type` parameter to ALL event logging functions
- [ ] Update `logVaaniOpened()` - add transactionType parameter
- [ ] Update `logSessionStarted()` - add transactionType and sessionId parameters
- [ ] Update `logSessionEnded()` - add all new parameters
- [ ] Update all voice input events with transactionType
- [ ] Update all feedback events with transactionType
- [ ] Update all error events with transactionType
- [ ] Update intro popup events with transactionType and source

### Phase 3: Rename Transaction Events
- [ ] Create `VN_transaction_saved` constant
- [ ] Create `VN_transaction_cancelled` constant
- [ ] Create `logTransactionSaved()` function with all properties
- [ ] Create `logTransactionCancelled()` function with all properties
- [ ] Mark old functions as @Deprecated
- [ ] Update all call sites

### Phase 4: Add New Events
- [ ] Add `VN_party_suggestion_selected` constant and function
- [ ] Add `VN_transaction_review_shown` constant and function
- [ ] Add `VN_field_edited` constant and function

### Phase 5: Testing
- [ ] Test Expense flow - all events fire correctly
- [ ] Test Payment In flow - all events fire with correct transaction_type
- [ ] Test Payment Out flow - all events fire with correct transaction_type
- [ ] Verify Mixpanel receives all properties correctly
- [ ] Check no data loss from deprecated events

---

## Questions for Product/Analytics Team

1. **Field value logging**: Should we log actual values (amount, party name) or just track that edits happened? Privacy considerations?

2. **Session timeout**: What should `exit_reason` be when session times out vs user explicitly exits?

3. **Recording number**: How do we handle multi-turn conversations - should `recording_number` reset each session?

4. **Network speed**: Are network metrics still needed for all upload/STT/AI events or can we simplify?

---

*Document Version: 1.0*
*Last Updated: December 24, 2024*
*Author: Claude Code (via Product Team)*
