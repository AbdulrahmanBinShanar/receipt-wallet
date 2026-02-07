import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
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

        if (!user.email) {
            return NextResponse.json(
                { error: "No email associated with this account" },
                { status: 400 }
            );
        }

        // Send password reset email via Supabase
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            user.email,
            {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/app/reset-password/confirm`,
            }
        );

        if (resetError) {
            console.error("Error sending reset email:", resetError);
            return NextResponse.json(
                { error: "Failed to send reset email" },
                { status: 500 }
            );
        }

        // Don't reveal whether email exists or not for security
        return NextResponse.json(
            { message: "If an account with that email exists, a reset link has been sent" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Unexpected error during password reset request:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
