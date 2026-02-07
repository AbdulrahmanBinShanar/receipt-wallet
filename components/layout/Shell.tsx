import { ReactNode } from "react";
import Navbar from "@/components/ui/Navbar";

export default function Shell({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar variant="app" />
            <main className="w-full">
                {children}
            </main>
        </div>
    );
}
