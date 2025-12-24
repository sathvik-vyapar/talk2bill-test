/**
 * VoiceSampleSelector.tsx
 *
 * A reusable component for browsing, playing, and selecting pre-recorded voice samples
 * for testing the VAANI voice-to-invoice pipeline.
 *
 * ============================================================================
 * PURPOSE & CONTEXT
 * ============================================================================
 * This component provides sample voice inputs for testing the STT (Speech-to-Text)
 * and Talk2Bill features. It allows users to:
 * 1. Browse available voice samples filtered by transaction type
 * 2. Play audio samples to hear what's being spoken
 * 3. View the transcript of what's spoken in each sample
 * 4. Select a sample to use as input for processing
 *
 * ============================================================================
 * INTEGRATION POINTS
 * ============================================================================
 * This component is used in:
 * - Talk2Bill.tsx: Appears below transaction type selection, filters samples
 *   based on Payment In (3), Payment Out (4), or Expense (7)
 * - Speech2Text.tsx: Appears with a transaction type filter dropdown,
 *   supports all transaction types including Sale, Sale Order, Delivery Challan
 *
 * ============================================================================
 * DATA SOURCE
 * ============================================================================
 * Voice samples metadata is loaded from: /public/data/voice-samples.json
 * Audio files are expected at: /public/audio/samples/{filename}.wav
 *
 * The JSON file contains:
 * - filename: Name of the .wav file
 * - transaction_type: Expense, Sale, Payment In, Payment Out, Sale Order, Delivery Challan
 * - language: Hindi, English, or Hinglish
 * - complexity: Medium, Medium-High, or Complex
 * - duration_seconds: Length of the audio
 * - description: Brief description of what's in the audio
 * - text: Full transcript of what's spoken
 *
 * ============================================================================
 * AUDIO FILE AVAILABILITY
 * ============================================================================
 * Audio files may not always be present. The component:
 * 1. Checks if each audio file exists via HEAD request on mount
 * 2. Shows grayed-out play button if unavailable
 * 3. Displays a dialog prompting user to contact admin if they try to play/use
 *    an unavailable sample
 *
 * @author Vyapar Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  FileAudio,
  ChevronDown,
  ChevronUp,
  Languages,
  Clock,
  AlertCircle,
  Check,
  Volume2,
  X,
  List,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Represents a single voice sample entry from voice-samples.json
 * This interface is exported so parent components can type their handlers
 *
 * @example
 * // In Talk2Bill.tsx or Speech2Text.tsx:
 * const handleVoiceSampleSelect = (sample: VoiceSample, audioUrl: string | null) => {
 *   // Load the audio as input for processing
 * };
 */
export interface VoiceSample {
  /** Filename of the audio file (e.g., "expense_hindi_medium_01.wav") */
  filename: string;
  /** Transaction type: Expense, Sale, Payment In, Payment Out, Sale Order, Delivery Challan */
  transaction_type: string;
  /** Language spoken: Hindi, English, or Hinglish (mixed Hindi-English) */
  language: string;
  /** Complexity level: Medium, Medium-High, or Complex */
  complexity: string;
  /** Duration of the audio in seconds */
  duration_seconds: number;
  /** Brief description of the transaction in the audio */
  description: string;
  /** Full transcript of what's spoken in the audio (in original language) */
  text: string;
}

/**
 * Structure of the voice-samples.json file
 * Contains the array of samples plus summary statistics
 */
interface VoiceSamplesData {
  voice_samples: VoiceSample[];
  summary: {
    total_samples: number;
    by_transaction_type: Record<string, number>;
    by_language: Record<string, number>;
    by_complexity: Record<string, number>;
  };
}

/**
 * Props for the VoiceSampleSelector component
 */
interface VoiceSampleSelectorProps {
  /**
   * Transaction type to filter samples by.
   * - For Talk2Bill: Pass numeric codes as strings ("3", "4", "7")
   * - For Speech2Text: Pass type names ("Expense", "Sale", etc.)
   * - Pass "all" to show all samples
   */
  transactionType?: string;

  /**
   * Callback fired when user clicks "Use this sample"
   * Parent component should load the audio URL as input for processing
   * @param sample - The selected voice sample metadata
   * @param audioUrl - URL to the audio file, or null if unavailable
   */
  onSelectSample: (sample: VoiceSample, audioUrl: string | null) => void;

  /** Whether the selector is disabled (e.g., during recording/processing) */
  disabled?: boolean;

  /** Additional CSS classes for the card container */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Base path where audio sample files are stored.
 * Audio files should be placed in public/audio/samples/ with .wav extension.
 * The path includes the repo name for GitHub Pages deployment.
 */
const AUDIO_BASE_PATH = '/talk2bill-test/audio/samples/';

/**
 * Maps transaction type identifiers to voice sample transaction_type values.
 *
 * This mapping supports two input formats:
 * 1. Numeric codes from Talk2Bill (TransactionType enum values as strings)
 *    - '3' = PAYMENT_IN
 *    - '4' = PAYMENT_OUT
 *    - '7' = EXPENSE
 *
 * 2. String names from Speech2Text dropdown
 *    - 'Expense', 'Sale', 'Payment In', 'Payment Out', 'Sale Order', 'Delivery Challan'
 *
 * Each key maps to an array of allowed transaction types for flexible filtering.
 */
const TRANSACTION_TYPE_MAP: Record<string, string[]> = {
  // Talk2Bill numeric codes (from TransactionType enum in Talk2Bill.tsx)
  '7': ['Expense'],      // TransactionType.EXPENSE = 7
  '3': ['Payment In'],   // TransactionType.PAYMENT_IN = 3
  '4': ['Payment Out'],  // TransactionType.PAYMENT_OUT = 4

  // Speech2Text string-based filters
  'Expense': ['Expense'],
  'Payment In': ['Payment In'],
  'Payment Out': ['Payment Out'],
  'Sale': ['Sale'],
  'Sale Order': ['Sale Order'],
  'Delivery Challan': ['Delivery Challan'],

  // Show all samples when no filter is applied
  'all': ['Expense', 'Sale', 'Payment In', 'Payment Out', 'Sale Order', 'Delivery Challan'],
};

/**
 * Tailwind CSS classes for complexity level badges.
 * Colors indicate difficulty: green (easy) -> yellow (medium) -> red (hard)
 */
const COMPLEXITY_COLORS: Record<string, string> = {
  'Medium': 'bg-green-100 text-green-700',
  'Medium-High': 'bg-yellow-100 text-yellow-700',
  'Complex': 'bg-red-100 text-red-700',
};

/**
 * Tailwind CSS classes for language badges.
 * Distinct colors help users quickly identify the language of each sample.
 */
const LANGUAGE_COLORS: Record<string, string> = {
  'Hindi': 'bg-orange-100 text-orange-700',
  'English': 'bg-blue-100 text-blue-700',
  'Hinglish': 'bg-purple-100 text-purple-700',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Formats duration in seconds to MM:SS
 */
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Checks if audio file exists (async)
 */
const checkAudioExists = async (filename: string): Promise<boolean> => {
  try {
    const response = await fetch(`${AUDIO_BASE_PATH}${filename}`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const VoiceSampleSelector: React.FC<VoiceSampleSelectorProps> = ({
  transactionType = 'all',
  onSelectSample,
  disabled = false,
  className = '',
}) => {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  /** All voice samples loaded from JSON (unfiltered) */
  const [samples, setSamples] = useState<VoiceSample[]>([]);

  /** Samples filtered by the current transaction type */
  const [filteredSamples, setFilteredSamples] = useState<VoiceSample[]>([]);

  /** Loading state while fetching voice-samples.json */
  const [isLoading, setIsLoading] = useState(true);

  /** Error message if JSON fetch fails */
  const [error, setError] = useState<string | null>(null);

  /** Filename of the sample whose transcript is currently expanded */
  const [expandedSample, setExpandedSample] = useState<string | null>(null);

  /** Filename of the sample currently being played (null if nothing playing) */
  const [playingSample, setPlayingSample] = useState<string | null>(null);

  /** Controls visibility of the "Audio Not Available" dialog */
  const [showUnavailableDialog, setShowUnavailableDialog] = useState(false);

  /** Controls visibility of the "View All Samples" dialog */
  const [showAllSamplesDialog, setShowAllSamplesDialog] = useState(false);

  /**
   * Map of filename -> boolean indicating if audio file exists.
   * Populated on mount by checking each file via HEAD request.
   */
  const [audioAvailability, setAudioAvailability] = useState<Record<string, boolean>>({});

  /** Whether the sample list is expanded (collapsible card) - collapsed by default for minimal UI */
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Reference to the current Audio element for playback control.
   * Used to pause/stop audio when switching samples or unmounting.
   */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  /**
   * Load voice samples metadata on component mount.
   *
   * This effect:
   * 1. Fetches the voice-samples.json file from public/data/
   * 2. Stores the samples in state
   * 3. Checks each audio file's availability via HEAD requests
   *    (to show grayed-out state for missing files)
   *
   * Note: Audio availability checks are done sequentially to avoid
   * overwhelming the server with parallel requests.
   */
  useEffect(() => {
    const loadSamples = async () => {
      try {
        setIsLoading(true);

        // Fetch the voice samples metadata JSON
        const response = await fetch('/talk2bill-test/data/voice-samples.json');
        if (!response.ok) {
          throw new Error('Failed to load voice samples');
        }
        const data: VoiceSamplesData = await response.json();
        setSamples(data.voice_samples);

        // Check if each audio file actually exists on the server
        // This allows us to show unavailable state before user tries to play
        const availability: Record<string, boolean> = {};
        for (const sample of data.voice_samples) {
          availability[sample.filename] = await checkAudioExists(sample.filename);
        }
        setAudioAvailability(availability);
      } catch (err) {
        setError('Failed to load voice samples');
        console.error('Error loading voice samples:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSamples();
  }, []);

  /**
   * Filter samples when transaction type prop changes.
   *
   * Uses TRANSACTION_TYPE_MAP to convert the prop value to allowed
   * transaction types, then filters the samples array.
   */
  useEffect(() => {
    const allowedTypes = TRANSACTION_TYPE_MAP[transactionType] || TRANSACTION_TYPE_MAP['all'];
    const filtered = samples.filter((sample) =>
      allowedTypes.includes(sample.transaction_type)
    );
    setFilteredSamples(filtered);
  }, [transactionType, samples]);

  /**
   * Cleanup effect: Stop audio playback when component unmounts.
   * Prevents audio from continuing to play after navigating away.
   */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  /**
   * Handles play/pause button click for a voice sample.
   *
   * Behavior:
   * - If audio file is unavailable: Shows the "contact admin" dialog
   * - If this sample is already playing: Pauses it
   * - If another sample is playing: Stops it and plays this one
   * - If nothing is playing: Starts playing this sample
   *
   * @param sample - The voice sample to play/pause
   */
  const handlePlayPause = async (sample: VoiceSample) => {
    const isAvailable = audioAvailability[sample.filename];

    // Show dialog if audio file doesn't exist
    if (!isAvailable) {
      setShowUnavailableDialog(true);
      return;
    }

    // Toggle pause if this sample is already playing
    if (playingSample === sample.filename) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSample(null);
    } else {
      // Stop any currently playing audio before starting new one
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Create new Audio element and start playback
      const audioUrl = `${AUDIO_BASE_PATH}${sample.filename}`;
      audioRef.current = new Audio(audioUrl);

      // Reset state when audio ends naturally
      audioRef.current.onended = () => setPlayingSample(null);

      // Handle playback errors (e.g., file not found, format issues)
      audioRef.current.onerror = () => {
        setPlayingSample(null);
        setShowUnavailableDialog(true);
      };

      try {
        await audioRef.current.play();
        setPlayingSample(sample.filename);
      } catch {
        // Browser may block autoplay - show unavailable dialog
        setShowUnavailableDialog(true);
      }
    }
  };

  /**
   * Handles "Use this sample" button click.
   *
   * If the audio file is available, calls the onSelectSample prop
   * to notify the parent component (Talk2Bill or Speech2Text) to
   * load this sample as input for processing.
   *
   * @param sample - The voice sample to use as input
   */
  const handleSelectSample = (sample: VoiceSample) => {
    const isAvailable = audioAvailability[sample.filename];
    const audioUrl = isAvailable ? `${AUDIO_BASE_PATH}${sample.filename}` : null;

    // Can't use unavailable samples
    if (!isAvailable) {
      setShowUnavailableDialog(true);
      return;
    }

    // Notify parent component to load this sample
    onSelectSample(sample, audioUrl);
  };

  /**
   * Toggles the expanded state of a sample's transcript.
   * Only one transcript can be expanded at a time.
   *
   * @param filename - The filename of the sample to toggle
   */
  const toggleExpanded = (filename: string) => {
    setExpandedSample(expandedSample === filename ? null : filename);
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-gray-500">Loading voice samples...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8 text-red-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Collapsed state: Minimal inline trigger */}
        {!isExpanded ? (
          <div className={`flex items-center gap-2 ${className}`}>
            <CollapsibleTrigger asChild>
              <button
                className="flex-1 flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors text-sm"
                disabled={disabled}
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Volume2 className="w-4 h-4 text-blue-500" />
                  <span>{filteredSamples.length} sample voice inputs available</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-xs">Browse samples</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
            </CollapsibleTrigger>
            <button
              onClick={() => setShowAllSamplesDialog(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              title="View all voice samples"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">All</span>
            </button>
          </div>
        ) : (
          /* Expanded state: Full card with samples */
          <Card className={className}>
            <CardHeader className="pb-2">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    Sample Voice Inputs
                    <Badge variant="secondary" className="ml-2">
                      {filteredSamples.length} available
                    </Badge>
                  </CardTitle>
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </div>
              </CollapsibleTrigger>
            </CardHeader>

            <CollapsibleContent>
            <CardContent className="pt-2">
              {filteredSamples.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No voice samples available for this transaction type.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {filteredSamples.map((sample) => {
                    const isAvailable = audioAvailability[sample.filename];
                    const isPlaying = playingSample === sample.filename;
                    const isTranscriptExpanded = expandedSample === sample.filename;

                    return (
                      <div
                        key={sample.filename}
                        className={`border rounded-lg p-3 transition-all ${
                          disabled ? 'opacity-50' : 'hover:border-blue-300 hover:bg-blue-50/30'
                        }`}
                      >
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <Badge className={LANGUAGE_COLORS[sample.language] || 'bg-gray-100'}>
                                <Languages className="w-3 h-3 mr-1" />
                                {sample.language}
                              </Badge>
                              <Badge className={COMPLEXITY_COLORS[sample.complexity] || 'bg-gray-100'}>
                                {sample.complexity}
                              </Badge>
                              <Badge variant="outline" className="text-gray-600">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatDuration(sample.duration_seconds)}
                              </Badge>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {sample.description}
                            </p>
                          </div>

                          {/* Play Button */}
                          <button
                            onClick={() => handlePlayPause(sample)}
                            disabled={disabled}
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              isPlaying
                                ? 'bg-blue-600 text-white'
                                : isAvailable
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                            title={isAvailable ? (isPlaying ? 'Pause' : 'Play') : 'Audio not available'}
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 ml-0.5" />
                            )}
                          </button>
                        </div>

                        {/* Transcript Toggle */}
                        <button
                          onClick={() => toggleExpanded(sample.filename)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
                        >
                          <FileAudio className="w-3 h-3" />
                          {isTranscriptExpanded ? 'Hide transcript' : 'Show transcript'}
                          {isTranscriptExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {/* Transcript Content */}
                        {isTranscriptExpanded && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic border-l-2 border-blue-300">
                            "{sample.text}"
                          </div>
                        )}

                        {/* Use Sample Button */}
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelectSample(sample)}
                            disabled={disabled || !isAvailable}
                            className="text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Use this sample
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
            </CollapsibleContent>
          </Card>
        )}
      </Collapsible>

      {/* Audio Unavailable Dialog */}
      <Dialog open={showUnavailableDialog} onOpenChange={setShowUnavailableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              Audio File Not Available
            </DialogTitle>
            <DialogDescription className="text-gray-600 pt-2">
              The voice file for this sample does not exist yet. Please contact your admin to add this voice file to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowUnavailableDialog(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View All Samples Dialog */}
      <Dialog open={showAllSamplesDialog} onOpenChange={setShowAllSamplesDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="w-5 h-5 text-blue-600" />
              All Voice Samples
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete catalog of voice samples for testing. Green = available, Red = not yet uploaded.
            </DialogDescription>
          </DialogHeader>

          {/* Summary Stats */}
          <div className="flex gap-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">
                <strong className="text-green-600">
                  {samples.filter(s => audioAvailability[s.filename]).length}
                </strong> available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-600">
                <strong className="text-red-500">
                  {samples.filter(s => !audioAvailability[s.filename]).length}
                </strong> not uploaded
              </span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">
                Total: <strong>{samples.length}</strong>
              </span>
            </div>
          </div>

          {/* Samples List */}
          <div className="flex-1 overflow-y-auto py-2 -mx-6 px-6">
            <div className="space-y-2">
              {samples.map((sample) => {
                const isAvailable = audioAvailability[sample.filename];
                return (
                  <div
                    key={sample.filename}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      isAvailable
                        ? 'bg-green-50/50 border-green-200'
                        : 'bg-red-50/30 border-red-200'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {isAvailable ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>

                    {/* Sample Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {sample.transaction_type}
                        </Badge>
                        <Badge className={`text-xs ${LANGUAGE_COLORS[sample.language] || 'bg-gray-100'}`}>
                          {sample.language}
                        </Badge>
                        <Badge className={`text-xs ${COMPLEXITY_COLORS[sample.complexity] || 'bg-gray-100'}`}>
                          {sample.complexity}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(sample.duration_seconds)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-1">
                        {sample.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        {sample.filename}
                      </p>
                    </div>

                    {/* Play Button (if available) */}
                    {isAvailable && (
                      <button
                        onClick={() => handlePlayPause(sample)}
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          playingSample === sample.filename
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {playingSample === sample.filename ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t">
            <Button
              variant="outline"
              onClick={() => setShowAllSamplesDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceSampleSelector;
