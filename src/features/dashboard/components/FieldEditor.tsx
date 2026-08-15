"use client";

import { MousePointerClick, Plus, X } from "lucide-react";
import { useBuilderStore } from "../store/useBuilderStore";
import { FIELD_TYPE_META, FieldDef, isChoiceField } from "@/server/validation/Field";
import { Input, Textarea } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { generateOptionId } from "@/shared/utils";
import { Switch } from "@/shared/ui/Switch";

export function FieldEditor() {
    const form = useBuilderStore((s) => s.form);
    const selectedFieldId = useBuilderStore((s) => s.selectedFieldId);
    const updateField = useBuilderStore((s) => s.updateField);

    const field = form?.schema.find((f) => f.id === selectedFieldId);

    if (!field) {
        return (
            <EmptyState
                icon={MousePointerClick}
                title="No field selected"
                description="Click a question in the canvas to edit its label, options, and settings here."
            />
        );
    }

    function patch(p: Partial<FieldDef>) {
        updateField(field!.id, p);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="text-xs font-medium uppercase tracking-wide text-violet-500">
                {FIELD_TYPE_META[field.type].label}
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Question</label>
                <Input value={field.label} onChange={(e) => patch({ label: e.target.value })} placeholder="Your question" />
            </div>

            <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Description (optional)</label>
                <Textarea
                    value={field.description ?? ""}
                    onChange={(e) => patch({ description: e.target.value })}
                    placeholder="Add helper text"
                    rows={2}
                />
            </div>

            {"placeholder" in field && (
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Placeholder</label>
                    <Input
                        value={field.placeholder ?? ""}
                        onChange={(e) => patch({ placeholder: e.target.value })}
                        placeholder="Shown inside the field"
                    />
                </div>
            )}

            {(field.type === "short_text" || field.type === "long_text") && (
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Max length</label>
                    <Input
                        type="number"
                        value={field.maxLength ?? ""}
                        onChange={(e) => patch({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="No limit"
                    />
                </div>
            )}

            {field.type === "number" && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">Min</label>
                        <Input
                            type="number"
                            value={field.min ?? ""}
                            onChange={(e) => patch({ min: e.target.value ? Number(e.target.value) : undefined })}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-500">Max</label>
                        <Input
                            type="number"
                            value={field.max ?? ""}
                            onChange={(e) => patch({ max: e.target.value ? Number(e.target.value) : undefined })}
                        />
                    </div>
                </div>
            )}

            {field.type === "rating" && (
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Number of stars</label>
                    <Input
                        type="number"
                        min={3}
                        max={10}
                        value={field.max}
                        onChange={(e) => patch({ max: Math.min(10, Math.max(3, Number(e.target.value) || 5)) })}
                    />
                </div>
            )}

            {isChoiceField(field) && (
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Options</label>
                    <div className="flex flex-col gap-2">
                        {field.options.map((opt, i) => (
                            <div key={opt.id} className="flex items-center gap-1.5">
                                <Input
                                    value={opt.label}
                                    onChange={(e) => {
                                        const options = field.options.map((o, idx) => (idx === i ? { ...o, label: e.target.value } : o));
                                        patch({ options } as Partial<FieldDef>);
                                    }}
                                    className="h-8.5"
                                />
                                <button
                                    disabled={field.options.length <= 2}
                                    onClick={() => {
                                        const options = field.options.filter((_, idx) => idx !== i);
                                        patch({ options } as Partial<FieldDef>);
                                    }}
                                    className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 -ml-2"
                        onClick={() => {
                            const options = [...field.options, { id: generateOptionId(), label: `Option ${field.options.length + 1}` }];
                            patch({ options } as Partial<FieldDef>);
                        }}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add option
                    </Button>
                </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5">
                <span className="text-sm font-medium text-slate-700">Required</span>
                <Switch checked={field.required} onCheckedChange={(required) => patch({ required })} />
            </div>
        </div>
    );
}
