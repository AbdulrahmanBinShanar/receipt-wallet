
const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const API_KEY = (process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || '').trim();

if (!API_KEY) {
    console.error('API Key is missing');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log('MODELS:');
                json.models.forEach(m => {
                    // Only show models that support content generation
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                        console.log(m.name.replace('models/', ''));
                    }
                });
            } else {
                console.log('ERROR:', JSON.stringify(json));
            }
        } catch (e) {
            console.error('PARSE_ERROR');
        }
    });
});
