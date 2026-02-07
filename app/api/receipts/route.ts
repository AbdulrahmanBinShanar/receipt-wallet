import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getReceipts } from '@/lib/services/receiptService';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query params for filters
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || undefined;
        const category = searchParams.get('category') || undefined;
        const status = searchParams.get('status') as 'active' | 'archived' | undefined;

        const receipts = await getReceipts(user.id, {
            search,
            category,
            status: status || 'active'
        });

        return NextResponse.json({ receipts });
    } catch (error: any) {
        console.error('Fetch receipts error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch receipts' },
            { status: 500 }
        );
    }
}
