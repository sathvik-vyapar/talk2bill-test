package vyapar.shared.presentation.vaani

/**
 * Constants for Vaani analytics events and properties.
 * Supports multiple transaction types: Expense, Payment In, Payment Out, Sale Invoice, etc.
 *
 * Based on: Mixpanel Tracking Sheet (Safari Pod) - VAANI
 * Updated: December 2024 - Multi-transaction type support
 */
object VaaniEventConstants {

    // Event Names
    object Events {
        // ============================================
        // SESSION EVENTS
        // ============================================
        const val VAANI_OPENED = "VN_opened"
        const val VAANI_SESSION_STARTED = "VN_session_started"
        const val VAANI_SESSION_ENDED = "VN_session_ended"

        // ============================================
        // VOICE INPUT EVENTS
        // ============================================
        const val VAANI_MIC_BUTTON_CLICKED = "VN_mic_button_clicked"
        const val VAANI_MUTE_TOGGLE = "VN_mute_toggle"
        const val VAANI_RECORDING_COMPLETED = "VN_recording_completed"
        const val VAANI_VOICE_PROCESSED = "VN_voice_processed"
        const val VAANI_AUDIO_UPLOADED = "VN_audio_uploaded"

        /**
         * VN_stt_received - Triggered when STT (Speech-to-Text) transcription is received from server
         * Time tracked starting from audio upload completion to STT received
         */
        const val VAANI_STT_RECEIVED = "VN_stt_received"

        /**
         * VN_ai_data_received - Triggered when AI data (invoice) is received from server
         * Time tracked starting from audio upload completion to invoice ready
         */
        const val VAANI_AI_DATA_RECEIVED = "VN_ai_data_received"

        // ============================================
        // TRANSACTION EVENTS (Generic - for all types)
        // ============================================

        /**
         * VN_transaction_saved - Triggered when user saves any transaction type
         * Use transaction_type property to identify: expense, payment_in, payment_out, etc.
         */
        const val VAANI_TRANSACTION_SAVED = "VN_transaction_saved"

        /**
         * VN_transaction_cancelled - Triggered when user cancels/exits without saving
         * Use transaction_type property to identify: expense, payment_in, payment_out, etc.
         */
        const val VAANI_TRANSACTION_CANCELLED = "VN_transaction_cancelled"

        /**
         * VN_transaction_review_shown - Triggered when review/confirmation screen appears
         * NEW: Tracks when user sees extracted data for the first time
         */
        const val VAANI_TRANSACTION_REVIEW_SHOWN = "VN_transaction_review_shown"

        // Deprecated - use VAANI_TRANSACTION_SAVED with transaction_type = "expense"
        @Deprecated("Use VAANI_TRANSACTION_SAVED instead", ReplaceWith("VAANI_TRANSACTION_SAVED"))
        const val VAANI_EXPENSE_SAVED = "VN_expense_saved"

        // Deprecated - use VAANI_TRANSACTION_CANCELLED with transaction_type = "expense"
        @Deprecated("Use VAANI_TRANSACTION_CANCELLED instead", ReplaceWith("VAANI_TRANSACTION_CANCELLED"))
        const val VAANI_EXPENSE_CANCELLED = "VN_expense_cancelled"

        // ============================================
        // SUGGESTION EVENTS
        // ============================================

        /** Category suggestion - Expense only */
        const val VAANI_CATEGORY_SUGGESTION_SELECTED = "VN_category_suggestion_selected"

        /** Item name suggestion - All transaction types */
        const val VAANI_ITEM_SUGGESTION_SELECTED = "VN_item_suggestion_selected"

        /** Payment type suggestion - All transaction types */
        const val VAANI_PAYMENT_TYPE_SUGGESTION_SELECTED = "VN_payment_type_suggestion_selected"

        /**
         * VN_party_suggestion_selected - Triggered when user selects different party/customer
         * NEW: For Payment In, Payment Out, Sale Invoice, etc.
         */
        const val VAANI_PARTY_SUGGESTION_SELECTED = "VN_party_suggestion_selected"

        /**
         * VN_field_edited - Triggered when user manually edits any field
         * NEW: Granular tracking of which fields AI gets wrong
         */
        const val VAANI_FIELD_EDITED = "VN_field_edited"

        // ============================================
        // FEEDBACK EVENTS
        // ============================================
        const val VAANI_FEEDBACK = "VN_feedback"
        const val VAANI_FEEDBACK_CLOSED = "VN_feedback_closed"
        const val VAANI_FEATURE_FEEDBACK = "VN_feature_feedback"
        const val VAANI_FEATURE_FEEDBACK_CLOSED = "VN_feature_feedback_closed"
        const val VAANI_EXIT_FEEDBACK = "VN_exit_feedback"

