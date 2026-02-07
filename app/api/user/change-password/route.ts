import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { oldPassword, newPassword } = body;

        // Validate inputs
        if (!oldPassword) {
            return NextResponse.json(
                { error: "Old password is required for verification" },
                { status: 400 }
            );
        }

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { error: "New password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // CRITICAL SECURITY: Verify old password before allowing change
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email!,
            password: oldPassword,
        });

        if (signInError || !signInData.user) {
            return NextResponse.json(
                { error: "Current password is incorrect" },
                { status: 401 }
            );
        }

        // Old password verified, now update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            console.error("Error updating password:", updateError);
            return NextResponse.json(
                { error: updateError.message || "Failed to update password" },
                { status: 500 }
            );
        }

        // Success! Password changed
        return NextResponse.json(
            { message: "Password updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Unexpected error during password change:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
