import Shell from "@/components/layout/Shell";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
    return <Shell>{children}</Shell>;
}
