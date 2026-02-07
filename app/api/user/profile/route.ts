import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get user preferences
        const { data: preferences } = await supabase
            .from("preferences")
            .select("*")
            .eq("user_id", user.id)
            .single();

        // Get receipt statistics
        const { data: receipts } = await supabase
            .from("receipts")
            .select("total, created_at")
            .eq("user_id", user.id);

        const totalReceipts = receipts?.length || 0;
        const totalSpending = receipts?.reduce((sum, r) => sum + (r.total || 0), 0) || 0;

        // Get reminders count
        const { count: remindersCount } = await supabase
            .from("reminders")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        // Calculate account age
        const accountCreatedAt = new Date(user.created_at);
        const accountAgeDays = Math.floor(
            (Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at,
                last_sign_in_at: user.last_sign_in_at,
            },
            preferences: preferences || {},
            stats: {
                totalReceipts,
                totalSpending,
                remindersCount: remindersCount || 0,
                accountAgeDays,
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch user profile" },
            { status: 500 }
        );
    }
}
