"use client"
import { ACCESS_TOKEN_KEY, TEXT_CONTINUE_AS_GUEST, TEXT_SIGN_IN_WITH_ATLAS_ID, USER_KEY } from "@/features/auth/constants";
import useAuthStore from "@/features/auth/store/useAuthStore";
import { Button } from "@/shared/ui/Button";
import { CircleUserRoundIcon, LogInIcon, LogOutIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { cn, getDisplayName, getInitials } from "@/shared/utils";

interface UserMenuProps {
    variant?: "topbar" | "sidebar";
}

export function UserMenu({ variant = "topbar" }: UserMenuProps) {
    const router = useRouter();
    const { user, logout, onGuestLogin, isGuestLoading } = useAuthStore();
    const [isAtlasRedirecting, setIsAtlasRedirecting] = useState(false);

    const handleGuestLogin = async () => {
        const token = await onGuestLogin();
        if (token) {
            router.push("/dashboard");
        } else {
            toast.error(
                useAuthStore.getState().error ||
                "Failed to login as guest. Please try again.",
            );
        }
    };
    const onAtlasLogin = () => {
        setIsAtlasRedirecting(true);
        window.location.href = `${process.env.NEXT_PUBLIC_AUTH_URL}/login?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}`;
    };
    const handleLogout = () => {
        logout();
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        toast.success("Signed out.");
        router.push("/");
    };

    if (!user) {
        const isSidebar = variant === "sidebar";
        return (
            <div className={cn("flex items-center gap-2", isSidebar && "flex-col items-stretch")}>
                <Button
                    size="sm"
                    disabled={isAtlasRedirecting}
                    loading={isAtlasRedirecting}
                    onClick={onAtlasLogin}
                    className={isSidebar ? "w-full" : undefined}
                >
                    <span className="flex items-center justify-center gap-1.5">
                        <LogInIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className={cn(!isSidebar && "hidden sm:inline")}>{TEXT_SIGN_IN_WITH_ATLAS_ID}</span>
                    </span>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isGuestLoading}
                    loading={isGuestLoading}
                    onClick={handleGuestLogin}
                    className={isSidebar ? "w-full" : undefined}
                >
                    <span className="flex items-center justify-center gap-1.5">
                        <CircleUserRoundIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className={cn(!isSidebar && "hidden sm:inline")}>{TEXT_CONTINUE_AS_GUEST}</span>
                    </span>
                </Button>
            </div>
        );
    }

    const isSidebar = variant === "sidebar";

    return (
        <div
            className={cn(
                "group flex min-w-0 items-center gap-2.5 rounded-lg transition-colors",
                isSidebar && "-m-1.5 p-1.5 hover:bg-slate-100/80"
            )}
        >
            {user.avatar ? (
                <Image
                    src={user.avatar}
                    alt="User avatar"
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-md object-cover ring-1 ring-neutral-200 transition-all duration-200 group-hover:ring-neutral-300"
                />
            ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-950 text-sm font-semibold text-white ring-1 ring-neutral-200 transition-all duration-200">
                    {getInitials(user)}
                </div>
            )}

            <p
                className={cn(
                    "min-w-0 flex-1 truncate text-sm font-medium text-slate-700",
                    !isSidebar && "hidden max-w-40 sm:block md:max-w-55"
                )}
            >
                {getDisplayName(user)}
            </p>

            <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1"
            >
                <LogOutIcon className="h-4 w-4" />
            </button>
        </div>
    );
}
