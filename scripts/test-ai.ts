import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Force load .env.local
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
const API_KEY = envConfig.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;

console.log('🔑 Testing API Key:', API_KEY ? 'Present (starts with ' + API_KEY.substring(0, 8) + '...)' : 'MISSING');

async function testConnection() {
    if (!API_KEY) {
        console.error('❌ Error: GOOGLE_AI_API_KEY not found in .env.local');
        return;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);

    console.log('📡 Testing raw REST API connection...');

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('❌ REST API Failed:', response.status, response.statusText);
            console.error('Error Body:', JSON.stringify(data, null, 2));
            return;
        }

        console.log('✅ REST API Success! Available Models:');
        if (data.models) {
            const names = data.models.map((m: any) => m.name);
            console.log(JSON.stringify(names, null, 2));
        } else {
            console.log('⚠️ No models found in response.');
        }

    } catch (error: any) {
        console.error('❌ Network Error:', error.message);
    }
}

testConnection();
