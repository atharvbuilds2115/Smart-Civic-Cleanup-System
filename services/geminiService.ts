/**
 * Gemini AI Service for Image Analysis
 * Uses Google's Gemini API to detect AI-generated images and analyze waste
 */

interface GeminiAnalysisResult {
  wasteType: string;
  severityLevel: number;
  confidenceScore: number;
  verificationStatus: string;
  suggestedAction: string;
  isDuplicate?: boolean;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
    if (!this.apiKey) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in .env.local');
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      img.onload = () => {
        const maxSize = 512;
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private autoDetectSeverity(severityLevel: number | undefined, wasteType: string): number {
    let value = Math.max(1, Math.min(10, severityLevel || 5));
    const impactMultiplier: Record<string, number> = {
      plastic: 1.2,
      organic: 0.8,
      metal: 1.1,
      paper: 0.9,
      glass: 1.0,
      mixed: 1.3,
      none: 0.5,
      unknown: 1.0
    };
    value *= impactMultiplier[wasteType] || 1.0;
    return Math.max(1, Math.min(10, Math.round(value)));
  }

  private getSuggestedAction(severityLevel: number, wasteType: string): string {
    if (severityLevel <= 2) return 'Bin is mostly empty - no immediate action needed';
    if (severityLevel <= 5) return 'Moderate waste level - schedule pickup in 1-2 days';
    if (severityLevel <= 7) return 'High waste level - prioritize pickup within 24 hours';
    return 'Critical waste level - immediate action required';
  }

  private fallbackAnalysis(): GeminiAnalysisResult {
    return {
      wasteType: 'unknown',
      severityLevel: 5,
      confidenceScore: 0.5,
      verificationStatus: 'real',
      suggestedAction: 'Manual verification recommended - API unavailable',
      isDuplicate: false
    };
  }

  async analyzeImage(imageFile: File, binId: string): Promise<GeminiAnalysisResult> {
    try {
      const compressedImage = await this.compressImage(imageFile);
      const base64Image = await this.fileToBase64(compressedImage);
      const prompt = `Analyze image and return only valid JSON...`;
      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: compressedImage.type,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 128
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return this.fallbackAnalysis();
      }

      const data = await response.json();
      const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        return this.fallbackAnalysis();
      }

      const jsonMatch = textResponse.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        return this.fallbackAnalysis();
      }

      const analysis = JSON.parse(jsonMatch[0]);
      const severityValue = this.autoDetectSeverity(analysis.severityLevel, analysis.wasteType || 'unknown');

      return {
        wasteType: analysis.wasteType || 'unknown',
        severityLevel: severityValue,
        confidenceScore: Math.max(0, Math.min(1, analysis.confidenceScore || 0.8)),
        verificationStatus: analysis.isAIGenerated ? 'ai_generated' : 'real',
        suggestedAction: analysis.suggestedAction || this.getSuggestedAction(severityValue, analysis.wasteType),
        isDuplicate: analysis.isDuplicate || false
      };
    } catch (err) {
      console.error('Gemini analysis exception:', err);
      return this.fallbackAnalysis();
    }
  }
}

export const geminiService = new GeminiService();
export type { GeminiAnalysisResult };
