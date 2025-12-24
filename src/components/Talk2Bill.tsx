/**
 * Talk2Bill.tsx
 *
 * Main component for the Talk2Bill flow:
 * - Session management
 * - Audio upload via pre-signed URLs
 * - Polling for transcription and invoice extraction
 * - Display transcription, invoice, and questions
 * - Session status updates and feedback
 *
 * @author Vyapar Team
 * @version 1.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mic,
  Square,
  Loader2,
  Upload,
  Play,
  CheckCircle,
  AlertCircle,
  FileAudio,
  RotateCcw,
  RefreshCw,
  Save,
  X,
  MessageSquare,
  Receipt,
  History,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import VoiceSampleSelector, { VoiceSample } from '@/components/VoiceSampleSelector';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface SignedUrlResponse {
  message: string;
  data: Array<{
    url: string;
    cdn: string;
    filePath: string;
    params: Record<string, string>;
    fileName: string;
    refId: string;
    sessionId: string;
  }>;
}

interface JobStatusResponse {
  data: {
    transcription: string | null;
    question: string | null;
    invoice: any | null;
    status: 'STT_IN_PROGRESS' | 'STT_COMPLETED' | 'T2I_IN_PROGRESS' | 'T2I_COMPLETED' | 'INVOICE_READY' | 'FAILED';
    createdAt?: string;
    jobUpdatedAt?: string;
  };
  message: string;
}

interface HistoryResponse {
  data: Array<{
    transcription: string;
    question: string;
  }>;
  message: string;
}

type JobStatus = 'STT_IN_PROGRESS' | 'STT_COMPLETED' | 'T2I_IN_PROGRESS' | 'T2I_COMPLETED' | 'INVOICE_READY' | 'FAILED' | null;
type SessionStatus = 'INITIATED' | 'SAVED' | 'ABORTED';

// Transaction type codes matching backend enum
enum TransactionType {
  PAYMENT_IN = 3,
  PAYMENT_OUT = 4,
  EXPENSE = 7,
}

// =============================================================================
// CONSTANTS
// =============================================================================

import { API_ENDPOINTS } from '@/lib/api-config';

const API_ENDPOINTS_LOCAL = {
  SIGNED_URL: API_ENDPOINTS.TALK2BILL.SIGNED_URL,
  JOB_STATUS: API_ENDPOINTS.TALK2BILL.JOB_STATUS,
  SESSION_STATUS: API_ENDPOINTS.TALK2BILL.SESSION_STATUS,
  FEEDBACK: API_ENDPOINTS.TALK2BILL.FEEDBACK,
} as const;

const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_ATTEMPTS = 300; // 10 minutes max

// localStorage keys
const STORAGE_KEYS = {
  SESSION_ID: 'talk2bill_sessionId',
  SESSION_STATUS: 'talk2bill_sessionStatus',
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculates time difference between two ISO date strings in milliseconds
 */
const calculateTimeDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return end - start;
};

