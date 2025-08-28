import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  };
}

interface TranscriptionData {
  text: string;
  isIncorrect: boolean;  // renamed from isSelected to better reflect its purpose
  correctedText: string;
}

const AudioTranscription = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);  // New state for audio URL
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [transcriptions, setTranscriptions] = useState<{
    whisperTranscription: TranscriptionData;
    whisperTranslation: TranscriptionData;
    sarvamTranscription: TranscriptionData;
    sarvamTranslation: TranscriptionData;
  }>({
    whisperTranscription: { text: '', isIncorrect: false, correctedText: '' },
    whisperTranslation: { text: '', isIncorrect: false, correctedText: '' },
    sarvamTranscription: { text: '', isIncorrect: false, correctedText: '' },
    sarvamTranslation: { text: '', isIncorrect: false, correctedText: '' },
  });

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
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to access microphone. Please ensure microphone permissions are granted.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleProcessAudio = async () => {
    if (!audioUrl) return;

    setIsProcessing(true);
    setError(null);

    try {
      const audioBlob = await fetch(audioUrl).then(r => r.blob());
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');

      const response = await fetch('https://analytics-staging.vyaparapp.in/api/ps/talk2bill-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data: TranscriptionResponse = await response.json();
      
      setTranscriptions({
        whisperTranscription: { 
          text: data.data.whisper.transcription, 
          isIncorrect: false, 
          correctedText: '' 
        },
        whisperTranslation: {
          text: data.data.whisper.translation,
          isIncorrect: false,
          correctedText: ''
        },
        sarvamTranscription: { 
          text: data.data.sarvam.transcription, 
          isIncorrect: false, 
          correctedText: '' 
        },
        sarvamTranslation: { 
          text: data.data.sarvam.translation, 
          isIncorrect: false, 
          correctedText: '' 
        },
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
    // Reset transcriptions
    setTranscriptions({
      whisperTranscription: { text: '', isIncorrect: false, correctedText: '' },
      whisperTranslation: { text: '', isIncorrect: false, correctedText: '' },
      sarvamTranscription: { text: '', isIncorrect: false, correctedText: '' },
      sarvamTranslation: { text: '', isIncorrect: false, correctedText: '' },
    });
  };

  const handleSubmit = async () => {
    const corrections = {
      whisper_transcription: transcriptions.whisperTranscription.isIncorrect ? transcriptions.whisperTranscription.correctedText : null,
      whisper_translation: transcriptions.whisperTranslation.isIncorrect ? transcriptions.whisperTranslation.correctedText : null,
      sarvam_transcription: transcriptions.sarvamTranscription.isIncorrect ? transcriptions.sarvamTranscription.correctedText : null,
      sarvam_translation: transcriptions.sarvamTranslation.isIncorrect ? transcriptions.sarvamTranslation.correctedText : null,
    };

    // console.log(corrections);
    const data = transcriptions;
    console.log(data);

    try {
      const response = await fetch('YOUR_SUBMISSION_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original: {
            whisper_transcription: transcriptions.whisperTranscription.text,
            whisper_translation: transcriptions.whisperTranslation.text,
            sarvam_transcription: transcriptions.sarvamTranscription.text,
            sarvam_translation: transcriptions.sarvamTranslation.text,
          },
          corrections: corrections
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit transcriptions');
      }

      console.log('Transcriptions submitted successfully');
    } catch (err) {
      setError('Failed to submit transcriptions. Please try again.');
      console.error('Error submitting transcriptions:', err);
    }
  };

  const handleTranscriptionChange = (
    key: keyof typeof transcriptions,
    field: keyof TranscriptionData,
    value: string | boolean
  ) => {
    setTranscriptions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio Recording & Transcription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Controls */}
          <div className="space-y-4">
            {!audioUrl && (
              <div className="flex justify-center gap-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  className="flex items-center gap-2"
                  disabled={isProcessing}
                >
                  {isRecording ? (
                    <>
                      <Square className="w-4 h-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Audio Player and Process Controls */}
            {audioUrl && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <audio 
                    src={audioUrl} 
                    controls 
                    className="w-full"
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleReRecord}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    <Mic className="w-4 h-4" />
                    Record Again
                  </Button>
                  <Button
                    onClick={handleProcessAudio}
                    variant="default"
                    className="flex items-center gap-2"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Process Audio
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Transcription Results */}
          <div className="space-y-6 mt-6">
            {/* Whisper Transcription */}
            <div className="space-y-3 border p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Whisper Transcription
                </label>
                <div className="flex items-center gap-2">
                  <label htmlFor="whisperTranscription" className="text-sm text-gray-600">
                    Needs Correction
                  </label>
                  <Checkbox
                    id="whisperTranscription"
                    checked={transcriptions.whisperTranscription.isIncorrect}
                    onCheckedChange={(checked) => 
                      handleTranscriptionChange('whisperTranscription', 'isIncorrect', checked as boolean)
                    }
                  />
                </div>
              </div>
              <Textarea
                value={transcriptions.whisperTranscription.text}
                readOnly
                className="bg-gray-50"
                rows={2}
              />
              {transcriptions.whisperTranscription.isIncorrect && (
                <Textarea
                  value={transcriptions.whisperTranscription.correctedText}
                  onChange={(e) => handleTranscriptionChange('whisperTranscription', 'correctedText', e.target.value)}
                  placeholder="Enter the correct transcription..."
                  rows={2}
                />
              )}
            </div>

            {/* Whisper Translation */}
            <div className="space-y-3 border p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Whisper Translation
                </label>
                <div className="flex items-center gap-2">
                  <label htmlFor="whisperTranslation" className="text-sm text-gray-600">
                    Needs Correction
                  </label>
                  <Checkbox
                    id="whisperTranslation"
                    checked={transcriptions.whisperTranslation.isIncorrect}
                    onCheckedChange={(checked) => 
                      handleTranscriptionChange('whisperTranslation', 'isIncorrect', checked as boolean)
                    }
                  />
                </div>
              </div>
              <Textarea
                value={transcriptions.whisperTranslation.text}
                readOnly
                className="bg-gray-50"
                rows={2}
              />
              {transcriptions.whisperTranslation.isIncorrect && (
                <Textarea
                  value={transcriptions.whisperTranslation.correctedText}
                  onChange={(e) => handleTranscriptionChange('whisperTranslation', 'correctedText', e.target.value)}
                  placeholder="Enter the correct translation..."
                  rows={2}
                />
              )}
            </div>

            {/* Sarvam Original Transcription */}
            <div className="space-y-3 border p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Sarvam Transcription
                </label>
                <div className="flex items-center gap-2">
                  <label htmlFor="sarvamTranscription" className="text-sm text-gray-600">
                    Needs Correction
                  </label>
                  <Checkbox
                    id="sarvamTranscription"
                    checked={transcriptions.sarvamTranscription.isIncorrect}
                    onCheckedChange={(checked) => 
                      handleTranscriptionChange('sarvamTranscription', 'isIncorrect', checked as boolean)
                    }
                  />
                </div>
              </div>
              <Textarea
                value={transcriptions.sarvamTranscription.text}
                readOnly
                className="bg-gray-50"
                rows={2}
              />
              {transcriptions.sarvamTranscription.isIncorrect && (
                <Textarea
                  value={transcriptions.sarvamTranscription.correctedText}
                  onChange={(e) => handleTranscriptionChange('sarvamTranscription', 'correctedText', e.target.value)}
                  placeholder="Enter the correct transcription..."
                  rows={2}
                />
              )}
            </div>

            {/* Sarvam Translation */}
            <div className="space-y-3 border p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Sarvam Translation
                </label>
                <div className="flex items-center gap-2">
                  <label htmlFor="sarvamTranslation" className="text-sm text-gray-600">
                    Needs Correction
                  </label>
                  <Checkbox
                    id="sarvamTranslation"
                    checked={transcriptions.sarvamTranslation.isIncorrect}
                    onCheckedChange={(checked) => 
                      handleTranscriptionChange('sarvamTranslation', 'isIncorrect', checked as boolean)
                    }
                  />
                </div>
              </div>
              <Textarea
                value={transcriptions.sarvamTranslation.text}
                readOnly
                className="bg-gray-50"
                rows={2}
              />
              {transcriptions.sarvamTranslation.isIncorrect && (
                <Textarea
                  value={transcriptions.sarvamTranslation.correctedText}
                  onChange={(e) => handleTranscriptionChange('sarvamTranslation', 'correctedText', e.target.value)}
                  placeholder="Enter the correct translation..."
                  rows={2}
                />
              )}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full mt-4"
              disabled={isProcessing || isRecording}
            >
              Submit Transcriptions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioTranscription;