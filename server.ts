import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rate limiter for audio transcription to safeguard Gemini API usage
const transcribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 30, // Max 30 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many transcription requests from this IP. Please try again in a few minutes.'
  }
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // Audio transcription endpoint with gemini-3.5-transcribe, rate-limited and route-specific 25mb body limit
  app.post('/api/transcribe', transcribeLimiter, express.json({ limit: '25mb' }), async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'No audio data provided' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Strip data URL header if present
      const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'audio/webm',
            },
          },
          {
            text: 'Transcribe this audio recording accurately verbatim. Return only the transcribed speech with proper punctuation.',
          },
        ],
      });

      const transcription = response.text || '';
      return res.json({ text: transcription.trim() });
    } catch (error: any) {
      console.error('Transcription error:', error);
      return res.status(500).json({
        error: error?.message || 'Failed to transcribe audio recording',
      });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use((_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
