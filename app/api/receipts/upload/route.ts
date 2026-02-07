import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadReceiptFile } from '@/lib/services/uploadService';
import { createReceipt } from '@/lib/services/receiptService';
import { extractReceiptData } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 400 }
            );
        }

        // Upload file to storage
        const uploadResult = await uploadReceiptFile(file, user.id, file.name);

        // Extract data from receipt using AI
        let extractedData = {};
        let extractionStatus = 'pending';

        try {
            console.log('🤖 Starting AI extraction for:', file.name, file.type);
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            extractedData = await extractReceiptData(buffer, file.type);

            if (Object.keys(extractedData).length > 0) {
                console.log('✅ AI extraction successful:', extractedData);
                extractionStatus = 'completed';
            } else {
                console.log('⚠️ AI extraction returned empty data');
                extractionStatus = 'failed';
            }
        } catch (extractError: any) {
            console.error('❌ AI extraction error:', extractError.message);
            extractionStatus = 'failed';
        }

        // Create receipt record in database
        const receipt = await createReceipt({
            userId: user.id,
            filePath: uploadResult.path,
            fileUrl: uploadResult.url,
            extractedData
        });

        return NextResponse.json({
            receipt,
            extractionStatus,
            message: extractionStatus === 'failed'
                ? 'Receipt uploaded successfully, but AI extraction failed. You can edit details manually.'
                : 'Receipt uploaded and processed successfully!',
            extractedData: extractionStatus === 'completed' ? extractedData : null
        }, { status: 201 });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
