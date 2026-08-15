import { Badge } from "@/shared/ui/Badge";
import { useBuilderStore } from "../store/useBuilderStore";
import { Button } from "@/shared/ui/Button";
import { SaveIcon, RocketIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFormsStore } from "../store/useFormStore";

export function FormHeader() {
    const setTitle = useBuilderStore((s) => s.setTitle);
    const setDescription = useBuilderStore((s) => s.setDescription);
    const form = useBuilderStore((s) => s.form);
    const save = useBuilderStore((s) => s.save);
    const publish = useBuilderStore((s) => s.publish);
    const isDirty = useBuilderStore((s) => s.isDirty);
    const isSaving = useBuilderStore((s) => s.isSaving);
    const [publishing, setPublishing] = useState(false);
    const patchFormSummary = useFormsStore((s) => s.patchFormSummary);

    if (!form) return null;

    async function handleSave() {
        try {
            await save();
            if (form) patchFormSummary(form.id, { title: form.title, fieldCount: form.schema.length });
            toast.success("Saved");
        } catch {
            toast.error("Couldn't save");
        }
    }

    async function handlePublish() {
        if (form!.schema.length === 0) {
            toast.error("Add at least one field before publishing");
            return;
        }
        setPublishing(true);
        try {
            await publish();
            patchFormSummary(form!.id, { status: "PUBLISHED", fieldCount: form!.schema.length });
            toast.success("Form published");
        } catch {
            toast.error("Couldn't publish");
        } finally {
            setPublishing(false);
        }
    }

    return <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                    <input
                        value={form.title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled form"
                        className="min-w-0 flex-1 bg-transparent text-2xl font-semibold text-slate-900 outline-none placeholder:text-slate-300"
                    />
                    <Badge tone={form.status === "PUBLISHED" ? "emerald" : "slate"} dot>
                        {form.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                </div>
                <input
                    value={form.description ?? ""}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="mt-1.5 w-full bg-transparent text-sm text-slate-500 outline-none placeholder:text-slate-300"
                />
            </div>

            <div className="flex shrink-0 gap-2">
                <Button variant="secondary" size="sm" disabled={!isDirty() || isSaving} onClick={handleSave}>
                    <SaveIcon className="h-3.5 w-3.5" />
                    {isSaving ? "Saving..." : "Save"}
                </Button>
                {form.status === "DRAFT" && (
                    <Button variant="primary" size="sm" disabled={publishing} onClick={handlePublish}>
                        <RocketIcon className="h-3.5 w-3.5" />
                        {publishing ? "Publishing..." : "Publish"}
                    </Button>
                )}
            </div>
        </div>
    </div>;
}