import { LayoutList, ListChecks, Mail, Sparkles, type LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: LayoutList,
    title: "Build it your way",
    description:
      "Add fields one at a time from a clean palette, drag to reorder, and fine-tune every label, option, and validation rule.",
  },
  {
    icon: Sparkles,
    title: "Or let AI draft it",
    description:
      "Describe the form you need in plain English. Review the proposed changes before anything touches your live form — then apply, revert, or re-apply in a single click.",
  },
  {
    icon: Mail,
    title: "Publish & invite",
    description:
      "Send invites by email. Every person gets a unique link that closes itself the moment they submit — no duplicates, no stale links floating around.",
  },
  {
    icon: ListChecks,
    title: "Track every response",
    description:
      "Watch invites move from pending to submitted in real time, and open any response to see exactly what was answered.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto mb-14 max-w-xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Everything a form needs
        </h2>
        <p className="mt-3 text-[15px] text-slate-500">
          A builder that stays out of your way when you know what you want, and steps in when you don&apos;t.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-800">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
