"use client";

import { useState } from "react";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";
import { FieldDef } from "@/server/validation/Field";
import { buildSubmissionSchema, normalizeSubmissionValues } from "@/server/validation/Submit";
import { Logo } from "@/shared/ui/Logo";
import { FieldRenderer } from "../dashboard/components/FieldRenderer";
import { Button } from "@/shared/ui/Button";

interface FormData {
  id: string;
  title: string;
  description: string | null;
  schema: FieldDef[];
}

export function PublicSubmissionForm({ token, form }: { token: string; form: FormData }) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitError(null);
    const schema = buildSubmissionSchema(form.schema);
    const result = schema.safeParse(normalizeSubmissionValues(form.schema, values));
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await axios.post(`/api/v1/invites/${token}/submit`, { values: result.data });
      setSubmitted(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setSubmitError("This link has already been used.");
      } else if (axios.isAxiosError(err) && err.response?.status === 404) {
        setSubmitError("This invite is no longer valid. Ask the form owner to send you a new link.");
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f5fb] px-6">
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Thanks for your response</h1>
          <p className="mt-2 text-sm text-slate-500">Your answers have been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f5fb] px-6 py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-2 flex items-center gap-2">
          <Logo size={20} />
          <span className="text-xs font-medium uppercase tracking-wide text-violet-500">Atlas Forms</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">{form.title}</h1>
        {form.description && <p className="mt-2 text-[15px] text-slate-500">{form.description}</p>}

        <div className="mt-8 flex flex-col gap-6">
          {form.schema.map((field, i) => (
            <div key={field.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
              <p className="mb-1 text-[15px] font-medium text-slate-800">
                <span className="mr-1.5 text-slate-400">{i + 1}.</span>
                {field.label}
                {field.required && <span className="ml-1 text-violet-500">*</span>}
              </p>
              {field.description && <p className="mb-3 text-sm text-slate-500">{field.description}</p>}
              <div className={field.description ? "" : "mt-3"}>
                <FieldRenderer
                  field={field}
                  mode="fill"
                  value={values[field.id]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [field.id]: v }))}
                  error={errors[field.id]}
                />
              </div>
            </div>
          ))}
        </div>

        {submitError && <p className="mt-4 text-sm text-rose-600">{submitError}</p>}

        <div className="mt-8 flex justify-end">
          <Button variant="primary" size="lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
