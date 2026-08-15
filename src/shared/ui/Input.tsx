import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../utils";

const fieldBase =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, "resize-none", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";
