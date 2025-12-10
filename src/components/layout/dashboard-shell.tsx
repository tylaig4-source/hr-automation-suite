"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div
            className={cn(
                "transition-all duration-300 ease-in-out w-full",
                isCollapsed ? "lg:pl-20" : "lg:pl-64"
            )}
        >
            {children}
        </div>
    );
}
