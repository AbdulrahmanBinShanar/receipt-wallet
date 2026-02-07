import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateReceipt, deleteReceipt, getReceiptById } from '@/lib/services/receiptService';
import { deleteReceiptFile } from '@/lib/services/uploadService';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await request.json();

        const receipt = await updateReceipt(id, user.id, updates);

        return NextResponse.json({ receipt });
    } catch (error: any) {
        console.error('Update receipt error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update receipt' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get receipt to get file path
        const receipt = await getReceiptById(id, user.id);
        if (!receipt) {
            return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
        }

        // Delete from storage
        await deleteReceiptFile(receipt.file_path);

        // Delete from database
        await deleteReceipt(id, user.id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete receipt error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete receipt' },
            { status: 500 }
        );
    }
}
