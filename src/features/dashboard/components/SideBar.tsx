"use client"

import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { Button } from "@/shared/ui/Button";
import { FileTextIcon, Plus, Trash2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/shared/ui/Input";
import { toast } from "sonner";
import { useFormsStore } from "../store/useFormStore";
import { motion } from "framer-motion";
import { Skeleton } from "@/shared/ui/Skeleton";
import { cn } from "@/shared/utils";
import { Badge } from "@/shared/ui/Badge";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { UserMenu } from "@/features/home/components/UserMenu";
import useAuthStore from "@/features/auth/store/useAuthStore";

export function SideBar() {
    const [creating, setCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const { user } = useAuthStore();
    const { forms, isLoading, selectedFormId, createForm, fetchForms, selectForm, deleteForm } = useFormsStore();

    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    useEffect(() => {
        fetchForms();
    }, [fetchForms]);
    async function handleCreate() {
        const title = newTitle.trim() || "Untitled form";
        try {
            await createForm(title);
            setCreating(false);
            setNewTitle("");
            toast.success(`Created "${title}"`);
        } catch {
            toast.error("Couldn't create the form");
        }
    }
    const deleteForm_ = forms.find((f) => f.id === deleteTarget);
    return (
        <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200/70 bg-white/60 backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-2.5 px-5 pt-5 pb-4">
                <Logo size={32} />
                <span className="text-[15px] font-semibold text-slate-800">Atlas Forms</span>
            </Link>
            <div className="px-3 pb-3">
                {creating ? (
                    <div className="flex gap-1.5 px-2">
                        <Input
                            autoFocus
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreate();
                                if (e.key === "Escape") {
                                    setCreating(false);
                                    setNewTitle("");
                                }
                            }}
                            onBlur={handleCreate}
                            placeholder="Form title..."
                            className="h-8.5 text-sm"
                        />
                    </div>
                ) : (
                    <Button variant="primary" size="sm" className="w-full" onClick={() => setCreating(true)}>
                        <Plus className="h-4 w-4" />
                        New form
                    </Button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
                {isLoading && forms.length === 0 ? (
                    <div className="flex flex-col gap-2 px-1">
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} className="h-14 w-full" />
                        ))}
                    </div>
                ) : forms.length === 0 ? (
                    <div className="px-3 py-8 text-center">
                        <FileTextIcon className="mx-auto h-6 w-6 text-slate-300" />
                        <p className="mt-2 text-sm text-slate-400">No forms yet</p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-1">
                        {forms.map((form) => (
                            <motion.li key={form.id} layout>
                                <button
                                    onClick={() => selectForm(form.id)}
                                    className={cn(
                                        "group w-full rounded-lg px-3 py-2.5 text-left transition-colors relative",
                                        selectedFormId === form.id ? "bg-violet-50" : "hover:bg-slate-100/80"
                                    )}
                                >
                                    {selectedFormId === form.id && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-violet-600"
                                        />
                                    )}
                                    <div className="flex items-center justify-between gap-2">
                                        <p
                                            className={cn(
                                                "truncate text-sm font-medium",
                                                selectedFormId === form.id ? "text-violet-800" : "text-slate-700"
                                            )}
                                        >
                                            {form.title}
                                        </p>
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteTarget(form.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 shrink-0 rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                                        >
                                            <Trash2Icon className="h-3.5 w-3.5" />
                                        </span>
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <Badge tone={form.status === "PUBLISHED" ? "emerald" : "slate"} dot>
                                            {form.status === "PUBLISHED" ? "Published" : "Draft"}
                                        </Badge>
                                        <span className="text-xs text-slate-400">
                                            {form.fieldCount} {form.fieldCount === 1 ? "field" : "fields"}
                                        </span>
                                        {form.inviteCount > 0 && (
                                            <span className="text-xs text-slate-400">
                                                · {form.submittedCount}/{form.inviteCount} in
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </motion.li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-auto border-t border-slate-200/70 p-3">
                {user && <UserMenu variant="sidebar" />}
            </div>
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete this form?"
                description={`"${deleteForm_?.title}" and all of its invites and submissions will be permanently deleted.`}
                confirmLabel="Delete"
                danger
                onConfirm={async () => {
                    if (!deleteTarget) return;
                    try {
                        await deleteForm(deleteTarget);
                        toast.success("Form deleted");
                    } catch {
                        toast.error("Couldn't delete the form");
                    }
                }}
            />
        </aside>
    );
}
