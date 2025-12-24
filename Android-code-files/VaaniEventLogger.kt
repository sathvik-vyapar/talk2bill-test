package vyapar.shared.presentation.vaani

import vyapar.shared.data.manager.analytics.Analytics
import vyapar.shared.data.manager.analytics.AppLogger
import vyapar.shared.domain.models.ExpenseTxnPrefillData
import vyapar.shared.domain.models.PaymentTxnPrefillData
import vyapar.shared.domain.models.PrefilledItemDetailsModel
import vyapar.shared.data.model.NetworkSpeedInfo
import vyapar.shared.util.Utils
import kotlin.math.abs

/**
 * Handles all analytics event logging for Vaani feature.
 * Supports multiple transaction types: Expense, Payment In, Payment Out, etc.
 *
 * Updated: December 2024 - Multi-transaction type support
 */
class VaaniEventLogger {

    // ============================================
    // SESSION EVENTS
    // ============================================

    /**
     * Log Vaani opened event when user enters Vaani from any entry point.
     *
     * @param source Entry point (see VaaniEventConstants.SourceValues)
     * @param hasExploredVaani Has user used Vaani before
     * @param transactionType Transaction type (see VaaniEventConstants.UseCaseType)
     */
    fun logVaaniOpened(
        source: String,
        hasExploredVaani: Boolean,
        transactionType: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SOURCE] = source
        properties[VaaniEventConstants.Properties.USER_HAS_USED_VAANI_BEFORE] = hasExploredVaani
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_OPENED,
            properties
        )
    }

    /**
     * Log session started event when Vaani is launched.
     *
     * @param transactionType Transaction type being created
     * @param sessionId Unique session identifier
     */
    fun logSessionStarted(
        transactionType: String,
        sessionId: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_SESSION_STARTED,
            properties
        )
    }

    /**
     * Log session ended event when user exits Vaani.
     *
     * @param sessionId Session identifier
     * @param transactionType Transaction type
     * @param exitReason Why session ended (see VaaniEventConstants.ExitReason)
     * @param timeSpentSeconds Total time in session
     */
    fun logSessionEnded(
        sessionId: String,
        transactionType: String,
        exitReason: String,
        timeSpentSeconds: Long
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        properties[VaaniEventConstants.Properties.EXIT_REASON] = exitReason
        properties[VaaniEventConstants.Properties.TIME_SPENT_SECONDS] = timeSpentSeconds

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_SESSION_ENDED,
            properties
        )
    }

    // ============================================
    // VOICE INPUT EVENTS
    // ============================================

    /**
     * Log mic button clicked event.
     *
     * @param micStatus Status mic will be in after click (true = recording, false = stopped)
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     */
    fun logMicButtonClicked(
        micStatus: Boolean,
        sessionId: String?,
        transactionType: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.MIC_STATUS] = micStatus
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_MIC_BUTTON_CLICKED,
            properties
        )
    }

    /**
     * Log mute toggle event when user checks or unchecks mute.
     *
     * @param muteStatus Current mute status after toggle (true = muted)
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     */
    fun logMuteToggle(
        muteStatus: Boolean,
        sessionId: String?,
        transactionType: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.MUTE_STATUS] = muteStatus
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_MUTE_TOGGLE,
            properties
        )
    }

    /**
     * Log recording completed event.
     *
     * @param autoStop Whether recording was stopped automatically due to timeout
     * @param sessionId Current session ID
     * @param recordingDuration Duration of recording in milliseconds
     * @param transactionType Transaction type
     * @param recordingNumber Which recording in session (1st, 2nd, etc.) - optional
     */
    fun logRecordingCompleted(
        autoStop: Boolean,
        sessionId: String?,
        recordingDuration: Long,
        transactionType: String,
        recordingNumber: Int? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.RECORDING_DURATION_MS] = recordingDuration
        properties[VaaniEventConstants.Properties.AUTO_STOP] = autoStop
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        recordingNumber?.let {
            properties[VaaniEventConstants.Properties.RECORDING_NUMBER] = it
        }

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_RECORDING_COMPLETED,
            properties
        )
    }

    /**
     * Log voice processed event when transcription is ready to show.
     *
     * @param transcription The transcribed text
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     */
    fun logVoiceProcessed(
        transcription: String,
        sessionId: String?,
        transactionType: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSCRIPT_LENGTH] = transcription.length
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_VOICE_PROCESSED,
            properties
        )
    }

    /**
     * Log audio uploaded event when audio is successfully uploaded to S3.
     *
     * @param timeTakenMs Time taken to upload audio in milliseconds
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     * @param networkSpeed Network speed measured at upload time (optional)
     * @param audioSizeBytes Audio file size in bytes (optional)
     */
    fun logAudioUploaded(
        timeTakenMs: Long,
        sessionId: String?,
        transactionType: String,
        networkSpeed: NetworkSpeedInfo? = null,
        audioSizeBytes: Long? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TIME_TAKEN_MS] = timeTakenMs
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        audioSizeBytes?.let {
            properties[VaaniEventConstants.Properties.AUDIO_SIZE_BYTES] = it
        }
        addNetworkSpeedProperties(properties, networkSpeed)

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_AUDIO_UPLOADED,
            properties
        )
    }

    /**
     * Log STT received event when transcription is received from server.
     *
     * @param timeTakenMs Time taken from audio upload to STT received in milliseconds
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     * @param transcriptLength Character count of transcription
     * @param languageDetected Detected language (optional): "hi", "en", "hinglish"
     * @param networkSpeed Network speed measured at upload time (optional)
     */
    fun logSttReceived(
        timeTakenMs: Long,
        sessionId: String?,
        transactionType: String,
        transcriptLength: Int? = null,
        languageDetected: String? = null,
        networkSpeed: NetworkSpeedInfo? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TIME_TAKEN_MS] = timeTakenMs
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        transcriptLength?.let {
            properties[VaaniEventConstants.Properties.TRANSCRIPT_LENGTH] = it
        }
        languageDetected?.let {
            properties[VaaniEventConstants.Properties.LANGUAGE_DETECTED] = it
        }
        addNetworkSpeedProperties(properties, networkSpeed)

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_STT_RECEIVED,
            properties
        )
    }

    /**
     * Log AI data received event when invoice data is ready from server.
     *
     * @param timeTakenMs Time taken from audio upload to invoice ready in milliseconds
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     * @param fieldsExtractedCount Number of fields AI successfully extracted (optional)
     * @param hasMissingFields Were follow-up questions needed (optional)
     * @param networkSpeed Network speed measured at upload time (optional)
     */
    fun logAiDataReceived(
        timeTakenMs: Long,
        sessionId: String?,
        transactionType: String,
        fieldsExtractedCount: Int? = null,
        hasMissingFields: Boolean? = null,
        networkSpeed: NetworkSpeedInfo? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TIME_TAKEN_MS] = timeTakenMs
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        fieldsExtractedCount?.let {
            properties[VaaniEventConstants.Properties.FIELDS_EXTRACTED_COUNT] = it
        }
        hasMissingFields?.let {
            properties[VaaniEventConstants.Properties.HAS_MISSING_FIELDS] = it
        }
        addNetworkSpeedProperties(properties, networkSpeed)

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_AI_DATA_RECEIVED,
            properties
        )
    }

    // ============================================
    // TRANSACTION EVENTS
    // ============================================

    /**
     * Log transaction saved event - generic for all transaction types.
     * Use this instead of logExpenseSaved for all new implementations.
     *
     * @param transactionType Transaction type: expense, payment_in, payment_out, etc.
     * @param sessionId Session identifier
     * @param vaaniItemCount Items count from Vaani AI
     * @param finalItemCount Final items count after user edits
     * @param vaaniTotalAmount Total amount from Vaani AI
     * @param finalTotalAmount Final total amount
     * @param vaaniPaymentType Payment type from Vaani AI
     * @param finalPaymentType Final payment type
     * @param timeToCreateSeconds Seconds from session start to save
     * @param userChatsCount Number of conversation turns
     * @param vaaniCategory Category from Vaani (expense only)
     * @param finalCategory Final category (expense only)
     * @param vaaniPartyName Party name from Vaani (payment only)
     * @param finalPartyName Final party name (payment only)
     * @param vaaniPhone Phone from Vaani (payment only)
     * @param finalPhone Final phone (payment only)
     * @param isNewParty Is this a new party (payment only)
     */
    fun logTransactionSaved(
        transactionType: String,
        sessionId: String?,
        vaaniItemCount: Int,
        finalItemCount: Int,
        vaaniTotalAmount: String,
        finalTotalAmount: String,
        vaaniPaymentType: String,
        finalPaymentType: String,
        timeToCreateSeconds: Long,
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
    ) {
        try {
            val properties = mutableMapOf<String, Any?>()

            // Core properties
            properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
            properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

            // Item properties
            properties[VaaniEventConstants.Properties.VAANI_ITEM_COUNT] = vaaniItemCount
            properties[VaaniEventConstants.Properties.FINAL_ITEM_COUNT] = finalItemCount
            properties[VaaniEventConstants.Properties.ITEMS_EDITED] = vaaniItemCount != finalItemCount

            // Amount properties
            properties[VaaniEventConstants.Properties.VAANI_TOTAL_AMOUNT] = vaaniTotalAmount
            properties[VaaniEventConstants.Properties.FINAL_TOTAL_AMOUNT] = finalTotalAmount
            properties[VaaniEventConstants.Properties.AMOUNT_EDITED] = vaaniTotalAmount != finalTotalAmount

            // Payment type properties
            properties[VaaniEventConstants.Properties.VAANI_PAYMENT_TYPE] = vaaniPaymentType
            properties[VaaniEventConstants.Properties.FINAL_PAYMENT_TYPE] = finalPaymentType
            properties[VaaniEventConstants.Properties.PAYMENT_TYPE_EDITED] = vaaniPaymentType != finalPaymentType

            // Timing properties
            properties[VaaniEventConstants.Properties.TIME_TO_CREATE_INVOICE] = timeToCreateSeconds
            properties[VaaniEventConstants.Properties.USER_CHATS_COUNT] = userChatsCount

            // Expense-specific properties
            if (transactionType == VaaniEventConstants.UseCaseType.EXPENSE) {
                properties[VaaniEventConstants.Properties.VAANI_CATEGORY] = vaaniCategory
                properties[VaaniEventConstants.Properties.FINAL_CATEGORY] = finalCategory
                properties[VaaniEventConstants.Properties.CATEGORY_EDITED] = vaaniCategory != finalCategory
            }

            // Payment-specific properties
            if (transactionType == VaaniEventConstants.UseCaseType.PAYMENT_IN ||
                transactionType == VaaniEventConstants.UseCaseType.PAYMENT_OUT
            ) {
                properties[VaaniEventConstants.Properties.VAANI_PARTY_NAME] = vaaniPartyName
                properties[VaaniEventConstants.Properties.FINAL_PARTY_NAME] = finalPartyName
                properties[VaaniEventConstants.Properties.PARTY_EDITED] = vaaniPartyName != finalPartyName
                vaaniPhone?.let { properties[VaaniEventConstants.Properties.VAANI_PHONE] = it }
                finalPhone?.let { properties[VaaniEventConstants.Properties.FINAL_PHONE] = it }
                isNewParty?.let { properties[VaaniEventConstants.Properties.IS_NEW_PARTY] = it }
            }

            Analytics.logEventToAllPlatforms(
                VaaniEventConstants.Events.VAANI_TRANSACTION_SAVED,
                properties
            )
        } catch (e: Exception) {
            AppLogger.logError(
                IllegalStateException("Error logging Vaani transaction saved event", e)
            )
        }
    }

    /**
     * Log transaction cancelled event - generic for all transaction types.
     *
     * @param transactionType Transaction type
     * @param sessionId Session identifier
     * @param timeSpentSeconds Time spent before cancel
     * @param cancelStage Where user cancelled (see VaaniEventConstants.CancelStage)
     * @param hadData Was there any extracted data before cancel
     * @param cancelReason User-provided reason (if exit feedback collected)
     */
    fun logTransactionCancelled(
        transactionType: String,
        sessionId: String?,
        timeSpentSeconds: Long,
        cancelStage: String,
        hadData: Boolean? = null,
        cancelReason: String? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TIME_SPENT_SECONDS] = timeSpentSeconds
        properties[VaaniEventConstants.Properties.CANCEL_STAGE] = cancelStage
        hadData?.let { properties[VaaniEventConstants.Properties.HAD_DATA] = it }
        cancelReason?.let { properties[VaaniEventConstants.Properties.EXIT_REASONS] = it }

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_TRANSACTION_CANCELLED,
            properties
        )
    }

    /**
     * Log transaction review shown event when review screen appears.
     *
     * @param sessionId Session identifier
     * @param transactionType Transaction type
     * @param fieldsShown Number of fields displayed on review screen
     * @param missingFields Number of fields user needs to fill
     * @param timeToReviewMs Time from start to review screen in milliseconds
     */
    fun logTransactionReviewShown(
        sessionId: String?,
        transactionType: String,
        fieldsShown: Int,
        missingFields: Int,
        timeToReviewMs: Long
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        properties[VaaniEventConstants.Properties.FIELDS_SHOWN] = fieldsShown
        properties[VaaniEventConstants.Properties.MISSING_FIELDS] = missingFields
        properties[VaaniEventConstants.Properties.TIME_TO_REVIEW_MS] = timeToReviewMs

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_TRANSACTION_REVIEW_SHOWN,
            properties
        )
    }

    // ============================================
    // SUGGESTION EVENTS
    // ============================================

    /**
     * Log category suggestion selection event (Expense only).
     *
     * @param userSelected The category user selected
     * @param serverSent The original category from server
     * @param sessionId Current session ID
     * @param transactionType Transaction type (should be "expense")
     */
    fun logCategorySuggestionSelected(
        userSelected: String,
        serverSent: String,
        sessionId: String?,
        transactionType: String = VaaniEventConstants.UseCaseType.EXPENSE
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.USER_SELECTED] = userSelected
        properties[VaaniEventConstants.Properties.SERVER_SENT] = serverSent
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_CATEGORY_SUGGESTION_SELECTED,
            properties
        )
    }

    /**
     * Log item suggestion selection event.
     *
     * @param userSelected The item name user selected
     * @param serverSent The original item name from server
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     * @param itemIndex Which item was edited (0-indexed) - optional
     */
    fun logItemSuggestionSelected(
        userSelected: String,
        serverSent: String,
        sessionId: String?,
        transactionType: String,
        itemIndex: Int? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.USER_SELECTED] = userSelected
        properties[VaaniEventConstants.Properties.SERVER_SENT] = serverSent
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        itemIndex?.let { properties[VaaniEventConstants.Properties.ITEM_INDEX] = it }

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_ITEM_SUGGESTION_SELECTED,
            properties
        )
    }

    /**
     * Log payment type suggestion selection event.
     *
     * @param userSelected The payment type user selected
     * @param serverSent The original payment type from server
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     */
    fun logPaymentTypeSuggestionSelected(
        userSelected: String,
        serverSent: String,
        sessionId: String?,
        transactionType: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.USER_SELECTED] = userSelected
        properties[VaaniEventConstants.Properties.SERVER_SENT] = serverSent
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_PAYMENT_TYPE_SUGGESTION_SELECTED,
            properties
        )
    }

    /**
     * Log party suggestion selection event (Payment In/Out, Sale Invoice).
     *
     * @param userSelected The party name user selected
     * @param serverSent The original party name from server
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     * @param isExistingParty Was party selected from contacts/history
     * @param selectionSource How user found party: "search", "recent", "contacts", "typed"
     */
    fun logPartySuggestionSelected(
        userSelected: String,
        serverSent: String,
        sessionId: String?,
        transactionType: String,
        isExistingParty: Boolean? = null,
        selectionSource: String? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.USER_SELECTED] = userSelected
        properties[VaaniEventConstants.Properties.SERVER_SENT] = serverSent
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        isExistingParty?.let { properties[VaaniEventConstants.Properties.IS_EXISTING_PARTY] = it }
        selectionSource?.let { properties[VaaniEventConstants.Properties.SELECTION_SOURCE] = it }

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_PARTY_SUGGESTION_SELECTED,
            properties
        )
    }

    /**
     * Log field edited event when user manually edits any field.
     *
     * @param sessionId Session identifier
     * @param transactionType Transaction type
     * @param fieldName Field that was edited (see VaaniEventConstants.FieldName)
     * @param oldValue Original AI value before edit
     * @param newValue User's corrected value
     * @param editMethod How user made edit (see VaaniEventConstants.EditMethod)
     */
    fun logFieldEdited(
        sessionId: String?,
        transactionType: String,
        fieldName: String,
        oldValue: String? = null,
        newValue: String? = null,
        editMethod: String? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        properties[VaaniEventConstants.Properties.FIELD_NAME] = fieldName
        oldValue?.let { properties[VaaniEventConstants.Properties.FIELD_OLD_VALUE] = it }
        newValue?.let { properties[VaaniEventConstants.Properties.FIELD_NEW_VALUE] = it }
        editMethod?.let { properties[VaaniEventConstants.Properties.EDIT_METHOD] = it }

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_FIELD_EDITED,
            properties
        )
    }

    // ============================================
    // FEEDBACK EVENTS
    // ============================================

    /**
     * Log feedback event when user rates Vaani.
     *
     * @param stars Rating given by user (1-5)
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     * @param transactionSaved Did user complete transaction before feedback
     */
    fun logFeedback(
        stars: Int,
        sessionId: String?,
        transactionType: String,
        transactionSaved: Boolean? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.STARS] = stars
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        transactionSaved?.let { properties[VaaniEventConstants.Properties.TRANSACTION_SAVED] = it }

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_FEEDBACK,
            properties
        )
    }

    /**
     * Log feedback closed event when user dismisses without rating.
     *
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     */
    fun logFeedbackClosed(
        sessionId: String?,
        transactionType: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_FEEDBACK_CLOSED,
            properties
        )
    }

    /**
     * Log feature feedback event when user submits feature requests.
     *
     * @param features List of features user wants
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     */
    fun logFeatureFeedback(
        features: List<String>,
        sessionId: String?,
        transactionType: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.FEATURES] = features.joinToString(separator = ",")
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_FEATURE_FEEDBACK,
            properties
        )
    }

    /**
     * Log feature feedback closed event when user dismisses without submitting.
     *
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     */
    fun logFeatureFeedbackClosed(
        sessionId: String?,
        transactionType: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_FEATURE_FEEDBACK_CLOSED,
            properties
        )
    }

    /**
     * Log exit feedback event when user exits with reasons.
     *
     * @param exitReasons List of reasons selected by user for exiting
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     * @param stage Where user was when exiting
     */
    fun logExitFeedback(
        exitReasons: List<String>,
        sessionId: String?,
        transactionType: String,
        stage: String? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.EXIT_REASONS] = exitReasons.joinToString(separator = ",")
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        stage?.let { properties[VaaniEventConstants.Properties.CANCEL_STAGE] = it }

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_EXIT_FEEDBACK,
            properties
        )
    }

    // ============================================
    // ERROR EVENTS
    // ============================================

    /**
     * Log API error event (backend API failures).
     *
     * @param errorType Type of API error (see VaaniEventConstants.ErrorType)
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     * @param apiEndpoint Which API failed (optional)
     * @param errorCode HTTP status code (optional)
     * @param retryCount Number of retry attempts (optional)
     */
    fun logApiError(
        errorType: String,
        sessionId: String?,
        transactionType: String,
        apiEndpoint: String? = null,
        errorCode: Int? = null,
        retryCount: Int? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.ERROR_TYPE] = errorType
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        apiEndpoint?.let { properties[VaaniEventConstants.Properties.API_ENDPOINT] = it }
        errorCode?.let { properties[VaaniEventConstants.Properties.ERROR_CODE] = it }
        retryCount?.let { properties[VaaniEventConstants.Properties.RETRY_COUNT] = it }

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_API_ERROR,
            properties
        )
    }

    /**
     * Log error occurred event (client-side errors).
     *
     * @param errorType Type of error (see VaaniEventConstants.ErrorType)
     * @param sessionId Current session ID
     * @param transactionType Transaction type
     * @param errorDetails Additional context (optional)
     */
    fun logErrorOccurred(
        errorType: String,
        sessionId: String?,
        transactionType: String,
        errorDetails: String? = null
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.ERROR_TYPE] = errorType
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        errorDetails?.let { properties[VaaniEventConstants.Properties.ERROR_DETAILS] = it }

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_ERROR_OCCURRED,
            properties
        )
    }

    // ============================================
    // INTRO POPUP EVENTS
    // ============================================

    /**
     * Log intro popup add manual event when user chooses manual entry.
     *
     * @param transactionType Which transaction type
     * @param source Where popup appeared
     */
    fun logIntroPopupAddManual(
        transactionType: String,
        source: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        properties[VaaniEventConstants.Properties.SOURCE] = source

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_INTRO_POPUP_ADD_MANUAL,
            properties
        )
    }

    /**
     * Log intro popup use Vaani event when user chooses Vaani.
     *
     * @param transactionType Which transaction type
     * @param source Where popup appeared
     */
    fun logIntroPopupUseVaani(
        transactionType: String,
        source: String
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TRANSACTION_TYPE] = transactionType
        properties[VaaniEventConstants.Properties.SOURCE] = source

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_INTRO_POPUP_USE_VAANI,
            properties
        )
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    /**
     * Helper function to add network speed properties to event properties map.
     */
    private fun addNetworkSpeedProperties(
        properties: MutableMap<String, Any?>,
        networkSpeed: NetworkSpeedInfo?
    ) {
        networkSpeed?.pingMs?.let {
            properties[VaaniEventConstants.Properties.NETWORK_PING_MS] = it
        }
        networkSpeed?.downloadSpeedMbps?.let {
            properties[VaaniEventConstants.Properties.NETWORK_DOWNLOAD_MBPS] =
                kotlin.math.round(it * 100) / 100.0
        }
        networkSpeed?.uploadSpeedMbps?.let {
            properties[VaaniEventConstants.Properties.NETWORK_UPLOAD_MBPS] =
                kotlin.math.round(it * 100) / 100.0
        }
    }

    // ============================================
    // DEPRECATED FUNCTIONS - For backward compatibility
    // ============================================

    /**
     * @deprecated Use logTransactionSaved instead with transactionType = "expense"
     */
    @Deprecated(
        message = "Use logTransactionSaved instead",
        replaceWith = ReplaceWith("logTransactionSaved(transactionType = VaaniEventConstants.UseCaseType.EXPENSE, ...)")
    )
    fun logExpenseSaved(
        vaaniPrefillData: ExpenseTxnPrefillData,
        finalCategory: String?,
        finalItems: List<PrefilledItemDetailsModel>,
        finalPaymentTypes: List<String>
    ) {
        val vaaniItemCount = vaaniPrefillData.items.size
        val finalItemCount = finalItems.size
        val vaaniTotalAmount = vaaniPrefillData.items.sumOf { it.itemUnitPrice ?: 0.0 }
        val finalTotalAmount = finalItems.sumOf { it.itemUnitPrice ?: 0.0 }
        val vaaniPaymentType = vaaniPrefillData.paymentType ?: ""
        val finalPaymentType = finalPaymentTypes.joinToString(", ")
        val timeToCreateInvoice = vaaniPrefillData.vaaniSessionStartTime?.let {
            Utils.calculateDurationInSeconds(it)
        } ?: 0

        logTransactionSaved(
            transactionType = VaaniEventConstants.UseCaseType.EXPENSE,
            sessionId = vaaniPrefillData.vaaniSessionId,
            vaaniItemCount = vaaniItemCount,
            finalItemCount = finalItemCount,
            vaaniTotalAmount = vaaniTotalAmount.toString(),
            finalTotalAmount = finalTotalAmount.toString(),
            vaaniPaymentType = vaaniPaymentType,
            finalPaymentType = finalPaymentType,
            timeToCreateSeconds = timeToCreateInvoice,
            userChatsCount = vaaniPrefillData.vaaniUserChatsCount ?: 0,
            vaaniCategory = vaaniPrefillData.expenseCategory,
            finalCategory = finalCategory
        )
    }

    /**
     * @deprecated Use logTransactionCancelled instead with transactionType = "expense"
     */
    @Deprecated(
        message = "Use logTransactionCancelled instead",
        replaceWith = ReplaceWith("logTransactionCancelled(transactionType = VaaniEventConstants.UseCaseType.EXPENSE, ...)")
    )
    fun logExpenseCancelled(
        sessionId: String?,
        sessionStartTime: Long
    ) {
        val timeSpent = Utils.calculateDurationInSeconds(sessionStartTime)
        logTransactionCancelled(
            transactionType = VaaniEventConstants.UseCaseType.EXPENSE,
            sessionId = sessionId,
            timeSpentSeconds = timeSpent,
            cancelStage = VaaniEventConstants.CancelStage.REVIEW
        )
    }
}
