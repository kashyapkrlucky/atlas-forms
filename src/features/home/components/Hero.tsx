import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-20 sm:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <div
          className="animate-fade-up mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50/70 px-3 py-1 text-xs font-medium text-violet-700"
        >
          <Sparkles className="h-3 w-3" />
          Manual control. AI when you want it.
        </div>

        <h1
          className="animate-fade-up text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
          style={{ animationDelay: "0.05s" }}
        >
          The form builder that actually gets out of your way
        </h1>

        <p
          className="animate-fade-up mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-slate-500"
          style={{ animationDelay: "0.1s" }}
        >
          Build every field by hand, or describe the form you need and let AI draft it for you. Preview before
          anything changes — apply or revert in one click.
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "0.15s" }}
        >
          <Button variant="primary" size="lg" asChild>
            <Link href="/dashboard">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>
      </div>

      <div className="animate-fade-up mt-16 flex items-center justify-center" style={{ animationDelay: "0.2s" }}>
        <Image src="/app-home.png" alt="Hero" width={800} height={400} className="rounded-lg shadow-lg" />
      </div>
    </section>
  );
}
