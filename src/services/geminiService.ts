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

  /**
   * Convert image file to base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (data:image/jpeg;base64,)
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Analyze image for AI generation and waste content (Optimized for speed)
   */
  async analyzeImage(imageFile: File, binId: string): Promise<GeminiAnalysisResult> {
    try {
      // Compress image for faster processing
      const compressedImage = await this.compressImage(imageFile);
      const base64Image = await this.fileToBase64(compressedImage);

      const prompt = `Analyze this waste bin image and return ONLY valid JSON:

{
  "isAIGenerated": false,
  "wasteType": "plastic|organic|metal|paper|glass|mixed|none",
  "severityLevel": 1-10,
  "confidenceScore": 0.0-1.0,
  "verificationStatus": "real|ai_generated|suspicious",
  "suggestedAction": "brief action needed",
  "isDuplicate": false
}

Rules:
- severityLevel: 1=empty, 2-3=minimal, 4-6=moderate, 7-8=high, 9-10=critical overflow
- Be fast and accurate
- Focus on waste amount and type`;

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
          maxOutputTokens: 256, // Reduced for speed
        }
      };

      // Add timeout for faster response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error('Empty response from API');
      }

      // Fast JSON extraction
      const jsonMatch = textResponse.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        // Fallback analysis for speed
        return this.fallbackAnalysis(imageFile);
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        wasteType: analysis.wasteType || 'unknown',
        severityLevel: this.autoDetectSeverity(analysis.severityLevel, analysis.wasteType),
        confidenceScore: Math.max(0, Math.min(1, analysis.confidenceScore || 0.8)),
        verificationStatus: analysis.isAIGenerated ? 'fake_or_duplicate' : 'real',
        suggestedAction: analysis.suggestedAction || this.getSuggestedAction(analysis.severityLevel, analysis.wasteType),
        isDuplicate: analysis.isDuplicate || false
      };

    } catch (error) {
      console.warn('Gemini analysis failed, using fallback:', error);
      return this.fallbackAnalysis(imageFile);
    }
  }

  /**
   * Compress image for faster API calls
   */
  private async compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Resize to max 512px for speed
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
            resolve(file); // Fallback to original
          }
        }, 'image/jpeg', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Auto-detect severity based on waste type and amount
   */
  private autoDetectSeverity(severityLevel: number, wasteType: string): number {
    let adjustedSeverity = Math.max(1, Math.min(10, severityLevel || 5));

    // Adjust based on waste type environmental impact
    const impactMultiplier: Record<string, number> = {
      'plastic': 1.2,    // High environmental impact
      'organic': 0.8,    // Biodegradable
      'metal': 1.1,      // Recyclable but heavy
      'paper': 0.9,      // Recyclable
      'glass': 1.0,      // Recyclable
      'mixed': 1.3,      // Various impacts
      'none': 0.5,       // No waste
      'unknown': 1.0     // Default
    };

    adjustedSeverity *= impactMultiplier[wasteType] || 1.0;
    return Math.max(1, Math.min(10, Math.round(adjustedSeverity)));
  }

  /**
   * Get suggested action based on severity and waste type
   */
  private getSuggestedAction(severityLevel: number, wasteType: string): string {
    if (severityLevel <= 2) return "Bin is mostly empty - no immediate action needed";
    if (severityLevel <= 5) return "Moderate waste level - schedule pickup within 1-2 days";
    if (severityLevel <= 7) return "High waste level - prioritize pickup within 24 hours";
    return "Critical waste level - immediate attention required for overflow prevention";
  }

  /**
   * Fallback analysis when API fails
   */
  private fallbackAnalysis(imageFile: File): GeminiAnalysisResult {
    return {
      wasteType: 'unknown',
      severityLevel: 5,
      confidenceScore: 0.5,
      verificationStatus: 'real',
      suggestedAction: 'Manual verification recommended - API temporarily unavailable',
      isDuplicate: false
    };
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export type { GeminiAnalysisResult };
