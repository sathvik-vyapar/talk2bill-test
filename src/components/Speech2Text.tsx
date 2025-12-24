/**
 * Speech2Text.tsx
 *
 * Enhanced audio transcription component for comparing STT models.
 * Features:
 * - Audio recording with visual feedback (timer, waveform animation)
 * - File upload support (drag & drop or click)
 * - Side-by-side comparison of Whisper and Sarvam models
 * - Quick-copy and auto-fill functionality
 * - Processing time metrics
 * - Step-by-step workflow indicator
 * - Session history tracking
 *
 * @author Vyapar Team
 * @version 2.0.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Mic,
  Square,
  Loader2,
  Upload,
  Play,
  CheckCircle,
  Copy,
  ArrowRight,
  Clock,
  FileAudio,
  Trash2,
  Volume2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  Check,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VoiceSampleSelector, { VoiceSample } from '@/components/VoiceSampleSelector';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface TranscriptionResponse {
  message: string;
  data: {
    whisper: {
      transcription: string;
      translation: string;
    };
    sarvam: {
      transcription: string;
      translation: string;
    };
    s3_info: {
      bucket: string;
      key: string;
      region?: string;
    };
  };
}

interface ModelOutput {
  text: string;
  isIncorrect: boolean;
}

interface TranscriptionState {
  whisperTranscription: ModelOutput;
  whisperTranslation: ModelOutput;
  sarvamTranscription: ModelOutput;
  sarvamTranslation: ModelOutput;
  correctTranscription: string;
  correctTranslation: string;
}

interface SessionHistoryItem {
  id: string;
  timestamp: Date;
  audioFileName: string;
  whisperTranscription: string;
  sarvamTranscription: string;
  correctTranscription: string;
  processingTime: number;
}

type WorkflowStep = 'record' | 'process' | 'review' | 'submit';

// =============================================================================
// CONSTANTS
// =============================================================================

import { API_ENDPOINTS } from '@/lib/api-config';

const API_ENDPOINTS_LOCAL = {
  UPLOAD: API_ENDPOINTS.TALK2BILL.UPLOAD,
  VERIFY: API_ENDPOINTS.TALK2BILL.VERIFY,
} as const;

const INITIAL_TRANSCRIPTION_STATE: TranscriptionState = {
  whisperTranscription: { text: '', isIncorrect: false },
  whisperTranslation: { text: '', isIncorrect: false },
  sarvamTranscription: { text: '', isIncorrect: false },
  sarvamTranslation: { text: '', isIncorrect: false },
  correctTranscription: '',
  correctTranslation: '',
};

const WORKFLOW_STEPS: { id: WorkflowStep; label: string; icon: React.ReactNode }[] = [
  { id: 'record', label: 'Record/Upload', icon: <Mic className="w-4 h-4" /> },
  { id: 'process', label: 'Process', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'review', label: 'Review', icon: <CheckCircle className="w-4 h-4" /> },
  { id: 'submit', label: 'Submit', icon: <ArrowRight className="w-4 h-4" /> },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Formats seconds into MM:SS display format
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats milliseconds into a human-readable duration
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Counts words in a string
 */
const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Generates a unique ID for session history
 */