        // ============================================
        // ERROR EVENTS
        // ============================================

        /**
         * VN_api_error - Triggered when any backend API fails
         * Examples: server_error, audio_process_failed
         */
        const val VAANI_API_ERROR = "VN_api_error"

        /**
         * VN_error_occurred - Triggered for client-side errors (not backend API failures)
         * Examples: chat_limit_exceeded, time_limit_exceeded, permission_denied
         */
        const val VAANI_ERROR_OCCURRED = "VN_error_occurred"

        // ============================================
        // INTRO POPUP EVENTS
        // ============================================
        const val VAANI_INTRO_POPUP_ADD_MANUAL = "VN_intro_popup_add_manual"
        const val VAANI_INTRO_POPUP_USE_VAANI = "VN_intro_popup_use_vaani"
    }

    // Property Keys
    object Properties {
        // ============================================
        // CORE PROPERTIES (Required for most events)
        // ============================================

        /** Session identifier - links all events in a session */
        const val SESSION_ID = "session_id"

        /**
         * Transaction type - CRITICAL: Add to ALL events
         * Values: "expense", "payment_in", "payment_out", "sale_invoice", "sale_order", "delivery_challan"
         */
        const val TRANSACTION_TYPE = "transaction_type"

        /** Entry point - where user accessed VAANI from */
        const val SOURCE = "source"

        /** Has user used VAANI before */
        const val USER_HAS_USED_VAANI_BEFORE = "used_vn_before"

        /** Legacy: use_case_type (prefer TRANSACTION_TYPE) */
        const val USE_CASE_TYPE = "use_case_type"

        // ============================================
        // RECORDING PROPERTIES
        // ============================================

        /** Mic on/off state after click */
        const val MIC_STATUS = "mic_status"

        /** Mute checkbox state after toggle */
        const val MUTE_STATUS = "mute_status"

        /** Recording length in milliseconds */
        const val RECORDING_DURATION_MS = "recording_duration_ms"

        /** Was recording auto-stopped due to timeout */
        const val AUTO_STOP = "auto_stop"

        /** Which recording in session (1st, 2nd, etc) */
        const val RECORDING_NUMBER = "recording_number"

        /** Character count of transcription */
        const val TRANSCRIPT_LENGTH = "transcript_length"

        /** Detected language: "hi", "en", "hinglish" */
        const val LANGUAGE_DETECTED = "language_detected"

        /** Audio file size in bytes */
        const val AUDIO_SIZE_BYTES = "audio_size_bytes"

        // ============================================
        // TRANSACTION DATA PROPERTIES (Common)
        // ============================================

        /** Item count from VAANI AI */
        const val VAANI_ITEM_COUNT = "vn_item_count"

        /** Final item count after user edits */
        const val FINAL_ITEM_COUNT = "final_item_count"

        /** Were items modified by user */
        const val ITEMS_EDITED = "items_edited"

        /** Total amount from VAANI AI */
        const val VAANI_TOTAL_AMOUNT = "vn_total_amount"

        /** Final total amount after user edits */
        const val FINAL_TOTAL_AMOUNT = "final_total_amount"

        /** Was amount modified by user */
        const val AMOUNT_EDITED = "amount_edited"

        /** Payment type from VAANI AI */
        const val VAANI_PAYMENT_TYPE = "vn_payment_type"

        /** Final payment type after user edits */
        const val FINAL_PAYMENT_TYPE = "final_payment_type"

        /** Was payment type modified by user */
        const val PAYMENT_TYPE_EDITED = "payment_type_edited"

        // ============================================
        // EXPENSE-SPECIFIC PROPERTIES
        // ============================================

        /** Expense category from VAANI AI */
        const val VAANI_CATEGORY = "vn_category"

        /** Final expense category after user edits */
        const val FINAL_CATEGORY = "final_category"

        /** Was category modified by user */
        const val CATEGORY_EDITED = "category_edited"

        // ============================================
        // PAYMENT-SPECIFIC PROPERTIES (Payment In/Out)
        // ============================================

        /** Party/customer name from VAANI AI */
        const val VAANI_PARTY_NAME = "vn_party_name"

        /** Final party name after user edits */
        const val FINAL_PARTY_NAME = "final_party_name"

        /** Was party name modified by user */
        const val PARTY_EDITED = "party_edited"

