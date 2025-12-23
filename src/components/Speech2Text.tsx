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
  RotateCcw
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <Card className="border-2 border-dashed border-gray-200">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Recording Button with Timer */}
          {!audioUrl && (
            <>
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white shadow-lg hover:shadow-xl`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
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

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* File Upload Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-gray-600 font-medium">
                  {isDragging ? 'Drop your audio file here' : 'Drag & drop an audio file'}
                </p>
                <p className="text-gray-400 text-sm mt-1">or click to browse (MP3, WAV, etc.)</p>
              </div>
            </>
          )}

          {/* Audio Player when recorded/uploaded */}
          {audioUrl && (
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
                  onClick={handleReRecord}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isProcessing}
                >
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </Button>
                <Button
                  onClick={handleProcessAudio}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Process Audio
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
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