const generateId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const AudioTranscription: React.FC = () => {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  // Core state (preserved from original)
  const [s3Info, setS3Info] = useState<{
    bucket: string;
    key: string;
    region?: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionState>(INITIAL_TRANSCRIPTION_STATE);

  // Enhanced state
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('record');
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [audioFileName, setAudioFileName] = useState<string>('recording.wav');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>('all');

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  // Load session history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('stt-session-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setSessionHistory(parsed.slice(0, 10)); // Keep only last 10
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Update workflow step based on state
  useEffect(() => {
    if (successMessage) {
      setCurrentStep('submit');
    } else if (transcriptions.whisperTranscription.text || transcriptions.sarvamTranscription.text) {
      setCurrentStep('review');
    } else if (audioUrl) {
      setCurrentStep('process');
    } else {
      setCurrentStep('record');
    }
  }, [audioUrl, transcriptions, successMessage]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-hide copied indicator
  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => setCopiedField(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedField]);

  // ---------------------------------------------------------------------------
  // RECORDING FUNCTIONS
  // ---------------------------------------------------------------------------

  const startRecording = async () => {
    try {
      // Clear previous recording if exists
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

      // Start timer
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

      // Stop timer
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

    // Clear previous recording
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
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // ---------------------------------------------------------------------------
  // PROCESSING FUNCTIONS
  // ---------------------------------------------------------------------------

  const handleProcessAudio = async () => {
    if (!audioUrl) return;

    setIsProcessing(true);
    setError(null);
    const startTime = Date.now();

    try {
      const audioBlob = await fetch(audioUrl).then((r) => r.blob());
      const formData = new FormData();
      formData.append('file', audioBlob, audioFileName);

      const response = await fetch(API_ENDPOINTS_LOCAL.UPLOAD, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data: TranscriptionResponse = await response.json();
      const endTime = Date.now();
      setProcessingTime(endTime - startTime);

      setS3Info({
        bucket: data.data.s3_info.bucket,
        key: data.data.s3_info.key,
        region: data.data.s3_info.region ?? 'ap-south-1',
      });

      setTranscriptions({
        whisperTranscription: { text: data.data.whisper.transcription, isIncorrect: false },
        whisperTranslation: { text: data.data.whisper.translation, isIncorrect: false },
        sarvamTranscription: { text: data.data.sarvam.transcription, isIncorrect: false },
        sarvamTranslation: { text: data.data.sarvam.translation, isIncorrect: false },
        correctTranscription: '',
        correctTranslation: '',
      });
    } catch (err) {
      setError('Failed to process audio. Please try again.');
      console.error('Error processing audio:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReRecord = () => {
    // Clean up previous recording
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    // Reset states
    setTranscriptions(INITIAL_TRANSCRIPTION_STATE);
    setProcessingTime(null);
    setRecordingTime(0);
    setS3Info(null);
    setSuccessMessage(null);
  };

  // ---------------------------------------------------------------------------
  // SUBMISSION FUNCTIONS
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    const data = {
      ...transcriptions,
      s3_info: s3Info,
    };

    if (!s3Info) {
      setError('Please process/record the audio first');
      return;
    }

    if (transcriptions.correctTranscription === '' || transcriptions.correctTranslation === '') {
      setError('Please enter the correct transcription and translation');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.VERIFY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit transcriptions');
      }

      // Save to session history
      const historyItem: SessionHistoryItem = {
        id: generateId(),
        timestamp: new Date(),
        audioFileName,
        whisperTranscription: transcriptions.whisperTranscription.text,
        sarvamTranscription: transcriptions.sarvamTranscription.text,
        correctTranscription: transcriptions.correctTranscription,
        processingTime: processingTime || 0,
      };

      const newHistory = [historyItem, ...sessionHistory].slice(0, 10);
      setSessionHistory(newHistory);
      localStorage.setItem('stt-session-history', JSON.stringify(newHistory));

      // Show success message
      setSuccessMessage('Transcription submitted successfully!');

      // Reset after delay
      setTimeout(() => {
        resetProcess();
      }, 2000);

      console.log('Transcriptions submitted successfully');
    } catch (err) {
      setError('Failed to submit transcriptions. Please try again.');
      console.error('Error submitting transcriptions:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProcess = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setS3Info(null);
    setIsRecording(false);
    setIsProcessing(false);
    setError(null);
    setAudioUrl(null);
    setTranscriptions(INITIAL_TRANSCRIPTION_STATE);
    setProcessingTime(null);
    setRecordingTime(0);
    setSuccessMessage(null);

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  // ---------------------------------------------------------------------------
  // HELPER HANDLERS
  // ---------------------------------------------------------------------------

  const handleTranscriptionChange = (
    field: keyof TranscriptionState,
    value: string | boolean,
    subField?: 'isIncorrect'
  ) => {
    setTranscriptions((prev) => {
      if (field === 'correctTranscription' || field === 'correctTranslation') {
        return {
          ...prev,
          [field]: value as string,
        };
      }

      const modelOutput = prev[field] as ModelOutput;
      return {
        ...prev,
        [field]: {
          ...modelOutput,
          [subField || 'text']: value,
        },
      };
    });
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const useAsCorrect = (transcription: string, translation: string) => {
    setTranscriptions((prev) => ({
      ...prev,
      correctTranscription: transcription,
      correctTranslation: translation,
    }));
  };

  const clearHistory = () => {
    setSessionHistory([]);
    localStorage.removeItem('stt-session-history');
  };

  /**
   * Handles selection of a voice sample from VoiceSampleSelector.
   *
   * This callback is triggered when the user clicks "Use this sample" in the
   * VoiceSampleSelector component. It:
   * 1. Fetches the audio file from the provided URL
   * 2. Creates a blob URL for the audio player
   * 3. Sets the audio state so it appears in the recording/upload section
   * 4. User can then click "Process Audio" to compare STT models
   *
   * Integration with VoiceSampleSelector:
   * - User selects transaction type from dropdown (selectedTransactionType state)
   * - VoiceSampleSelector filters samples based on that selection
   * - When user selects a sample, this handler loads it for processing
   *
   * Unlike Talk2Bill:
   * - Speech2Text supports ALL transaction types (including Sale, Sale Order, etc.)
   * - Uses string-based type names instead of numeric codes
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
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  const renderWorkflowSteps = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {WORKFLOW_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isPast = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep) > index;

        return (
          <React.Fragment key={step.id}>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : isPast
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isPast ? <Check className="w-4 h-4" /> : step.icon}
              <span className="text-sm hidden sm:inline">{step.label}</span>
            </div>
            {index < WORKFLOW_STEPS.length - 1 && (
              <ArrowRight className={`w-4 h-4 ${isPast ? 'text-green-500' : 'text-gray-300'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderRecordingSection = () => (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        {/* Recording/Upload - Compact inline layout */}
        {!audioUrl && (
          <div className="flex items-center gap-4">
            {/* Mic Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white shadow-md hover:shadow-lg`}
            >
              {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Recording State / Instructions */}
            <div className="flex-1 min-w-0">
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-mono text-lg font-medium">{formatTime(recordingTime)}</span>
                  </div>
                  <span className="text-sm text-gray-500">Recording... Click to stop</span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-700">Click mic to record</p>
                  <p className="text-xs text-gray-400">or drag & drop an audio file</p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Button variant="outline" size="sm" className={`gap-1.5 ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}>
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </div>
          </div>
        )}

        {/* Audio Player when recorded/uploaded - Compact */}
        {audioUrl && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <div className="p-1.5 bg-blue-100 rounded">
                <FileAudio className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{audioFileName}</p>
                {recordingTime > 0 && (
                  <p className="text-xs text-gray-500">{formatTime(recordingTime)}</p>
                )}
              </div>
              <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleReRecord}
                variant="ghost"
                size="sm"
                disabled={isProcessing}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </Button>
              <Button
                onClick={handleProcessAudio}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Process
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderModelCard = (
    modelName: string,
    transcription: ModelOutput,
    translation: ModelOutput,
    transcriptionField: keyof TranscriptionState,
    translationField: keyof TranscriptionState,
    color: 'blue' | 'purple'
  ) => {
    const colorClasses = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        icon: 'text-blue-600',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        badge: 'bg-purple-100 text-purple-800',
        icon: 'text-purple-600',
      },
    };

    const classes = colorClasses[color];

    return (
      <Card className={`${classes.border} border-2`}>
        <CardHeader className={`${classes.bg} pb-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className={`w-5 h-5 ${classes.icon}`} />
              <CardTitle className="text-lg">{modelName}</CardTitle>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => useAsCorrect(transcription.text, translation.text)}
              className="text-xs"
              disabled={!transcription.text}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Use as Correct
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Transcription */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Transcription
                {transcription.text && (
                  <Badge variant="secondary" className="text-xs">
                    {countWords(transcription.text)} words
                  </Badge>
                )}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyToClipboard(transcription.text, `${modelName}-trans`)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={!transcription.text}
                >
                  {copiedField === `${modelName}-trans` ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Incorrect</span>
                  <Checkbox
                    checked={transcription.isIncorrect}
                    onCheckedChange={(checked) =>
                      handleTranscriptionChange(transcriptionField, checked as boolean, 'isIncorrect')
                    }
                  />
                </div>
              </div>
            </div>
            <Textarea
              value={transcription.text}
              readOnly
              className={`bg-gray-50 ${transcription.isIncorrect ? 'border-red-300 bg-red-50' : ''}`}
              rows={3}
              placeholder="Transcription will appear here..."
            />
          </div>

          {/* Translation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Translation
                {translation.text && (
                  <Badge variant="secondary" className="text-xs">
                    {countWords(translation.text)} words
                  </Badge>
                )}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyToClipboard(translation.text, `${modelName}-transl`)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={!translation.text}
                >
                  {copiedField === `${modelName}-transl` ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Incorrect</span>
                  <Checkbox
                    checked={translation.isIncorrect}
                    onCheckedChange={(checked) =>
                      handleTranscriptionChange(translationField, checked as boolean, 'isIncorrect')
                    }
                  />
                </div>
              </div>
            </div>
            <Textarea
              value={translation.text}
              readOnly
              className={`bg-gray-50 ${translation.isIncorrect ? 'border-red-300 bg-red-50' : ''}`}
              rows={3}
              placeholder="Translation will appear here..."
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCorrectionSection = () => (
    <Card className="border-2 border-green-200">
      <CardHeader className="bg-green-50 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Corrections
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Correct Transcription *</label>
          <Textarea
            value={transcriptions.correctTranscription}
            onChange={(e) => handleTranscriptionChange('correctTranscription', e.target.value)}
            placeholder="Enter the correct transcription in original language..."
            rows={3}
            className="border-green-200 focus:border-green-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Correct Translation *</label>
          <Textarea
            value={transcriptions.correctTranslation}
            onChange={(e) => handleTranscriptionChange('correctTranslation', e.target.value)}
            placeholder="Enter the correct English translation..."
            rows={3}
            className="border-green-200 focus:border-green-400"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderHistorySection = () => (
    <Card className="mt-6">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setShowHistory(!showHistory)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Recent Sessions ({sessionHistory.length})
          </CardTitle>
          {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </CardHeader>
      {showHistory && (
        <CardContent>
          {sessionHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No previous sessions</p>
          ) : (
            <div className="space-y-3">
              {sessionHistory.map((session) => (
                <div
                  key={session.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{session.audioFileName}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(session.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(session.processingTime)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {session.correctTranscription}
                  </p>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Speech to Text Comparison</h1>
        <p className="text-gray-600 mt-1">
          Compare transcriptions from Whisper and Sarvam models
        </p>
      </div>

      {/* Workflow Steps */}
      {renderWorkflowSteps()}

      {/* Voice Sample Selection - Compact Layout */}
      <div className="space-y-2">
        {/* Inline Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          <Select
            value={selectedTransactionType}
            onValueChange={setSelectedTransactionType}
          >
            <SelectTrigger className="w-auto min-w-[140px] h-8 text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
              <SelectItem value="Sale">Sale</SelectItem>
              <SelectItem value="Payment In">Payment In</SelectItem>
              <SelectItem value="Payment Out">Payment Out</SelectItem>
              <SelectItem value="Sale Order">Sale Order</SelectItem>
              <SelectItem value="Delivery Challan">Delivery Challan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voice Sample Selector */}
        <VoiceSampleSelector
          transactionType={selectedTransactionType}
          onSelectSample={handleVoiceSampleSelect}
          disabled={isRecording || isProcessing}
        />
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Recording/Upload Section */}
      {renderRecordingSection()}

      {/* Processing Time Badge */}
      {processingTime && (
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-sm py-1 px-3">
            <Clock className="w-4 h-4 mr-2" />
            Processed in {formatDuration(processingTime)}
          </Badge>
        </div>
      )}

      {/* Model Comparison Section */}
      {(transcriptions.whisperTranscription.text || transcriptions.sarvamTranscription.text) && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Model Outputs
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderModelCard(
              'Whisper',
              transcriptions.whisperTranscription,
              transcriptions.whisperTranslation,
              'whisperTranscription',
              'whisperTranslation',
              'blue'
            )}
            {renderModelCard(
              'Sarvam',
              transcriptions.sarvamTranscription,
              transcriptions.sarvamTranslation,
              'sarvamTranscription',
              'sarvamTranslation',
              'purple'
            )}
          </div>

          {/* Correction Section */}
          {renderCorrectionSection()}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
            disabled={isProcessing || isRecording || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit Corrections
              </>
            )}
          </Button>
        </div>
      )}

      {/* Session History */}
      {renderHistorySection()}
    </div>
  );
};

export default AudioTranscription;
