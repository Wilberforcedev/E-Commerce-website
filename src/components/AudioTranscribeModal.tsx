import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '../services/transcriptionService';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Loader2,
  X,
  Search,
  Copy,
  Check,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText?: (text: string) => void;
  title?: string;
  subtitle?: string;
  initialMode?: 'search' | 'generic';
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  onApplyText,
  title = 'Voice Search & Audio Transcription',
  subtitle = 'Speak into your microphone and Gemini 3.5 Transcribe will convert your speech to text.',
  initialMode = 'search'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setTranscription('');
      setRecordingSeconds(0);
      setCopied(false);
      // Auto-start recording for quick voice search
      startRecording();
    } else {
      stopMediaStream();
    }
    return () => {
      stopMediaStream();
    };
  }, [isOpen]);

  const stopMediaStream = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    setError(null);
    setTranscription('');
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone audio recording is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm'
        });
        
        if (audioBlob.size > 0) {
          await handleTranscribeBlob(audioBlob);
        } else {
          setError('No audio captured. Please try speaking again.');
        }

        // Clean up tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start(250);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else {
        setError(err.message || 'Could not access microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleTranscribeBlob = async (blob: Blob) => {
    setIsTranscribing(true);
    setError(null);
    try {
      const text = await transcribeAudio(blob);
      setTranscription(text);
      if (!text) {
        setError('No speech was detected in the recording. Please speak clearly and try again.');
      }
    } catch (err: any) {
      console.error('Transcription failed:', err);
      setError(err.message || 'Failed to transcribe audio. Please check your connection.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (transcription && navigator.clipboard) {
      navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (transcription && onApplyText) {
      onApplyText(transcription);
      onClose();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Recording Display */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-100 text-center relative overflow-hidden">
          
          {/* Animated Wave Rings during recording */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-32 h-32 rounded-full bg-indigo-400/20 animate-ping" />
              <span className="w-24 h-24 rounded-full bg-indigo-500/25 animate-pulse" />
            </div>
          )}

          {/* Central Mic Button */}
          <div className="relative mb-4 z-10">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-200 flex flex-col items-center justify-center gap-1 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Click to Stop Recording"
              >
                <Square className="w-6 h-6 fill-white" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Stop</span>
              </button>
            ) : isTranscribing ? (
              <div className="w-20 h-20 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-200 flex flex-col items-center justify-center gap-1">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
            ) : (
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 flex flex-col items-center justify-center gap-1 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                title="Click to Record Again"
              >
                <Mic className="w-7 h-7" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Record</span>
              </button>
            )}
          </div>

          {/* Status Message */}
          <div className="space-y-1 z-10">
            {isRecording ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>Listening... {formatSeconds(recordingSeconds)}</span>
                </div>
                <p className="text-xs text-slate-500">Speak your search query, product name, or notes</p>
              </>
            ) : isTranscribing ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transcribing with gemini-3.5-transcribe...</span>
                </div>
                <p className="text-xs text-slate-500">Processing audio with Google Gemini Speech model</p>
              </>
            ) : transcription ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Audio Transcribed Successfully!</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Click the microphone to start speaking</p>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Transcription Note</p>
              <p className="mt-0.5 text-rose-600">{error}</p>
            </div>
          </div>
        )}

        {/* Transcription Output */}
        {transcription && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                Transcription Result
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-semibold"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium leading-relaxed max-h-36 overflow-y-auto">
              "{transcription}"
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          {transcription && onApplyText && (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-200 transition flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{initialMode === 'search' ? 'Search with this Voice Query' : 'Use Transcription'}</span>
            </button>
          )}

          {!isRecording && !isTranscribing && (
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Record Again</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
