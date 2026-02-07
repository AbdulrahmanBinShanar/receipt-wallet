import Tesseract from 'tesseract.js';

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
    rawText?: string;
}

/**
 * Extract text from receipt image using Tesseract OCR
 */
export async function extractReceiptText(imageBuffer: Buffer): Promise<string> {
    try {
        console.log('🔍 Starting OCR text extraction...');

        const { data: { text } } = await Tesseract.recognize(
            imageBuffer,
            'eng', // Start with just English for now
            {
                workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
                langPath: 'https://tessdata.projectnaptha.com/4.0.0',
                corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js',
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            }
        );

        console.log('✅ OCR extraction completed');
        console.log('📄 Extracted text length:', text.length, 'characters');

        return text.trim();
    } catch (error) {
        console.error('❌ OCR extraction failed:', error);
        throw error;
    }
}

/**
 * Parse extracted text to find receipt data
 * This is a simple parser - you can enhance it based on your receipt formats
 */
export async function extractReceiptData(
    imageBuffer: Buffer
): Promise<ExtractedReceiptData> {
    try {
        const rawText = await extractReceiptText(imageBuffer);

        // Simple parsing logic
        const extracted: ExtractedReceiptData = {
            rawText
        };

        // Try to find total amount (looks for patterns like "Total: 150.00" or "المجموع: 150.00")
        const totalPatterns = [
            /total[:\s]+([0-9,.]+)/i,
            /المجموع[:\s]+([0-9,.]+)/,
            /sum[:\s]+([0-9,.]+)/i,
            /amount[:\s]+([0-9,.]+)/i
        ];

        for (const pattern of totalPatterns) {
            const match = rawText.match(pattern);
            if (match) {
                const totalStr = match[1].replace(/,/g, '');
                extracted.total = parseFloat(totalStr);
                break;
            }
        }

        // Try to find currency (SAR, USD, etc.)
        const currencyMatch = rawText.match(/\b(SAR|USD|EUR|AED|QAR|KWD|BHD|OMR|ريال|درهم)\b/i);
        if (currencyMatch) {
            extracted.currency = currencyMatch[1].includes('ريال') ? 'SAR' : currencyMatch[1];
        } else {
            extracted.currency = 'SAR'; // Default to SAR
        }

        // Try to find date (various formats)
        const datePatterns = [
            /(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/,
            /(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/,
            /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i
        ];

        for (const pattern of datePatterns) {
            const match = rawText.match(pattern);
            if (match) {
                try {
                    const dateStr = match[1];
                    const parsedDate = new Date(dateStr);
                    if (!isNaN(parsedDate.getTime())) {
                        extracted.date = parsedDate.toISOString().split('T')[0];
                        break;
                    }
                } catch (e) {
                    // Invalid date, continue
                }
            }
        }

        // Try to find merchant name (usually at the top)
        const lines = rawText.split('\n').filter(line => line.trim().length > 0);
        if (lines.length > 0) {
            // Take first meaningful line as merchant
            const firstLine = lines[0].trim();
            if (firstLine.length > 2 && firstLine.length < 50) {
                extracted.merchant = firstLine;
            }
        }

        // Try to detect category based on keywords
        const categories = [
            { keywords: ['grocery', 'supermarket', 'food', 'بقالة'], category: 'groceries' },
            { keywords: ['electronics', 'tech', 'computer', 'إلكترونيات'], category: 'electronics' },
            { keywords: ['pharmacy', 'medicine', 'صيدلية'], category: 'pharmacy' },
            { keywords: ['restaurant', 'cafe', 'coffee', 'مطعم', 'مقهى'], category: 'restaurant' },
            { keywords: ['gas', 'petrol', 'fuel', 'وقود', 'بنزين'], category: 'fuel' },
            { keywords: ['clothing', 'fashion', 'apparel', 'ملابس'], category: 'clothing' }
        ];

        const lowerText = rawText.toLowerCase();
        for (const { keywords, category } of categories) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                extracted.category = category;
                break;
            }
        }

        console.log('📊 Parsed data:', {
            merchant: extracted.merchant,
            total: extracted.total,
            currency: extracted.currency,
            date: extracted.date,
            category: extracted.category,
            textLength: rawText.length
        });

        return extracted;
    } catch (error) {
        console.error('❌ Error parsing receipt data:', error);
        return { rawText: '' };
    }
}
