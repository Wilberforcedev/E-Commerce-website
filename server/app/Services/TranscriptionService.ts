import { GoogleGenAI } from '@google/genai';

export class TranscriptionService {
  /**
   * Transcribe base64 audio data using Gemini 3.5 Transcribe
   */
  public static async transcribe(audioBase64: string, mimeType = 'audio/webm'): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on server');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType,
          },
        },
        {
          text: 'Transcribe this audio recording accurately verbatim. Return only the transcribed speech with proper punctuation.',
        },
      ],
    });

    return (response.text || '').trim();
  }
}
