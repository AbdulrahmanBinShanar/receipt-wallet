import { createClient } from '@/lib/supabase/server';

export interface UploadResult {
    path: string;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadReceiptFile(
    file: File | Buffer,
    userId: string,
    fileName?: string
): Promise<UploadResult> {
    const supabase = await createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = fileName ? fileName.split('.').pop() : 'jpg';
    const uniqueFileName = `${timestamp}_${randomStr}.${ext}`;

    // Path structure: userId/uniqueFileName
    const filePath = `${userId}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, {
            contentType: file instanceof File ? file.type : 'image/jpeg',
            upsert: false
        });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

    return {
        path: data.path,
        url: publicUrl,
        fileName: uniqueFileName,
        fileSize: file instanceof File ? file.size : file.length,
        mimeType: file instanceof File ? file.type : 'image/jpeg'
    };
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteReceiptFile(filePath: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.storage
        .from('receipts')
        .remove([filePath]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

/**
 * Get signed URL for private file access
 */
export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, expiresIn);

    if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
}