/**
 * Formats milliseconds into a human-readable duration
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const getStatusBadgeVariant = (status: JobStatus): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'INVOICE_READY':
      return 'default';
    case 'T2I_COMPLETED':
    case 'STT_COMPLETED':
      return 'secondary';
    case 'FAILED':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case 'INVOICE_READY':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'T2I_COMPLETED':
    case 'STT_COMPLETED':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'FAILED':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Talk2Bill: React.FC = () => {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('INITIATED');
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE); // Default: Expense
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Job status
  const [jobStatus, setJobStatus] = useState<JobStatus>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any | null>(null);

  // Chat messages (conversation history)
  interface ChatMessage {
    id: string;
    type: 'user' | 'model';
    transcription?: string;
    question?: string;
    invoice?: any;
    timestamp: Date;
    processingTime?: number; // Time taken in milliseconds
  }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Array<{ transcription: string; question: string }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Feedback
  const [userInvoice, setUserInvoice] = useState<any>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Auto-hide messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Load saved session ID on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    const savedSessionStatus = localStorage.getItem(STORAGE_KEYS.SESSION_STATUS) as SessionStatus | null;
    
    if (savedSessionId) {
      setSessionId(savedSessionId);
      if (savedSessionStatus) {
        setSessionStatus(savedSessionStatus);
      }
    }
  }, []);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      localStorage.setItem(STORAGE_KEYS.SESSION_STATUS, sessionStatus);
    }
  }, [sessionId, sessionStatus]);

  // ---------------------------------------------------------------------------
  // API FUNCTIONS
  // ---------------------------------------------------------------------------

  /**
   * Gets a pre-signed URL for file upload
   */
  const getSignedUrl = async (existingSessionId: string | null = null): Promise<SignedUrlResponse> => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Not authenticated. Please login.');
    }

    // Use provided sessionId, or current sessionId from state, or saved sessionId
    const sessionIdToUse = existingSessionId || sessionId || localStorage.getItem(STORAGE_KEYS.SESSION_ID);

    const requestBody = [
      {
        fileType: 17,
        deviceId: 'web-client',
        currentCompanyId: 'default',
        fileExtension: 'wav',
        extraData: {
          sessionId: sessionIdToUse || null,
          entryPoint: transactionType, // Transaction type: PAYMENT_IN (3), PAYMENT_OUT (4), or EXPENSE (7)
        },
      },
    ];

    const response = await fetch(API_ENDPOINTS_LOCAL.SIGNED_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get signed URL');
    }

    return response.json();
  };

  /**
   * Uploads file directly to S3 using pre-signed URL
   */
  const uploadToS3 = async (signedUrl: string, params: Record<string, string>, file: Blob): Promise<void> => {
    const formData = new FormData();
    
    // Add all params to form data
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Add file last (S3 requirement)
    formData.append('file', file);

    const response = await fetch(signedUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to upload file to S3: ${errorText}`);
    }
  };

  /**
   * Polls for job status
   */
  const pollJobStatus = async (sessionId: string): Promise<JobStatusResponse> => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_ENDPOINTS_LOCAL.JOB_STATUS}?sessionId=${sessionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch job status');
    }

    return response.json();
  };

  /**
   * Updates session status
   */
  const updateSessionStatus = async (sessionId: string, status: 'SAVED' | 'ABORTED'): Promise<void> => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_ENDPOINTS_LOCAL.SESSION_STATUS}/${sessionId}/${status}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update session status');
    }

    setSessionStatus(status);
    setSuccessMessage(`Session ${status.toLowerCase()} successfully`);
  };

  /**
   * Submits feedback (user invoice data)
   */
  const submitFeedback = async (sessionId: string, invoiceData: any): Promise<void> => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_ENDPOINTS_LOCAL.FEEDBACK}/${sessionId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to submit feedback');
    }

    setSuccessMessage('Feedback submitted successfully');
  };

  /**
   * Fetches session history
   */
  const fetchHistory = async (sessionId: string): Promise<void> => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    setIsLoadingHistory(true);
    try {
      const response = await fetch(`${API_ENDPOINTS_LOCAL.JOB_STATUS}?sessionId=${sessionId}&fetchHistory=true`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data: HistoryResponse = await response.json();
      setHistory(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RECORDING FUNCTIONS
  // ---------------------------------------------------------------------------

  const startRecording = async () => {
    try {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioFileName('recording.wav');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Failed to access microphone. Please ensure microphone permissions are granted.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // ---------------------------------------------------------------------------
  // FILE UPLOAD FUNCTIONS
  // ---------------------------------------------------------------------------

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select an audio file (MP3, WAV, etc.)');
      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioFileName(file.name);
    setError(null);
    setRecordingTime(0);
  }, [audioUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // ---------------------------------------------------------------------------
  // UPLOAD AND PROCESSING
  // ---------------------------------------------------------------------------

  /**
   * Handles the complete upload and processing flow
   */
  const handleUploadAndProcess = async () => {
    if (!audioUrl) {
      setError('Please record or upload an audio file first');
      return;
    }

    // Stop any existing polling
    stopPolling();

    setIsUploading(true);
    setError(null);
    setJobStatus(null);
    setTranscription(null);
    setQuestion(null);
    setInvoice(null);
    setPollingAttempts(0);

    try {
      // Step 1: Get pre-signed URL (use current sessionId or saved one)
      const currentSessionId = sessionId || localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      const signedUrlResponse = await getSignedUrl(currentSessionId);
      const signedUrlData = signedUrlResponse.data[0];

      if (!signedUrlData) {
        throw new Error('No signed URL received');
      }

      // Update session ID if we got a new one or if it's different
      if (signedUrlData.sessionId) {
        if (!sessionId || sessionId !== signedUrlData.sessionId) {
          setSessionId(signedUrlData.sessionId);
        }
      }

      // Step 2: Upload to S3
      const audioBlob = await fetch(audioUrl).then((r) => r.blob());
      await uploadToS3(signedUrlData.url, signedUrlData.params, audioBlob);

      setSuccessMessage('Audio uploaded successfully. Processing...');

      // Step 3: Start polling
      startPolling(signedUrlData.sessionId || sessionId!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload audio');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Starts polling for job status
   */
  const startPolling = (sessionIdToPoll: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);
    setPollingAttempts(0);

    const poll = async () => {
      try {
        const currentAttempt = pollingAttempts + 1;
        setPollingAttempts(currentAttempt);

        if (currentAttempt >= MAX_POLLING_ATTEMPTS) {
          stopPolling();
          setError('Polling timeout. Please try again.');
          return;
        }

        const statusResponse = await pollJobStatus(sessionIdToPoll);
        const { status, transcription: trans, question: q, invoice: inv, createdAt, jobUpdatedAt } = statusResponse.data;

        setJobStatus(status);
        if (trans) setTranscription(trans);
        if (q) setQuestion(q);
        if (inv) setInvoice(inv);

        // Stop polling if we've reached a final state
        if (status === 'T2I_COMPLETED' || status === 'INVOICE_READY' || status === 'FAILED') {
          stopPolling();
          if (status === 'T2I_COMPLETED' || status === 'INVOICE_READY') {
            setSuccessMessage('Processing completed!');
            
            // Calculate processing time if we have both dates
            let processingTime: number | undefined;
            if (createdAt && jobUpdatedAt) {
              processingTime = calculateTimeDifference(createdAt, jobUpdatedAt);
            }
            
            // Add to chat messages
            if (trans) {
              const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                type: 'user',
                transcription: trans,
                timestamp: new Date(),
              };
              
              const modelMessage: ChatMessage = {
                id: `model-${Date.now()}`,
                type: 'model',
                question: q || undefined,
                invoice: inv || undefined,
                timestamp: new Date(),
                processingTime,
              };
              
              setChatMessages((prev) => [...prev, userMessage, modelMessage]);
              
              // Clear current state to allow new recording
              setTranscription(null);
              setQuestion(null);
              setInvoice(null);
              setJobStatus(null);
              if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(null);
              }
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Continue polling on error (might be temporary)
      }
    };

    // Poll immediately, then at intervals
    poll();
    pollingIntervalRef.current = setInterval(poll, POLLING_INTERVAL);
  };

  /**
   * Stops polling
   */
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const handleStartNewSession = () => {
    stopPolling();
    setSessionId(null);
    setSessionStatus('INITIATED');
    setJobStatus(null);
    setTranscription(null);
    setQuestion(null);
    setInvoice(null);
    setHistory([]);
    setChatMessages([]);
    setUserInvoice(null);
    setPollingAttempts(0);
    
    // Clear saved session from localStorage
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    localStorage.removeItem(STORAGE_KEYS.SESSION_STATUS);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const handleSaveSession = async () => {
    if (!sessionId) {
      setError('No active session');
      return;
    }
    try {
      await updateSessionStatus(sessionId, 'SAVED');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session');
    }
  };

  const handleAbortSession = async () => {
    if (!sessionId) {
      setError('No active session');
      return;
    }
    try {
      await updateSessionStatus(sessionId, 'ABORTED');
      handleStartNewSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to abort session');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!sessionId) {
      setError('No active session');
      return;
    }
    if (!userInvoice) {
      setError('Please provide invoice data');
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await submitFeedback(sessionId, userInvoice);
      setUserInvoice(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleToggleHistory = () => {
    if (!showHistory && sessionId) {
      fetchHistory(sessionId);
    }
    setShowHistory(!showHistory);
  };

  /**
   * Handles selection of a voice sample from VoiceSampleSelector.
   *
   * This callback is triggered when the user clicks "Use this sample" in the
   * VoiceSampleSelector component. It:
   * 1. Fetches the audio file from the provided URL
   * 2. Creates a blob URL for the audio player
   * 3. Sets the audio state so it appears in the recording/upload section
   * 4. User can then click "Upload & Process" to send it through the pipeline
   *
   * Integration with VoiceSampleSelector:
   * - VoiceSampleSelector filters samples based on transactionType prop
   * - When user selects a sample, this handler receives the sample metadata
   *   and the URL to the audio file
   *
   * @param sample - Voice sample metadata (from VoiceSampleSelector)
   * @param audioUrl - URL to the audio file, or null if unavailable
   */
  const handleVoiceSampleSelect = async (sample: VoiceSample, audioUrl: string | null) => {
    // Can't proceed without a valid audio URL
    if (!audioUrl) return;

    // Clean up any previous audio blob URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    try {
      // Fetch the audio file from the samples directory
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch audio sample');
      }

      // Convert to blob and create a local URL for the audio player
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Set the audio state - this will show the audio player UI
      setAudioUrl(blobUrl);
      setAudioFileName(sample.filename);
      setRecordingTime(sample.duration_seconds);
      setError(null);
      setSuccessMessage(`Loaded sample: ${sample.description}`);
    } catch (err) {
      setError('Failed to load voice sample. Please try again.');
      console.error('Error loading voice sample:', err);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Talk to Bill</h1>
        <p className="text-gray-600 mt-1">Upload audio to extract invoice information</p>
      </div>

      {/* Messages */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Transaction Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transaction Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={transactionType.toString()}
            onValueChange={(value) => setTransactionType(Number(value) as TransactionType)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={TransactionType.PAYMENT_IN.toString()} id="payment-in" />
              <Label htmlFor="payment-in" className="font-normal cursor-pointer">
                Payment In
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={TransactionType.PAYMENT_OUT.toString()} id="payment-out" />
              <Label htmlFor="payment-out" className="font-normal cursor-pointer">
                Payment Out
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={TransactionType.EXPENSE.toString()} id="expense" />
              <Label htmlFor="expense" className="font-normal cursor-pointer">
                Expense (Default)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/*
        Voice Sample Selector Component
        ================================
        Displays pre-recorded voice samples for testing the Talk2Bill pipeline.

        Props:
        - transactionType: Filters samples to match selected type (7=Expense, 3=Payment In, 4=Payment Out)
        - onSelectSample: Called when user clicks "Use this sample" - loads audio as input
        - disabled: Prevents interaction during recording/upload/polling

        Data source: /public/data/voice-samples.json
        Audio files: /public/audio/samples/{filename}.wav

        User flow:
        1. User selects a transaction type above
        2. VoiceSampleSelector shows filtered samples
        3. User can play to preview, view transcript
        4. Clicking "Use this sample" loads it into the audio player below
        5. User clicks "Upload & Process" to send through the pipeline
      */}
      <VoiceSampleSelector
        transactionType={transactionType.toString()}
        onSelectSample={handleVoiceSampleSelect}
        disabled={isRecording || isUploading || isPolling}
      />

      {/* Recording/Upload Section */}
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {!audioUrl ? (
              <>
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isUploading || isPolling}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white shadow-lg hover:shadow-xl`}
                  >
                    {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-10 h-10" />}
                  </button>

                  {isRecording && (
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="font-mono text-2xl">{formatTime(recordingTime)}</span>
                    </div>
                  )}

                  <p className="text-gray-500 text-sm">
                    {isRecording ? 'Click to stop recording' : 'Click to start recording'}
                  </p>
                </div>

                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-400 text-sm">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer transition-all hover:border-gray-400 hover:bg-gray-50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 font-medium">Drag & drop an audio file</p>
                  <p className="text-gray-400 text-sm mt-1">or click to browse (MP3, WAV, etc.)</p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileAudio className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{audioFileName}</p>
                      {recordingTime > 0 && (
                        <p className="text-sm text-gray-500">Duration: {formatTime(recordingTime)}</p>
                      )}
                    </div>
                  </div>
                  <audio src={audioUrl} controls className="w-full" />
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => {
                      if (audioUrl) URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                      setJobStatus(null);
                      setTranscription(null);
                      setQuestion(null);
                      setInvoice(null);
                    }}
                    variant="outline"
                    disabled={isUploading || isPolling}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                  <Button
                    onClick={handleUploadAndProcess}
                    disabled={isUploading || isPolling}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload & Process
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Badge */}
      {jobStatus && (
        <div className="flex justify-center">
          <Badge className={`${getStatusColor(jobStatus)} px-4 py-2`}>
            {isPolling && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
            Status: {jobStatus}
          </Badge>
        </div>
      )}

      {/* Chat Conversation */}
      {chatMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={chatScrollRef} className="space-y-4 max-h-[600px] overflow-y-auto">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Mic className="w-4 h-4" />
                          <span className="text-xs font-semibold">You</span>
                        </div>
                        <p className="text-sm">{message.transcription}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-semibold">Model</span>
                          </div>
                          {message.processingTime !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDuration(message.processingTime)}
                            </Badge>
                          )}
                        </div>
                        {message.question && (
                          <div>
                            <p className="text-xs font-medium mb-1 opacity-75">Question:</p>
                            <p className="text-sm">{message.question}</p>
                          </div>
                        )}
                        {message.invoice && (
                          <div>
                            <p className="text-xs font-medium mb-1 opacity-75">Extracted Invoice:</p>
                            <pre className="text-xs bg-white/50 p-2 rounded overflow-auto max-h-40">
                              {JSON.stringify(message.invoice, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Results Section (while processing) */}
      {(transcription || question || invoice) && (jobStatus !== 'T2I_COMPLETED' && jobStatus !== 'INVOICE_READY') && (
        <div className="space-y-4">
          {/* Transcription */}
          {transcription && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Transcription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={transcription} readOnly className="min-h-[100px]" />
              </CardContent>
            </Card>
          )}

          {/* Question */}
          {question && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={question} readOnly className="min-h-[80px]" />
              </CardContent>
            </Card>
          )}

          {/* Invoice */}
          {invoice && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Extracted Invoice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(invoice, null, 2)}
                </pre>
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-gray-700">Your Invoice Data (Optional)</label>
                  <Textarea
                    placeholder='Enter your invoice data as JSON, e.g., {"expense_category": "petrol", "items": [...]}'
                    value={userInvoice ? JSON.stringify(userInvoice, null, 2) : ''}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      if (!value) {
                        setUserInvoice(null);
                        return;
                      }
                      try {
                        const parsed = JSON.parse(value);
                        setUserInvoice(parsed);
                        setError(null);
                      } catch (err) {
                        // Invalid JSON - keep the text but don't update userInvoice
                        // This allows user to continue typing
                      }
                    }}
                    className="min-h-[120px] font-mono text-sm"
                  />
                  {userInvoice && (
                    <p className="text-xs text-green-600">✓ Valid JSON</p>
                  )}
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={!userInvoice || isSubmittingFeedback}
                    className="w-full"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* History Section */}
      {sessionId && (
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleToggleHistory}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                Session History ({history.length})
              </CardTitle>
              {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No history available</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">Transcription:</p>
                      <p className="text-sm text-gray-600 mb-3">{item.transcription}</p>
                      <p className="text-sm font-medium text-gray-900 mb-2">Question:</p>
                      <p className="text-sm text-gray-600">{item.question}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* New Session Button */}
      {sessionId && (
        <div className="flex justify-center">
          <Button onClick={handleStartNewSession} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start New Session
          </Button>
        </div>
      )}
    </div>
  );
};

export default Talk2Bill;

