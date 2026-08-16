"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import useAuthStore from "@/features/auth/store/useAuthStore";

export function Providers({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <>
            {children}
            <Toaster position="bottom-right" richColors closeButton />
        </>
    );
}
