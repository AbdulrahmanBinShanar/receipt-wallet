import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = (process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '').trim();

const genAI = new GoogleGenerativeAI(API_KEY);

const MODELS_TO_TRY = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
];

export interface ExtractedReceiptData {
    merchant?: string;
    date?: string;
    total?: number;
    currency?: string;
    items?: Array<{
        name: string;
        quantity?: number;
        price?: number;
    }>;
    category?: string;
    warrantyMonths?: number;
    taxAmount?: number;
    paymentMethod?: string;
}

/**
 * Helper function to call Gemini with fallback logic for 429 errors
 */
async function callGeminiWithFallback(
    prompt: string,
    imagePart: any,
    taskName: string = 'extraction'
): Promise<string> {
    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`📡 Calling Gemini (${modelName}) for ${taskName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });

            // For the primary model, we might want to retry a few times before switching
            // But for simplicity and speed, we'll try once per model for now, 
            // or we could add a small retry loop for the primary model specifically.
            // Let's stick to a simple fallback strategy: Try Primary -> 429? -> Try Fallback.

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            return response.text();

        } catch (error: any) {
            const isQuotaError = error.status === 429 || error.message?.includes('429') || error.message?.includes('quota');
            const isNotFoundError = error.status === 404 || error.message?.includes('404') || error.message?.includes('not found');

            if (isQuotaError || isNotFoundError) {
                console.warn(`⚠️ ${isQuotaError ? 'Quota limit hit' : 'Model not found'} for ${modelName}.`);
                if (modelName === MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
                    console.error('❌ All models exhausted quota or unavailable.');
                    throw error;
                }
                console.log(`🔄 Switching to next fallback model...`);
                continue;
            }

            throw error;
        }
    }
    throw new Error('Unexpected end of model loop');
}


/**
 * Extract structured data from receipt image using Gemini AI
 */
export async function extractReceiptData(
    imageData: string | Buffer,
    mimeType: string
): Promise<ExtractedReceiptData> {
    if (!API_KEY) {
        throw new Error('API Key is missing. Please set GOOGLE_AI_API_KEY.');
    }

    try {
        console.log('📄 Image type:', mimeType, 'Size:', imageData.length, 'bytes');

        const prompt = `Extract data from this receipt image into clean JSON.
        
        Required fields:
        - merchant: string (store name)
        - date: string (YYYY-MM-DD)
        - total: number (final amount)
        - currency: string (e.g. SAR, USD)
        - category: string (one of: groceries, electronics, restaurant, fuel, clothing, medical, other)
        - items: array of {name, price, quantity}
        
        If a field is not found, exclude it or set null. Return ONLY raw JSON (no markdown).`;

        const imagePart = {
            inlineData: {
                data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
                mimeType
            }
        };

        const text = await callGeminiWithFallback(prompt, imagePart, 'Receipt Data Extraction');

        console.log('📥 Received response from Gemini');
        // console.log('📝 Response text:', text.substring(0, 200) + '...');

        // Clean cleanup markdown if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('❌ No JSON found in response. Full response:', text);
            return {};
        }

        const extracted = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON:', extracted);
        return extracted;
    } catch (error: any) {
        console.error('❌ Gemini API Error Details:');
        console.error('  Message:', error.message);
        console.error('  Status:', error.status);
        // console.error('  Full error:', JSON.stringify(error, null, 2));
        return {};
    }
}

/**
 * Extract text from receipt using OCR
 */
export async function extractReceiptText(
    imageData: string | Buffer,
    mimeType: string
): Promise<string> {
    if (!API_KEY) {
        throw new Error('API Key is missing. Please set GOOGLE_AI_API_KEY.');
    }

    try {
        const prompt = 'Extract all text from this receipt image. Return only the raw text.';

        const imagePart = {
            inlineData: {
                data: typeof imageData === 'string' ? imageData : imageData.toString('base64'),
                mimeType
            }
        };

        const text = await callGeminiWithFallback(prompt, imagePart, 'OCR Extraction');
        return text;
    } catch (error) {
        console.error('Error extracting text:', error);
        return '';
    }
}