        /** Phone number from VAANI AI */
        const val VAANI_PHONE = "vn_phone"

        /** Final phone number after user edits */
        const val FINAL_PHONE = "final_phone"

        /** Is this a new party or existing */
        const val IS_NEW_PARTY = "is_new_party"

        /** Was party selected from existing contacts/history */
        const val IS_EXISTING_PARTY = "is_existing_party"

        /** How user found party: "search", "recent", "contacts", "typed" */
        const val SELECTION_SOURCE = "selection_source"

        // ============================================
        // TIMING PROPERTIES
        // ============================================

        /** Time taken for operation in milliseconds */
        const val TIME_TAKEN_MS = "time_taken_ms"

        /** Seconds from session start to save */
        const val TIME_TO_CREATE_INVOICE = "time_to_create_invoice"

        /** Total time spent in session (seconds) */
        const val TIME_SPENT_SECONDS = "time_spent_seconds"

        /** Time from start to review screen (ms) */
        const val TIME_TO_REVIEW_MS = "time_to_review_ms"

        /** Number of conversation turns */
        const val USER_CHATS_COUNT = "user_chats_count"

        // ============================================
        // NETWORK PROPERTIES
        // ============================================

        /** Network ping latency in ms */
        const val NETWORK_PING_MS = "network_ping_ms"

        /** Download speed in Mbps */
        const val NETWORK_DOWNLOAD_MBPS = "network_download_mbps"

        /** Upload speed in Mbps */
        const val NETWORK_UPLOAD_MBPS = "network_upload_mbps"

        // ============================================
        // ERROR PROPERTIES
        // ============================================

        /** Error type/category */
        const val ERROR_TYPE = "error_type"

        /** Which API endpoint failed */
        const val API_ENDPOINT = "api_endpoint"

        /** HTTP status code */
        const val ERROR_CODE = "error_code"

        /** Number of retry attempts */
        const val RETRY_COUNT = "retry_count"

        /** Additional error context */
        const val ERROR_DETAILS = "error_details"

        // ============================================
        // FEEDBACK PROPERTIES
        // ============================================

        /** Star rating 1-5 */
        const val STARS = "stars"

        /** Comma-separated feature requests */
        const val FEATURES = "features"

        /** Comma-separated exit reasons */
        const val EXIT_REASONS = "exit_reasons"

        /** Did user complete transaction before feedback */
        const val TRANSACTION_SAVED = "transaction_saved"

        // ============================================
        // SUGGESTION PROPERTIES
        // ============================================

        /** Value user selected */
        const val USER_SELECTED = "user_selected"

        /** Original value from AI/server */
        const val SERVER_SENT = "server_sent"

        /** Item index for multi-item edits (0-indexed) */
        const val ITEM_INDEX = "item_index"

        // ============================================
        // FIELD EDIT PROPERTIES (for VN_field_edited)
        // ============================================

        /** Field name: "amount", "item_name", "category", "party_name", "payment_type" */
        const val FIELD_NAME = "field_name"

        /** Original AI value before edit */
        const val FIELD_OLD_VALUE = "field_old_value"

        /** User's corrected value */
        const val FIELD_NEW_VALUE = "field_new_value"

        /** How user made edit: "keyboard", "suggestion", "voice" */
        const val EDIT_METHOD = "edit_method"

        // ============================================
        // SESSION END PROPERTIES
        // ============================================

        /** Exit reason: "saved", "cancelled", "error", "timeout" */
        const val EXIT_REASON = "exit_reason"

        /** Where user cancelled: "recording", "processing", "review", "editing" */
        const val CANCEL_STAGE = "cancel_stage"

        /** Was there any extracted data before cancel */
        const val HAD_DATA = "had_data"

        // ============================================
        // REVIEW SCREEN PROPERTIES
        // ============================================

        /** Number of fields displayed on review screen */
        const val FIELDS_SHOWN = "fields_shown"

        /** Number of fields user needs to fill */
        const val MISSING_FIELDS = "missing_fields"

        /** Number of fields AI successfully extracted */
        const val FIELDS_EXTRACTED_COUNT = "fields_extracted_count"

        /** Were follow-up questions needed */
        const val HAS_MISSING_FIELDS = "has_missing_fields"
    }

    // Source Values - where Vaani can be accessed from
    object SourceValues {
        // ============================================
        // EXPENSE SOURCES
        // ============================================
        const val HOME_SCREEN_POP_UP = "home_screen_pop_up"
        const val EXPENSE_SCREEN = "expense_screen"
        const val ADD_EXPENSE_INTRO_POPUP = "add_expense_intro_popup"

