import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High payload limit for high-res images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    model: 'gemini-3.8-flash',
  });
});

interface SheetData {
  name: string;
  columns: string[];
  rows: string[][];
}

interface ExtractRequestBody {
  image: string; // base64 or data URL
  mimeType?: string;
  mode?: 'standard' | 'receipt' | 'financial' | 'multi_section';
  customInstructions?: string;
}

// Extraction API
app.post('/api/extract', async (req: Request<{}, {}, ExtractRequestBody>, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      res.status(500).json({
        error: 'Missing GEMINI_API_KEY',
        message: 'Gemini API key is not configured. Please ensure GEMINI_API_KEY is configured in Settings > Secrets.',
      });
      return;
    }

    const { image, mimeType = 'image/png', mode = 'standard', customInstructions = '' } = req.body;

    if (!image) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'No image data provided. Please upload a valid image file.',
      });
      return;
    }

    // Extract raw base64 data if it's a data URL
    let base64Data = image;
    let detectedMime = mimeType;
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        detectedMime = matches[1];
        base64Data = matches[2];
      } else {
        const commaIndex = image.indexOf(',');
        if (commaIndex !== -1) {
          base64Data = image.slice(commaIndex + 1);
        }
      }
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let extraContext = '';
    if (mode === 'receipt') {
      extraContext = 'Focus on itemized charges, quantities, unit prices, discounts, subtotal, tax rates, tip, and grand total. Group metadata (vendor, date, invoice number) into a top summary section or separate sheet.';
    } else if (mode === 'financial') {
      extraContext = 'Focus on strict tabular alignment of financial statements, balance sheets, profit & loss tables, ensuring line item descriptions and monetary columns (debit/credit, currency) are strictly mapped.';
    } else if (mode === 'multi_section') {
      extraContext = 'Separate every independent table, grid, or distinct section into its own separate sheet with an intuitive, distinct title.';
    }

    if (customInstructions && customInstructions.trim()) {
      extraContext += ` Additional user instruction: ${customInstructions.trim()}`;
    }

    const promptText = `Analyze this image thoroughly and extract all tabular data, tables, invoices, spreadsheets, or structured column/row data.
${extraContext}

Extraction Guidelines:
1. Detect all columns, headers, and rows with maximum fidelity.
2. If multiple distinct tables or sections exist, split them into separate sheets with concise descriptive names (<= 31 characters, no special characters like : ? * [ ] / \\).
3. If it is a single table, provide 1 sheet (e.g. "Table Data", "Summary", or "Invoice Items").
4. Preserve exact values, currencies, numbers, dates, SKU codes, and text.
5. If a cell in a row is empty or blank, provide an empty string "".
6. Ensure each row has the exact same count of items as the sheet's "columns" array.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: detectedMime,
                data: base64Data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        systemInstruction: 'You are an expert document OCR and table-to-spreadsheet AI. Accurately transform images of tables, invoices, receipts, and documents into structured Excel spreadsheet sheets.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sheets: {
              type: Type.ARRAY,
              description: 'List of extracted sheets/tables',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: 'Sheet name or section title (<= 30 chars)',
                  },
                  columns: {
                    type: Type.ARRAY,
                    description: 'Column header titles',
                    items: {
                      type: Type.STRING,
                    },
                  },
                  rows: {
                    type: Type.ARRAY,
                    description: 'Rows of data matching columns',
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.STRING,
                      },
                    },
                  },
                },
                required: ['name', 'columns', 'rows'],
              },
            },
            detectedTableCount: {
              type: Type.INTEGER,
              description: 'Number of detected tables or sections',
            },
            notes: {
              type: Type.STRING,
              description: 'Brief quality observations or notes about the document clarity',
            },
          },
          required: ['sheets'],
        },
      },
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response received from AI model');
    }

    let parsedResult: { sheets: SheetData[]; detectedTableCount?: number; notes?: string };
    try {
      parsedResult = JSON.parse(rawText);
    } catch {
      // In case of markdown formatting
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanJson);
    }

    if (!parsedResult.sheets || !Array.isArray(parsedResult.sheets) || parsedResult.sheets.length === 0) {
      throw new Error('No tabular data could be detected in the provided image. Please check the image clarity or try another image.');
    }

    // Clean and normalize sheet data
    const sanitizedSheets: SheetData[] = parsedResult.sheets.map((sheet, sIdx) => {
      // Clean sheet name (Excel limits sheet names to 31 chars and bans : \ / ? * [ ])
      let sheetName = (sheet.name || `Sheet${sIdx + 1}`)
        .replace(/[:\\/?*\[\]]/g, ' ')
        .trim();
      if (!sheetName) sheetName = `Sheet${sIdx + 1}`;
      if (sheetName.length > 30) sheetName = sheetName.substring(0, 30).trim();

      const columns = Array.isArray(sheet.columns) && sheet.columns.length > 0
        ? sheet.columns.map((c, i) => String(c || `Column ${i + 1}`).trim())
        : ['Column 1'];

      const colCount = columns.length;
      const rows = Array.isArray(sheet.rows)
        ? sheet.rows.map(row => {
            if (!Array.isArray(row)) return new Array(colCount).fill('');
            const normalizedRow = row.map(cell => (cell === null || cell === undefined ? '' : String(cell)));
            // Ensure row length matches column length
            if (normalizedRow.length < colCount) {
              return normalizedRow.concat(new Array(colCount - normalizedRow.length).fill(''));
            }
            return normalizedRow.slice(0, colCount);
          })
        : [];

      return {
        name: sheetName,
        columns,
        rows,
      };
    });

    res.json({
      success: true,
      sheets: sanitizedSheets,
      detectedTableCount: parsedResult.detectedTableCount || sanitizedSheets.length,
      notes: parsedResult.notes || '',
    });
  } catch (error: any) {
    console.error('Error during extraction:', error);
    const errorMessage = error?.message || 'An error occurred while processing the image with Gemini.';
    res.status(500).json({
      error: 'Extraction Failed',
      message: errorMessage,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Image to Excel Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
