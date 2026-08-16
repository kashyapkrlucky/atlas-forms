import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { UserMenu } from "./UserMenu";

export function TopNav() {
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

        <UserMenu variant="topbar" />
      </div>
    </header>
  );
}
