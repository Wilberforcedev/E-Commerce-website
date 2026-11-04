import { Request, Response } from 'express';
import { Controller } from './Controller';
import { TranscriptionService } from '../../Services/TranscriptionService';

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil(MAX_AUDIO_BYTES / 3) * 4;
const ALLOWED_AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/mpeg',
  'audio/mp3',
  'audio/aac',
  'audio/flac',
]);

export class TranscriptionController extends Controller {
  /**
   * Transcribe audio data using Gemini 3.5 Transcribe (POST /api/transcribe)
   */
  public transcribe = async (req: Request, res: Response) => {
    const { audioBase64, mimeType } = req.body ?? {};

    const rawBase64 = typeof audioBase64 === 'string'
      ? audioBase64.replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '')
      : '';
    if (!rawBase64) return this.error(res, 'An audio recording is required.', undefined, 422);
    if (rawBase64.length > MAX_BASE64_LENGTH) {
      return this.error(res, 'The recording is too large. Keep it under 15 MB.', undefined, 413);
    }
    if (rawBase64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(rawBase64)) {
      return this.error(res, 'The audio recording is not valid base64 data.', undefined, 422);
    }

    // Blob MIME types arrive as e.g. "audio/webm;codecs=opus"; only the base type matters.
    const normalizedMime = (typeof mimeType === 'string' ? mimeType : '')
      .split(';')[0]
      .trim()
      .toLowerCase() || 'audio/webm';
    if (!ALLOWED_AUDIO_TYPES.has(normalizedMime)) {
      return this.error(res, 'Unsupported audio format.', undefined, 422);
    }

    try {
      const text = await TranscriptionService.transcribe(rawBase64, normalizedMime);
      return this.success(res, { text }, 'Audio transcribed successfully.');
    } catch (err: any) {
      console.error('Transcription error:', err);
      // Provider errors can include quota, project, and key details; keep them out of responses.
      return this.error(res, 'Transcription is temporarily unavailable. Please try again.', undefined, 503);
    }
  };
}
