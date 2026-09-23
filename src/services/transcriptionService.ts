/**
 * Client service to record audio from microphone and send to server
 * for transcription using Gemini 3.5 Transcribe (gemini-3.5-transcribe).
 */

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const mimeType = audioBlob.type || 'audio/webm';
  
  // Convert blob to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip data url prefix e.g. "data:audio/webm;codecs=opus;base64,"
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioBase64: base64Data,
      mimeType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const data = await response.json();
  return data.text || '';
}
