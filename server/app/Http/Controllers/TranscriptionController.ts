import { Request, Response } from 'express';
import { Controller } from './Controller';
import { TranscriptionService } from '../../Services/TranscriptionService';

export class TranscriptionController extends Controller {
  /**
   * Transcribe audio data using Gemini 3.5 Transcribe (POST /api/transcribe)
   */
  public transcribe = async (req: Request, res: Response) => {
    try {
      const { audioBase64, mimeType } = req.body;
      const text = await TranscriptionService.transcribe(audioBase64, mimeType);
      return this.success(res, { text }, 'Audio transcribed successfully.');
    } catch (err: any) {
      console.error('Transcription error:', err);
      return this.error(res, err.message || 'Failed to transcribe audio recording', undefined, 500);
    }
  };
}
