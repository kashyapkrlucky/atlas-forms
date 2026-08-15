"use client";

import { FieldDef } from "@/server/validation/Field";
import { cn } from "@/shared/utils";
import { Star } from "lucide-react";

type Mode = "builder" | "fill" | "view";

interface FieldRendererProps {
  field: FieldDef;
  mode: Mode;
  value?: unknown;
  onChange?: (value: unknown) => void;
  error?: string;
}

const controlBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-100";

function borderClass(error?: string) {
  return error ? "border-rose-300 focus:border-rose-400" : "border-slate-200 focus:border-violet-400";
}

export function FieldRenderer({ field, mode, value, onChange, error }: FieldRendererProps) {
  const disabled = mode === "builder";
  const emit = (v: unknown) => onChange?.(v);

  if (mode === "view") {
    return <ViewValue field={field} value={value} />;
  }

  return (
    <div>
      <RenderControl field={field} disabled={disabled} value={value} onChange={emit} error={error} />
      {mode === "fill" && error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
    </div>
  );
}

function isEmptyAnswer(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function ViewValue({ field, value }: { field: FieldDef; value: unknown }) {
  if (isEmptyAnswer(value)) {
    return <p className="text-[15px] italic text-slate-400">No answer</p>;
  }

  switch (field.type) {
    case "single_select":
    case "dropdown": {
      const opt = field.options.find((o) => o.id === value);
      return (
        <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
          {opt?.label ?? String(value)}
        </span>
      );
    }
    case "multi_select": {
      const values = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => {
            const opt = field.options.find((o) => o.id === v);
            return (
              <span
                key={v}
                className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700"
              >
                {opt?.label ?? v}
              </span>
            );
          })}
        </div>
      );
    }
    case "rating": {
      const rating = typeof value === "number" ? value : 0;
      return (
        <div className="flex gap-1">
          {Array.from({ length: field.max }, (_, i) => i + 1).map((n) => (
            <Star
              key={n}
              className={cn(
                "h-5.5 w-5.5",
                n <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"
              )}
            />
          ))}
        </div>
      );
    }
    case "yes_no":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
            value ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          )}
        >
          {value ? "Yes" : "No"}
        </span>
      );
    default:
      return <p className="text-[15px] text-slate-700 whitespace-pre-wrap">{String(value)}</p>;
  }
}

function RenderControl({
  field,
  disabled,
  value,
  onChange,
  error,
}: {
  field: FieldDef;
  disabled: boolean;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  switch (field.type) {
    case "short_text":
      return (
        <input
          type="text"
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "Your answer"}
          maxLength={field.maxLength}
          className={cn(controlBase, borderClass(error), disabled && "pointer-events-none")}
        />
      );
    case "long_text":
      return (
        <textarea
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "Your answer"}
          maxLength={field.maxLength}
          rows={4}
          className={cn(controlBase, borderClass(error), "resize-none", disabled && "pointer-events-none")}
        />
      );
    case "email":
      return (
        <input
          type="email"
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "name@example.com"}
          className={cn(controlBase, borderClass(error), disabled && "pointer-events-none")}
        />
      );
    case "number":
      return (
        <input
          type="number"
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "0"}
          min={field.min}
          max={field.max}
          className={cn(controlBase, borderClass(error), disabled && "pointer-events-none")}
        />
      );
    case "phone":
      return (
        <input
          type="tel"
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? "+1 (555) 000-0000"}
          className={cn(controlBase, borderClass(error), disabled && "pointer-events-none")}
        />
      );
    case "date":
      return (
        <input
          type="date"
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlBase, borderClass(error), disabled && "pointer-events-none")}
        />
      );
    case "single_select":
      return (
        <div className="flex flex-col gap-2">
          {field.options.map((opt) => {
            const checked = value === opt.id;
            return (
              <label
                key={opt.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-[15px] transition-colors",
                  checked ? "border-violet-400 bg-violet-50/70" : "border-slate-200 bg-white",
                  disabled ? "pointer-events-none" : "cursor-pointer hover:border-violet-300"
                )}
              >
                <input
                  type="radio"
                  disabled={disabled}
                  checked={checked}
                  onChange={() => onChange(opt.id)}
                  className="h-4 w-4 accent-violet-600"
                />
                <span className="text-slate-700">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    case "multi_select": {
      const values = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-col gap-2">
          {field.options.map((opt) => {
            const checked = values.includes(opt.id);
            return (
              <label
                key={opt.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-[15px] transition-colors",
                  checked ? "border-violet-400 bg-violet-50/70" : "border-slate-200 bg-white",
                  disabled ? "pointer-events-none" : "cursor-pointer hover:border-violet-300"
                )}
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={checked}
                  onChange={(e) =>
                    onChange(e.target.checked ? [...values, opt.id] : values.filter((v) => v !== opt.id))
                  }
                  className="h-4 w-4 rounded accent-violet-600"
                />
                <span className="text-slate-700">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    }
    case "dropdown":
      return (
        <select
          disabled={disabled}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(controlBase, borderClass(error), disabled && "pointer-events-none", "appearance-none")}
        >
          <option value="" disabled>
            Select an option
          </option>
          {field.options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case "rating": {
      const rating = typeof value === "number" ? value : 0;
      return (
        <div className={cn("flex gap-1", disabled && "pointer-events-none")}>
          {Array.from({ length: field.max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="p-0.5"
              aria-label={`Rate ${n}`}
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  n <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"
                )}
              />
            </button>
          ))}
        </div>
      );
    }
    case "yes_no":
      return (
        <div className={cn("flex gap-2", disabled && "pointer-events-none")}>
          {[
            { label: "Yes", v: true },
            { label: "No", v: false },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.v)}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2.5 text-[15px] font-medium transition-colors",
                value === opt.v
                  ? "border-violet-400 bg-violet-50/70 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      );
  }
}
