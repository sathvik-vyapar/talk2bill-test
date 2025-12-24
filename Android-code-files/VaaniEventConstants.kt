package vyapar.shared.presentation.vaani

/**
 * Constants for Vaani analytics events and properties.
 * Based on: Mixpanel Tracking Sheet (Safari Pod) - Expense-VAANI
 */
object VaaniEventConstants {
    
    // Event Names
    object Events {
        const val VAANI_OPENED = "VN_opened"
        const val VAANI_SESSION_STARTED = "VN_session_started"
        const val VAANI_SESSION_ENDED = "VN_session_ended"
        const val VAANI_MIC_BUTTON_CLICKED = "VN_mic_button_clicked"
        const val VAANI_MUTE_TOGGLE = "VN_mute_toggle"
        const val VAANI_RECORDING_COMPLETED = "VN_recording_completed"
        const val VAANI_VOICE_PROCESSED = "VN_voice_processed"
        
        /**
         * VN_api_error - Triggered when any backend API fails
         * Examples: server_error, audio_process_failed
         */
        const val VAANI_API_ERROR = "VN_api_error"
        
        const val VAANI_EXPENSE_SAVED = "VN_expense_saved"
        const val VAANI_EXPENSE_CANCELLED = "VN_expense_cancelled"
        
        /**
         * VN_error_occurred - Triggered for client-side errors (not backend API failures)
         * Examples: chat_limit_exceeded, time_limit_exceeded, permission_denied
         */
        const val VAANI_ERROR_OCCURRED = "VN_error_occurred"
        
        const val VAANI_FEEDBACK = "VN_feedback"
        const val VAANI_FEEDBACK_CLOSED = "VN_feedback_closed"
        const val VAANI_INTRO_POPUP_ADD_MANUAL = "VN_intro_popup_add_manual"
        const val VAANI_INTRO_POPUP_USE_VAANI = "VN_intro_popup_use_vaani"

        const val VAANI_FEATURE_FEEDBACK = "VN_feature_feedback"
        const val VAANI_FEATURE_FEEDBACK_CLOSED = "VN_feature_feedback_closed"
        const val VAANI_EXIT_FEEDBACK = "VN_exit_feedback"
        
        const val VAANI_CATEGORY_SUGGESTION_SELECTED = "VN_category_suggestion_selected"
        const val VAANI_ITEM_SUGGESTION_SELECTED = "VN_item_suggestion_selected"
        const val VAANI_PAYMENT_TYPE_SUGGESTION_SELECTED = "VN_payment_type_suggestion_selected"

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

    }
    
    // Property Keys
    object Properties {
        // Source property - where user entered Vaani from
        const val SOURCE = "source"
        
        // User behavior property
        const val USER_HAS_USED_VAANI_BEFORE = "used_vn_before"
        
        // Use case type property
        const val USE_CASE_TYPE = "use_case_type"
        
        // Mic status property
        const val MIC_STATUS = "mic_status"
        
        // Mute status property
        const val MUTE_STATUS = "mute_status"
        
        // Session properties
        const val SESSION_ID = "session_id"
        
        // Recording properties
        const val RECORDING_DURATION_MS = "recording_duration_ms"
        const val AUTO_STOP = "auto_stop"
        
        // Voice processing properties
        const val TRANSCRIPT_LENGTH = "transcript_length"
        
        // Expense saved properties
        const val VAANI_ITEM_COUNT = "vn_item_count"
        const val FINAL_ITEM_COUNT = "final_item_count"
        const val ITEMS_EDITED = "items_edited"
        const val VAANI_TOTAL_AMOUNT = "vn_total_amount"
        const val FINAL_TOTAL_AMOUNT = "final_total_amount"
        const val VAANI_CATEGORY = "vn_category"
        const val FINAL_CATEGORY = "final_category"
        const val CATEGORY_EDITED = "category_edited"
        const val VAANI_PAYMENT_TYPE = "vn_payment_type"
        const val FINAL_PAYMENT_TYPE = "final_payment_type"
        const val TIME_TO_CREATE_INVOICE = "time_to_create_invoice"
        const val USER_CHATS_COUNT = "user_chats_count"
        const val TIME_SPENT_SECONDS = "time_spent_seconds"
        
        // Error properties
        const val ERROR_TYPE = "error_type"
        
        // Feedback properties
        const val STARS = "stars"
        const val FEATURES = "features"
        const val EXIT_REASONS = "exit_reasons"
        
        // Suggestion selection properties
        const val USER_SELECTED = "user_selected"
        const val SERVER_SENT = "server_sent"
        
        // Timing properties
        const val TIME_TAKEN_MS = "time_taken_ms"
        
        // Network speed properties
        const val NETWORK_PING_MS = "network_ping_ms"
        const val NETWORK_DOWNLOAD_MBPS = "network_download_mbps"
        const val NETWORK_UPLOAD_MBPS = "network_upload_mbps"
    }
    
    // Source Values - where Vaani can be accessed from
    object SourceValues {
        const val HOME_SCREEN_POP_UP = "home_screen_pop_up"
        const val EXPENSE_SCREEN = "expense_screen"
        const val ADD_EXPENSE_INTRO_POPUP = "add_expense_intro_popup"
        const val OTHER = "other" // Default fallback for unknown sources
    }
    
    // Use Case Type Values
    object UseCaseType {
        const val EXPENSE = "Expense"
        // Add more use case types as needed (Income, etc.)
    }
    
    // Error Type Values
    object ErrorType {
        const val NO_INTERNET = "no_internet"
        const val SERVER_ERROR = "server_error"
        const val AUDIO_PROCESS_FAILED = "audio_process_failed"
        const val CHAT_LIMIT_EXCEEDED = "chat_limit_exceeded"
        const val TIME_LIMIT_EXCEEDED = "time_limit_exceeded"
        const val PERMISSION_DENIED = "permission_denied"
    }
}
