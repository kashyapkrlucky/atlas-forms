import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { Logo } from "@/shared/ui/Logo";
import useAuthStore from "@/features/auth/store/useAuthStore";
import Image from "next/image";
import { getDisplayName, getInitials } from "@/shared/utils";
import { toast } from "sonner";
import { CircleUserRoundIcon, LogInIcon, LogOutIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEXT_CONTINUE_AS_GUEST, TEXT_SIGN_IN_WITH_ATLAS_ID } from "@/features/auth/constants";

export function TopNav() {

  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isAtlasRedirecting, setIsAtlasRedirecting] = useState(false);

  const {
    onGuestLogin,
    isGuestLoading,
  } = useAuthStore();

  const handleGuestLogin = async () => {
    const token = await onGuestLogin();
    if (token) {
      router.push("/");
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
    toast.success("Signed out.");
  };
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="text-[15px] font-semibold text-slate-800">Atlas Forms</span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            How it works
          </a>
          <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            Dashboard
          </Link>
        </nav>

        {
          user ? (
            <div className="flex items-center gap-4">
              {user && user.avatar ? (
                <div className="relative">
                  <Image
                    src={user.avatar}
                    alt="User avatar"
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-md ring-1 ring-neutral-200 transition-all duration-200 group-hover:ring-neutral-300"
                  />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-950 text-sm font-semibold text-white ring-1 ring-neutral-200 transition-all duration-200">
                  {getInitials(user)}
                </div>
              )}

              <p className="text-sm font-medium text-slate-700">{getDisplayName(user)}</p>
              <button
                onClick={handleLogout}
                role="menuitem"
                title="Sign out"
              >
                <LogOutIcon className="mr-3 h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button
                disabled={isGuestLoading}
                loading={isGuestLoading}
                onClick={onAtlasLogin}
              >
                <span className="flex items-center justify-center gap-2">
                  <LogInIcon />
                  {TEXT_SIGN_IN_WITH_ATLAS_ID}
                </span>
              </Button>
              <Button
                disabled={isAtlasRedirecting}
                loading={isAtlasRedirecting}
                variant="outline"
                onClick={handleGuestLogin}
              >
                <span className="flex items-center justify-center gap-2">
                  <CircleUserRoundIcon className="h-4 w-4" />
                  {TEXT_CONTINUE_AS_GUEST}
                </span>
              </Button>
            </div>
          )
        }
      </div>
    </header>
  );
}
