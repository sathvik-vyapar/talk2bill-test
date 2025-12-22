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

const AudioTranscription = () => {
  const [s3Info, setS3Info] = useState<{
    bucket: string;
    key: string;
    region?: string;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);  // New state for audio URL
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [transcriptions, setTranscriptions] = useState<TranscriptionState>({
    whisperTranscription: { text: '', isIncorrect: false },
    whisperTranslation: { text: '', isIncorrect: false },
    sarvamTranscription: { text: '', isIncorrect: false },
    sarvamTranslation: { text: '', isIncorrect: false },
    correctTranscription: '',
    correctTranslation: '',
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

      const response = await fetch('https://analytics-staging.vyaparapp.in/api/ps/talk2bill/talk2bill-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },  
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio');
      }

      const data: TranscriptionResponse = await response.json();
      setS3Info({
        bucket: data.data.s3_info.bucket,
        key: data.data.s3_info.key,
        region: data.data.s3_info.region ?? "ap-south-1"
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
    // Reset transcriptions
    setTranscriptions({
      whisperTranscription: { text: '', isIncorrect: false },
      whisperTranslation: { text: '', isIncorrect: false },
      sarvamTranscription: { text: '', isIncorrect: false },
      sarvamTranslation: { text: '', isIncorrect: false },
      correctTranscription: '',
      correctTranslation: '',
    });
  };

  const handleSubmit = async () => {

    const data = {
      ...transcriptions,
      s3_info: s3Info
    };
    console.log(data);
    if (!s3Info) {
      setError('Please process/record the audio first');
      return;
    }

    if (transcriptions.correctTranscription === '' || transcriptions.correctTranslation === '') {
      setError('Please enter the correct transcription and translation');
      return;
    }

    try {
      const response = await fetch('https://analytics-staging.vyaparapp.in/api/ps/talk2bill/talk2bill-voice-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit transcriptions');
      }

      const resetProcess = () => {
        // Clear audio URL if it exists
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        // Reset all states to their initial values
        setS3Info(null);
        setIsRecording(false);
        setIsProcessing(false);
        setError(null);
        setAudioUrl(null);
        setTranscriptions({
          whisperTranscription: { text: '', isIncorrect: false },
          whisperTranslation: { text: '', isIncorrect: false },
          sarvamTranscription: { text: '', isIncorrect: false },
          sarvamTranslation: { text: '', isIncorrect: false },
          correctTranscription: '',
          correctTranslation: '',
        });
        
        // Clear refs
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
      };
      resetProcess();
      console.log('Transcriptions submitted successfully');
    } catch (err) {
      setError('Failed to submit transcriptions. Please try again.');
      console.error('Error submitting transcriptions:', err);
    }
  };

  const handleTranscriptionChange = (
    field: keyof TranscriptionState,
    value: string | boolean,
    subField?: 'isIncorrect'
  ) => {
    setTranscriptions(prev => {
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


          {/* Transcription Results */}
          <div className="space-y-6 mt-6">
            {/* Model Outputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Whisper Outputs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Whisper Transcription</label>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Incorrect</label>
                      <Checkbox
                        checked={transcriptions.whisperTranscription.isIncorrect}
                        onCheckedChange={(checked) => 
                          handleTranscriptionChange('whisperTranscription', checked as boolean, 'isIncorrect')
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
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Whisper Translation</label>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Incorrect</label>
                      <Checkbox
                        checked={transcriptions.whisperTranslation.isIncorrect}
                        onCheckedChange={(checked) => 
                          handleTranscriptionChange('whisperTranslation', checked as boolean, 'isIncorrect')
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
                </div>
                {/* Sarvam Outputs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Sarvam Transcription</label>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Incorrect</label>
                      <Checkbox
                        checked={transcriptions.sarvamTranscription.isIncorrect}
                        onCheckedChange={(checked) => 
                          handleTranscriptionChange('sarvamTranscription', checked as boolean, 'isIncorrect')
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
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Sarvam Translation</label>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Incorrect</label>
                      <Checkbox
                        checked={transcriptions.sarvamTranslation.isIncorrect}
                        onCheckedChange={(checked) => 
                          handleTranscriptionChange('sarvamTranslation', checked as boolean, 'isIncorrect')
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
                </div>
              </div>
            </div>

            {/* Correction Fields */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Corrections</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Correct Transcription</label>
                  <Textarea
                    value={transcriptions.correctTranscription}
                    onChange={(e) => handleTranscriptionChange('correctTranscription', e.target.value)}
                    placeholder="Enter the correct transcription..."
                    rows={2}
                    />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Correct Translation</label>
                  <Textarea
                    value={transcriptions.correctTranslation}
                    onChange={(e) => handleTranscriptionChange('correctTranslation', e.target.value)}
                    placeholder="Enter the correct translation..."
                    rows={2}
                    />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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