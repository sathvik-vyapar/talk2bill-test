/**
 * VoiceSampleSelector.tsx
 *
 * Reusable component for selecting and playing voice samples.
 * Features:
 * - Filters samples by transaction type
 * - Play button to listen to audio (shows alert if unavailable)
 * - Expandable transcript view
 * - Use as input functionality
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

export interface VoiceSample {
  filename: string;
  transaction_type: string;
  language: string;
  complexity: string;
  duration_seconds: number;
  description: string;
  text: string;
}

interface VoiceSamplesData {
  voice_samples: VoiceSample[];
  summary: {
    total_samples: number;
    by_transaction_type: Record<string, number>;
    by_language: Record<string, number>;
    by_complexity: Record<string, number>;
  };
}

interface VoiceSampleSelectorProps {
  /** Transaction type to filter samples */
  transactionType?: string;
  /** Callback when user selects a sample to use as input */
  onSelectSample: (sample: VoiceSample, audioUrl: string | null) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Base path for audio files */
const AUDIO_BASE_PATH = '/talk2bill-test/audio/samples/';

/** Map Talk2Bill transaction types to voice sample types */
const TRANSACTION_TYPE_MAP: Record<string, string[]> = {
  '7': ['Expense'], // EXPENSE
  '3': ['Payment In'], // PAYMENT_IN
  '4': ['Payment Out'], // PAYMENT_OUT
  // For Speech2Text (string-based)
  'Expense': ['Expense'],
  'Payment In': ['Payment In'],
  'Payment Out': ['Payment Out'],
  'Sale': ['Sale'],
  'Sale Order': ['Sale Order'],
  'Delivery Challan': ['Delivery Challan'],
  // All types for no filter
  'all': ['Expense', 'Sale', 'Payment In', 'Payment Out', 'Sale Order', 'Delivery Challan'],
};

/** Complexity badge colors */
const COMPLEXITY_COLORS: Record<string, string> = {
  'Medium': 'bg-green-100 text-green-700',
  'Medium-High': 'bg-yellow-100 text-yellow-700',
  'Complex': 'bg-red-100 text-red-700',
};

/** Language badge colors */
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

  const [samples, setSamples] = useState<VoiceSample[]>([]);
  const [filteredSamples, setFilteredSamples] = useState<VoiceSample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSample, setExpandedSample] = useState<string | null>(null);
  const [playingSample, setPlayingSample] = useState<string | null>(null);
  const [showUnavailableDialog, setShowUnavailableDialog] = useState(false);
  const [audioAvailability, setAudioAvailability] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  // Load voice samples on mount
  useEffect(() => {
    const loadSamples = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/talk2bill-test/data/voice-samples.json');
        if (!response.ok) {
          throw new Error('Failed to load voice samples');
        }
        const data: VoiceSamplesData = await response.json();
        setSamples(data.voice_samples);

        // Check audio availability for each sample
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

  // Filter samples when transaction type changes
  useEffect(() => {
    const allowedTypes = TRANSACTION_TYPE_MAP[transactionType] || TRANSACTION_TYPE_MAP['all'];
    const filtered = samples.filter((sample) =>
      allowedTypes.includes(sample.transaction_type)
    );
    setFilteredSamples(filtered);
  }, [transactionType, samples]);

  // Cleanup audio on unmount
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

  const handlePlayPause = async (sample: VoiceSample) => {
    const isAvailable = audioAvailability[sample.filename];

    if (!isAvailable) {
      setShowUnavailableDialog(true);
      return;
    }

    if (playingSample === sample.filename) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSample(null);
    } else {
      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Play new audio
      const audioUrl = `${AUDIO_BASE_PATH}${sample.filename}`;
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlayingSample(null);
      audioRef.current.onerror = () => {
        setPlayingSample(null);
        setShowUnavailableDialog(true);
      };

      try {
        await audioRef.current.play();
        setPlayingSample(sample.filename);
      } catch {
        setShowUnavailableDialog(true);
      }
    }
  };

  const handleSelectSample = (sample: VoiceSample) => {
    const isAvailable = audioAvailability[sample.filename];
    const audioUrl = isAvailable ? `${AUDIO_BASE_PATH}${sample.filename}` : null;

    if (!isAvailable) {
      setShowUnavailableDialog(true);
      return;
    }

    onSelectSample(sample, audioUrl);
  };

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
      <Card className={className}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
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
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
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
        </Collapsible>
      </Card>

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
    </>
  );
};

export default VoiceSampleSelector;
