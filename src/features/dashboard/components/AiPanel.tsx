"use client";

import { FieldDef } from "@/server/validation/Field";
import { deepEqual } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, History, RotateCcw, Sparkles, Wand2, X } from "lucide-react";
import { toast } from "sonner";
import { useBuilderStore } from "../store/useBuilderStore";
import { useAiStore } from "../store/useAiStore";
import { Textarea } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";

function diffSummary(current: FieldDef[], next: FieldDef[]) {
    const currentIds = new Set(current.map((f) => f.id));
    const nextIds = new Set(next.map((f) => f.id));
    const added = next.filter((f) => !currentIds.has(f.id));
    const removed = current.filter((f) => !nextIds.has(f.id));
    const changed = next.filter((f) => {
        if (!currentIds.has(f.id)) return false;
        const before = current.find((c) => c.id === f.id);
        return !deepEqual(before, f);
    });
    return { added, removed, changed };
}

export function AiPanel() {
    const form = useBuilderStore((s) => s.form);
    const { prompt, isGenerating, error, suggestion, history, setPrompt, generate, discardSuggestion, apply, revert, reapply } =
        useAiStore();

    const schema = form?.schema ?? [];
    const canRevert = !!history && deepEqual(schema, history.after);
    const canReapply = !!history && deepEqual(schema, history.before);

    const diff = suggestion ? diffSummary(schema, suggestion.schema) : null;

    if (!form) return null;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-violet-500">
                <Sparkles className="h-3.5 w-3.5" />
                Ask AI
            </div>

            <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Try "add a rating field for service quality" or "build a job application form"'
                rows={3}
                disabled={isGenerating}
            />

            <Button
                variant="primary"
                size="sm"
                disabled={!prompt.trim() || isGenerating}
                onClick={() => generate()}
            >
                <Wand2 className="h-3.5 w-3.5" />
                {isGenerating ? "Thinking..." : "Generate"}
            </Button>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <AnimatePresence>
                {suggestion && diff && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3.5">
                            <p className="text-sm text-slate-700">{suggestion.summary}</p>
                            <ul className="mt-2 flex flex-col gap-1 text-xs">
                                {diff.added.map((f) => (
                                    <li key={f.id} className="text-emerald-600">
                                        + Added &ldquo;{f.label}&rdquo;
                                    </li>
                                ))}
                                {diff.changed.map((f) => (
                                    <li key={f.id} className="text-amber-600">
                                        ~ Changed &ldquo;{f.label}&rdquo;
                                    </li>
                                ))}
                                {diff.removed.map((f) => (
                                    <li key={f.id} className="text-rose-600">
                                        − Removed &ldquo;{f.label}&rdquo;
                                    </li>
                                ))}
                                {diff.added.length + diff.changed.length + diff.removed.length === 0 && (
                                    <li className="text-slate-400">No structural changes</li>
                                )}
                            </ul>
                            <div className="mt-3 flex gap-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                        apply();
                                        toast.success("AI changes applied");
                                    }}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Apply changes
                                </Button>
                                <Button variant="ghost" size="sm" onClick={discardSuggestion}>
                                    <X className="h-3.5 w-3.5" />
                                    Discard
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!suggestion && (canRevert || canReapply) && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <History className="h-3.5 w-3.5" />
                        {canRevert ? "AI changes applied" : "Reverted to before AI"}
                    </span>
                    {canRevert && (
                        <Button variant="secondary" size="sm" onClick={revert}>
                            <RotateCcw className="h-3.5 w-3.5" />
                            Revert
                        </Button>
                    )}
                    {canReapply && (
                        <Button variant="secondary" size="sm" onClick={reapply}>
                            <RotateCcw className="h-3.5 w-3.5 -scale-x-100" />
                            Re-apply
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
