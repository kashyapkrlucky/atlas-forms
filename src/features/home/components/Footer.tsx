import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Logo } from "@/shared/ui/Logo";

export function Footer() {
  return (
    <footer className="px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-lg border border-slate-200 bg-white px-8 py-14 text-center shadow-xs">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Ready to build your first form?
        </h2>
        <p className="mt-3 max-w-md text-[15px] text-slate-500">
          No sign-up flow to fight through — jump straight into the dashboard and start building.
        </p>
        <Button variant="primary" size="lg" className="mt-7" asChild>
          <Link href="/dashboard">
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo size={24} />
          <span className="text-sm font-medium text-slate-600">Atlas Forms</span>
        </div>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Atlas Forms. Forms, built your way.</p>
      </div>
    </footer>
  );
}
