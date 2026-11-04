import React, { useState } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { AudioTranscribeModal } from './AudioTranscribeModal';

interface VoiceMicButtonProps {
  onTranscribe: (text: string) => void;
  title?: string;
  subtitle?: string;
  buttonClassName?: string;
  tooltip?: string;
  mode?: 'search' | 'generic';
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  onTranscribe,
  title = 'Voice Search with Gemini',
  subtitle = 'Input audio with your microphone to transcribe and search products',
  buttonClassName,
  tooltip = 'Search with Voice (Gemini 3.5 Transcribe)',
  mode = 'search'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          buttonClassName ||
          'p-2 text-ink-muted/80 hover:text-brand hover:bg-brand-soft rounded-full transition flex items-center justify-center'
        }
        title={tooltip}
        aria-label={tooltip}
      >
        <Mic className="w-4 h-4 text-brand" />
      </button>

      <AudioTranscribeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApplyText={onTranscribe}
        title={title}
        subtitle={subtitle}
        initialMode={mode}
      />
    </>
  );
};
