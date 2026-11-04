import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  app.post('/api/extract-voice-note', async (req, res) => {
    const { transcript, mode = 'nurse' } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(503).json({
        error: 'Voice processing unavailable — enter manually',
        fallbackReason: 'missing_api_key',
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      if (mode === 'emergency') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Extract structured clinical emergency intake fields from the following paramedic/emergency clinician voice transcript. Do not diagnose or prescribe; only structure what was stated.\n\nTranscript: "${transcript}"`,
          config: {
            systemInstruction:
              'You are a clinical documentation structuring assistant for CareBridge. Extract only explicitly stated vital signs, symptoms, onset, oxygen delivery, mental status, and required hospital capabilities. Never invent diagnoses or treatment orders.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                patientSummary: {
                  type: Type.STRING,
                  description: 'Brief summary of patient demographics and mechanism/presentation.',
                },
                temperature: {
                  type: Type.STRING,
                  description: 'Body temperature with unit, e.g. 37.8°C',
                },
                pulse: {
                  type: Type.STRING,
                  description: 'Heart rate / pulse with unit, e.g. 112 bpm',
                },
                respiratoryRate: {
                  type: Type.STRING,
                  description: 'Respiratory rate with unit, e.g. 28 /min',
                },
                spO2: {
                  type: Type.STRING,
                  description: 'Oxygen saturation percentage, e.g. 90%',
                },
                bp: {
                  type: Type.STRING,
                  description: 'Blood pressure, e.g. 104/68',
                },
                oxygenSource: {
                  type: Type.STRING,
                  description: 'Oxygen source and flow rate, e.g. NRM 15L/min or Room air',
                },
                mentalStatus: {
                  type: Type.STRING,
                  description: 'Mental status / GCS / alertness, e.g. Alert, anxious, GCS 14',
                },
                reportedSymptom: {
                  type: Type.STRING,
                  description: 'Primary reported symptoms and physical findings',
                },
                onset: {
                  type: Type.STRING,
                  description: 'Time of onset, e.g. ~45 minutes ago',
                },
                requiredO2: {
                  type: Type.BOOLEAN,
                  description: 'True if patient requires supplemental or high-flow oxygen',
                },
                requiredSpecialty: {
                  type: Type.STRING,
                  description: 'Required specialty, e.g. Thoracic Surgery, Trauma Surgery, Cardiology, General Medicine',
                },
                requiredEquipment: {
                  type: Type.STRING,
                  description: 'Required specialized equipment, e.g. Chest Drain / Pleural Decompression, CT Scanner, Mechanical Ventilator',
                },
                requiredICU: {
                  type: Type.BOOLEAN,
                  description: 'True if patient requires ICU or High-Dependency Unit (HDU) monitoring',
                },
              },
              required: [
                'temperature',
                'pulse',
                'respiratoryRate',
                'spO2',
                'oxygenSource',
                'mentalStatus',
                'reportedSymptom',
                'onset',
              ],
            },
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error('Empty response from Gemini');
        }
        return res.json({ structured: JSON.parse(text.trim()), source: 'gemini' });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Extract structured nursing observation fields from the following voice transcript. Do not diagnose or prescribe; only structure the stated clinical observations.\n\nTranscript: "${transcript}"`,
        config: {
          systemInstruction:
            'You are a clinical nursing documentation assistant for CareBridge. Extract vital signs and clinical observations accurately into the requested JSON schema. Format units cleanly (e.g., "37.8°C", "98 bpm", "26 /min", "93%", "NRM 4L/min"). If a value is not mentioned, return "Not recorded". Never diagnose or prescribe.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temperature: {
                type: Type.STRING,
                description: 'Temperature with °C, e.g. 37.8°C',
              },
              pulse: {
                type: Type.STRING,
                description: 'Pulse / heart rate with bpm, e.g. 98 bpm',
              },
              respiratoryRate: {
                type: Type.STRING,
                description: 'Respiratory rate with /min, e.g. 26 /min',
              },
              spO2: {
                type: Type.STRING,
                description: 'Oxygen saturation with %, e.g. 93%',
              },
              bp: {
                type: Type.STRING,
                description: 'Blood pressure if stated, e.g. 113/72',
              },
              oxygenSource: {
                type: Type.STRING,
                description: 'Oxygen delivery device and flow rate, e.g. NRM 4L/min',
              },
              mentalStatus: {
                type: Type.STRING,
                description: 'Patient mental status and alertness, e.g. Anxious, alert & oriented',
              },
              reportedSymptom: {
                type: Type.STRING,
                description: 'Symptoms or physical findings reported, e.g. Increased chest pain, worse on inspiration',
              },
              onset: {
                type: Type.STRING,
                description: 'Onset timing of symptoms, e.g. ~30 minutes ago',
              },
            },
            required: [
              'temperature',
              'pulse',
              'respiratoryRate',
              'spO2',
              'oxygenSource',
              'mentalStatus',
              'reportedSymptom',
              'onset',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      return res.json({
        structured: JSON.parse(text.trim()),
        source: 'gemini',
      });
    } catch (error: any) {
      console.error('Gemini voice structuring error:', error?.message || error);
      return res.status(503).json({
        error: 'Voice processing unavailable — enter manually',
        details: error?.message || 'Service error',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareBridge server running on http://localhost:${PORT}`);
  });
}

startServer();
