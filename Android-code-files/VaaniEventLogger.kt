package vyapar.shared.presentation.vaani

import vyapar.shared.data.manager.analytics.Analytics
import vyapar.shared.data.manager.analytics.AppLogger
import vyapar.shared.domain.models.ExpenseTxnPrefillData
import vyapar.shared.domain.models.PrefilledItemDetailsModel
import vyapar.shared.data.model.NetworkSpeedInfo
import vyapar.shared.util.Utils
import kotlin.math.abs

/**
 * Handles all analytics event logging for Vaani feature
 */
// todo-vaani cleanup: rename analytics helpers with more specific names per use-case
class VaaniEventLogger {

    fun logVaaniOpened(source: String, hasExploredVaani: Boolean) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SOURCE] = source
        properties[VaaniEventConstants.Properties.USER_HAS_USED_VAANI_BEFORE] = hasExploredVaani
        properties[VaaniEventConstants.Properties.USE_CASE_TYPE] = VaaniEventConstants.UseCaseType.EXPENSE

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_OPENED,
            properties
        )
    }
    
    /**
     * Log session started event when Vaani is launched
     */
    fun logSessionStarted() {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.USE_CASE_TYPE] = VaaniEventConstants.UseCaseType.EXPENSE
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_SESSION_STARTED,
            properties
        )
    }
    
    /**
     * Log session ended event when user exits Vaani
     */
    fun logSessionEnded() {
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_SESSION_ENDED
        )
    }
    
    /**
     * Log mic button clicked event
     * @param micStatus The status mic will be in after click (true = on/recording, false = off/muted)
     */
    fun logMicButtonClicked(micStatus: Boolean) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.MIC_STATUS] = micStatus
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_MIC_BUTTON_CLICKED,
            properties
        )
    }
    
    /**
     * Log mute toggle event when user checks or unchecks mute
     * @param muteStatus The current mute status after toggle (true = muted, false = unmuted)
     * @param sessionId Current session ID
     */
    fun logMuteToggle(muteStatus: Boolean, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.MUTE_STATUS] = muteStatus
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_MUTE_TOGGLE,
            properties
        )
    }
    
    /**
     * Log recording completed event
     * @param autoStop Whether recording was stopped automatically due to timeout
     * @param sessionId Current session ID
     * @param recordingDuration Duration of recording in milliseconds
     */
    fun logRecordingCompleted(
        autoStop: Boolean,
        sessionId: String?,
        recordingDuration: Long
    ) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.RECORDING_DURATION_MS] = recordingDuration
        properties[VaaniEventConstants.Properties.AUTO_STOP] = autoStop
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_RECORDING_COMPLETED,
            properties
        )
    }
    
    /**
     * Log voice processed event
     * @param transcription The transcribed text
     * @param sessionId Current session ID
     */
    fun logVoiceProcessed(transcription: String, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        properties[VaaniEventConstants.Properties.TRANSCRIPT_LENGTH] = transcription.length
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_VOICE_PROCESSED,
            properties
        )
    }
    
    /**
     * Log API error event (backend API failures)
     * Examples: no_internet, server_error, audio_process_failed
     * 
     * @param errorType Type of API error that occurred
     * @param sessionId Current session ID
     */
    fun logApiError(errorType: String, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.ERROR_TYPE] = errorType
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_API_ERROR,
            properties
        )
    }
    
    /**
     * Log error occurred event (client-side errors, not backend API)
     * Examples: chat_limit_exceeded, time_limit_exceeded
     * 
     * @param errorType Type of error that occurred
     * @param sessionId Current session ID
     */
    fun logErrorOccurred(errorType: String, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.ERROR_TYPE] = errorType
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_ERROR_OCCURRED,
            properties
        )
    }

    fun logExpenseSaved(
        vaaniPrefillData: ExpenseTxnPrefillData,
        finalCategory: String?,
        finalItems: List<PrefilledItemDetailsModel>,
        finalPaymentTypes: List<String>
    ) {
        try {
            val vaaniItemCount = vaaniPrefillData.items.size
            val finalItemCount = finalItems.size
            
            val vaaniTotalAmount = vaaniPrefillData.items.sumOf { it.itemUnitPrice ?: 0.0 }
            val finalTotalAmount = finalItems.sumOf { it.itemUnitPrice ?: 0.0 }
            
            val vaaniPaymentType = vaaniPrefillData.paymentType ?: ""
            val finalPaymentType = finalPaymentTypes.joinToString(", ")
            
            val timeToCreateInvoice = vaaniPrefillData.vaaniSessionStartTime?.let {
                Utils.calculateDurationInSeconds(it)
            } ?: 0
            
            val itemsEdited = calculateItemsEdited(vaaniPrefillData.items, finalItems)
            
            val categoryEdited = vaaniPrefillData.expenseCategory == finalCategory
            
            val properties = mutableMapOf<String, Any?>()
            properties[VaaniEventConstants.Properties.SESSION_ID] = vaaniPrefillData.vaaniSessionId
            properties[VaaniEventConstants.Properties.VAANI_ITEM_COUNT] = vaaniItemCount
            properties[VaaniEventConstants.Properties.FINAL_ITEM_COUNT] = finalItemCount
            properties[VaaniEventConstants.Properties.ITEMS_EDITED] = itemsEdited

            properties[VaaniEventConstants.Properties.VAANI_TOTAL_AMOUNT] = vaaniTotalAmount.toString()
            properties[VaaniEventConstants.Properties.FINAL_TOTAL_AMOUNT] = finalTotalAmount.toString()

            properties[VaaniEventConstants.Properties.VAANI_CATEGORY] = vaaniPrefillData.expenseCategory
            properties[VaaniEventConstants.Properties.FINAL_CATEGORY] = finalCategory
            properties[VaaniEventConstants.Properties.CATEGORY_EDITED] = categoryEdited

            properties[VaaniEventConstants.Properties.VAANI_PAYMENT_TYPE] = vaaniPaymentType
            properties[VaaniEventConstants.Properties.FINAL_PAYMENT_TYPE] = finalPaymentType
            properties[VaaniEventConstants.Properties.TIME_TO_CREATE_INVOICE] = timeToCreateInvoice
            properties[VaaniEventConstants.Properties.USER_CHATS_COUNT] = vaaniPrefillData.vaaniUserChatsCount
            
            Analytics.logEventToAllPlatforms(
                VaaniEventConstants.Events.VAANI_EXPENSE_SAVED,
                properties
            )
        } catch (e: Exception) {
            AppLogger.logError(
                IllegalStateException("Error logging Vaani expense saved event", e)
            )
        }
    }

    private fun calculateItemsEdited(
        vaaniItems: List<PrefilledItemDetailsModel>,
        finalItems: List<PrefilledItemDetailsModel>
    ): Boolean {
        // If count differs, items were definitely edited
        if (vaaniItems.size != finalItems.size) {
            return true
        }
        
        // Compare each item's properties
        for (i in vaaniItems.indices) {
            val vaaniItem = vaaniItems[i]
            val finalItem = finalItems[i]

            if (vaaniItem.itemName != finalItem.itemName) {
                return true
            }
            
            // Compare quantity
            val vaaniQty = vaaniItem.itemQty ?: 0.0
            val finalQty = finalItem.itemQty ?: 0.0
            if (vaaniQty != finalQty) {
                return true
            }
            
            // Compare amount (with small tolerance for floating point)
            val vaaniAmount = vaaniItem.itemUnitPrice ?: 0.0
            val finalAmount = finalItem.itemUnitPrice ?: 0.0
            if (abs(vaaniAmount - finalAmount) > 0.01) {
                return true
            }
        }
        
        // No changes detected
        return false
    }

    fun logExpenseCancelled(
        sessionId: String?,
        sessionStartTime: Long
    ) {
        val timeSpent = Utils.calculateDurationInSeconds(sessionStartTime)
        
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

        properties[VaaniEventConstants.Properties.TIME_SPENT_SECONDS] = timeSpent
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_EXPENSE_CANCELLED,
            properties
        )
    }
    
    /**
     * Log feedback event when user rates Vaani
     * @param stars Rating given by user
     * @param sessionId Current session ID
     */
    fun logFeedback(stars: Int, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.STARS] = stars
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_FEEDBACK,
            properties
        )
    }

    fun logFeatureFeedback(features: List<String>, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.FEATURES] = features.joinToString(separator = ",")
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_FEATURE_FEEDBACK,
            properties
        )
    }
    
    /**
     * Log feature feedback closed event when user dismisses without submitting
     * @param sessionId Current session ID
     */
    fun logFeatureFeedbackClosed(sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_FEATURE_FEEDBACK_CLOSED,
            properties
        )
    }
    
    /**
     * Log feedback closed event when user dismisses without rating
     * @param sessionId Current session ID
     */
    fun logFeedbackClosed(sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_FEEDBACK_CLOSED,
            properties
        )
    }
    
    /**
     * Log category suggestion selection event
     * @param userSelected The category user selected
     * @param serverSent The original category from server
     * @param sessionId Current session ID
     */
    fun logCategorySuggestionSelected(userSelected: String, serverSent: String, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.USER_SELECTED] = userSelected
        properties[VaaniEventConstants.Properties.SERVER_SENT] = serverSent
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_CATEGORY_SUGGESTION_SELECTED,
            properties
        )
    }
    
    /**
     * Log item suggestion selection event
     * @param userSelected The item name user selected
     * @param serverSent The original item name from server
     * @param sessionId Current session ID
     */
    fun logItemSuggestionSelected(userSelected: String, serverSent: String, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.USER_SELECTED] = userSelected
        properties[VaaniEventConstants.Properties.SERVER_SENT] = serverSent
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_ITEM_SUGGESTION_SELECTED,
            properties
        )
    }
    
    /**
     * Log payment type suggestion selection event
     * @param userSelected The payment type user selected
     * @param serverSent The original payment type from server
     * @param sessionId Current session ID
     */
    fun logPaymentTypeSuggestionSelected(userSelected: String, serverSent: String, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.USER_SELECTED] = userSelected
        properties[VaaniEventConstants.Properties.SERVER_SENT] = serverSent
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_PAYMENT_TYPE_SUGGESTION_SELECTED,
            properties
        )
    }
    
    /**
     * Log STT received event when transcription is received from server
     * @param timeTakenMs Time taken from audio upload completion to STT received in milliseconds
     * @param sessionId Current session ID
     * @param networkSpeed Network speed measured at audio upload time (optional)
     */
    fun logSttReceived(timeTakenMs: Long, sessionId: String?, networkSpeed: NetworkSpeedInfo? = null) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TIME_TAKEN_MS] = timeTakenMs
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        
        // Add network speed properties if available
        addNetworkSpeedProperties(properties, networkSpeed)
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_STT_RECEIVED,
            properties
        )
    }

    /**
     * Log audio uploaded event when audio is successfully uploaded to S3
     * @param timeTakenMs Time taken to upload audio in milliseconds
     * @param sessionId Current session ID
     * @param networkSpeed Network speed measured at upload time (optional, measured in ViewModel)
     */
    fun logAudioUploaded(timeTakenMs: Long, sessionId: String?, networkSpeed: NetworkSpeedInfo? = null) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TIME_TAKEN_MS] = timeTakenMs
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId

        // Add network speed properties if available
        addNetworkSpeedProperties(properties, networkSpeed)

        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_AUDIO_UPLOADED,
            properties
        )
    }
    
    /**
     * Log AI data received event when invoice is ready from server
     * @param timeTakenMs Time taken from audio upload completion to invoice ready in milliseconds
     * @param sessionId Current session ID
     * @param networkSpeed Network speed measured at audio upload time (optional)
     */
    fun logAiDataReceived(timeTakenMs: Long, sessionId: String?, networkSpeed: NetworkSpeedInfo? = null) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.TIME_TAKEN_MS] = timeTakenMs
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        
        // Add network speed properties if available
        addNetworkSpeedProperties(properties, networkSpeed)
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_AI_DATA_RECEIVED,
            properties
        )
    }
    
    /**
     * Helper function to add network speed properties to event properties map
     * @param properties Mutable map to add network speed properties to
     * @param networkSpeed Network speed info (optional)
     */
    private fun addNetworkSpeedProperties(
        properties: MutableMap<String, Any?>,
        networkSpeed: NetworkSpeedInfo?
    ) {
        networkSpeed?.pingMs?.let {
            properties[VaaniEventConstants.Properties.NETWORK_PING_MS] = it
        }
        networkSpeed?.downloadSpeedMbps?.let {
            // Round to 2 decimal places for logging
            properties[VaaniEventConstants.Properties.NETWORK_DOWNLOAD_MBPS] = 
                kotlin.math.round(it * 100) / 100.0
        }
        networkSpeed?.uploadSpeedMbps?.let {
            // Round to 2 decimal places for logging
            properties[VaaniEventConstants.Properties.NETWORK_UPLOAD_MBPS] = 
                kotlin.math.round(it * 100) / 100.0
        }
    }
    
    /**
     * Log exit feedback event when user exits Vaani with reasons
     * @param exitReasons List of reasons selected by user for exiting
     * @param sessionId Current session ID
     */
    fun logExitFeedback(exitReasons: List<String>, sessionId: String?) {
        val properties = mutableMapOf<String, Any?>()
        properties[VaaniEventConstants.Properties.EXIT_REASONS] = exitReasons.joinToString(separator = ",")
        properties[VaaniEventConstants.Properties.SESSION_ID] = sessionId
        
        Analytics.logEventToAllPlatforms(
            VaaniEventConstants.Events.VAANI_EXIT_FEEDBACK,
            properties
        )
    }
}

