const STEPS = [
  {
    number: "01",
    title: "Design your form",
    description: "Start from a blank canvas or ask AI to draft one — then adjust fields, options, and rules by hand.",
  },
  {
    number: "02",
    title: "Publish & send invites",
    description: "One click turns a draft into a live form with shareable, single-use links for every invitee.",
  },
  {
    number: "03",
    title: "Watch responses arrive",
    description: "Every submission shows up instantly, organized by form and by person, ready to review.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-slate-200/70 bg-white/60">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">How it works</h2>
          <p className="mt-3 text-[15px] text-slate-500">From blank page to submitted response, in three steps.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number}>
              <span className="bg-linear-to-br from-violet-600 to-fuchsia-500 bg-clip-text text-3xl font-bold text-transparent">
                {step.number}
              </span>
              <h3 className="mt-3 text-[15px] font-semibold text-slate-800">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
