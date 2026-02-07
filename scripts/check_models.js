
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = (process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '').trim();

if (!API_KEY) {
    console.error('API Key is missing');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function main() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct "listModels" on the instance in some versions, but let's try the generic way if possible 
        // or just try to invoke a simple call on potential candidates.

        // Actually, listing models requires using the ModelService or simply trying known ones.
        // The SDK usually exposes it via `getGenerativeModel` but doesn't always have a list method in the high-level import easily.
        // Let's try to just test a few known model names.

        const candidates = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-001',
            'gemini-1.5-flash-002',
            'gemini-1.5-pro',
            'gemini-1.5-pro-001',
            'gemini-1.0-pro', // text only usually?
            'gemini-pro',
            'gemini-pro-vision' // deprecated
        ];

        console.log('Testing model availability...');

        const base64Image = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg'
            }
        };

        for (const name of candidates) {
            process.stdout.write(`Testing ${name}... `);
            try {
                const m = genAI.getGenerativeModel({ model: name });
                // We must actually generate content to check if it 404s
                await m.generateContent(['test', imagePart]);
                console.log('✅ OK');
            } catch (e) {
                if (e.message.includes('404') || e.message.includes('not found')) {
                    console.log('❌ 404 Not Found');
                } else if (e.message.includes('429')) {
                    console.log('⚠️ 429 Quota Exceeded (but model exists)');
                } else {
                    console.log(`❌ Error: ${e.message.split('\n')[0]}`);
                }
            }
        }

    } catch (e) {
        console.error('Fatal:', e);
    }
}

main();
