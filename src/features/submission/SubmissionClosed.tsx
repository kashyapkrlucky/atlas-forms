import { CheckCircle2 } from "lucide-react";

export function SubmissionClosed({
  title = "This link has already been used",
  description = "Thanks for your response — this form can only be submitted once per invite.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f5fb] px-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