        // ============================================
        // PAYMENT IN SOURCES
        // ============================================
        const val PAYMENT_IN_SCREEN = "payment_in_screen"
        const val ADD_PAYMENT_IN_INTRO_POPUP = "add_payment_in_intro_popup"

        // ============================================
        // PAYMENT OUT SOURCES
        // ============================================
        const val PAYMENT_OUT_SCREEN = "payment_out_screen"
        const val ADD_PAYMENT_OUT_INTRO_POPUP = "add_payment_out_intro_popup"

        // ============================================
        // SALE INVOICE SOURCES (Future)
        // ============================================
        const val SALE_INVOICE_SCREEN = "sale_invoice_screen"
        const val ADD_SALE_INVOICE_INTRO_POPUP = "add_sale_invoice_intro_popup"

        // ============================================
        // SALE ORDER SOURCES (Future)
        // ============================================
        const val SALE_ORDER_SCREEN = "sale_order_screen"
        const val ADD_SALE_ORDER_INTRO_POPUP = "add_sale_order_intro_popup"

        // ============================================
        // DELIVERY CHALLAN SOURCES (Future)
        // ============================================
        const val DELIVERY_CHALLAN_SCREEN = "delivery_challan_screen"
        const val ADD_DELIVERY_CHALLAN_INTRO_POPUP = "add_delivery_challan_intro_popup"

        // ============================================
        // COMMON
        // ============================================
        const val OTHER = "other" // Default fallback for unknown sources
    }

    // Use Case Type Values - Transaction Types
    object UseCaseType {
        // ============================================
        // CURRENT SPRINT
        // ============================================
        const val EXPENSE = "expense"
        const val PAYMENT_IN = "payment_in"
        const val PAYMENT_OUT = "payment_out"

        // ============================================
        // NEXT SPRINT
        // ============================================
        const val SALE_INVOICE = "sale_invoice"
        const val SALE_ORDER = "sale_order"
        const val DELIVERY_CHALLAN = "delivery_challan"

        // ============================================
        // FUTURE
        // ============================================
        const val PURCHASE_INVOICE = "purchase_invoice"
        const val PURCHASE_ORDER = "purchase_order"
        const val CREDIT_NOTE = "credit_note"
        const val DEBIT_NOTE = "debit_note"
    }

    // Error Type Values
    object ErrorType {
        // ============================================
        // API ERRORS (for VN_api_error)
        // ============================================
        const val NO_INTERNET = "no_internet"
        const val SERVER_ERROR = "server_error"
        const val AUDIO_PROCESS_FAILED = "audio_process_failed"
        const val TIMEOUT = "timeout"
        const val UPLOAD_FAILED = "upload_failed"
        const val STT_FAILED = "stt_failed"
        const val AI_EXTRACTION_FAILED = "ai_extraction_failed"

        // ============================================
        // CLIENT ERRORS (for VN_error_occurred)
        // ============================================
        const val CHAT_LIMIT_EXCEEDED = "chat_limit_exceeded"
        const val TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
        const val PERMISSION_DENIED = "permission_denied"
        const val STORAGE_FULL = "storage_full"
        const val MIC_NOT_AVAILABLE = "mic_not_available"
        const val RECORDING_FAILED = "recording_failed"
    }

    // Cancel Stage Values - Where user cancelled
    object CancelStage {
        const val RECORDING = "recording"
        const val PROCESSING = "processing"
        const val REVIEW = "review"
        const val EDITING = "editing"
    }

    // Exit Reason Values - Why session ended
    object ExitReason {
        const val SAVED = "saved"
        const val CANCELLED = "cancelled"
        const val ERROR = "error"
        const val TIMEOUT = "timeout"
        const val BACK_PRESSED = "back_pressed"
    }

    // Field Names - For VN_field_edited event
    object FieldName {
        const val AMOUNT = "amount"
        const val ITEM_NAME = "item_name"
        const val ITEM_QTY = "item_qty"
        const val CATEGORY = "category"
        const val PARTY_NAME = "party_name"
        const val PAYMENT_TYPE = "payment_type"
        const val PHONE = "phone"
        const val DATE = "date"
        const val NOTES = "notes"
    }

    // Edit Method Values - How user made edit
    object EditMethod {
        const val KEYBOARD = "keyboard"
        const val SUGGESTION = "suggestion"
        const val VOICE = "voice"
        const val PICKER = "picker"
    }
}
