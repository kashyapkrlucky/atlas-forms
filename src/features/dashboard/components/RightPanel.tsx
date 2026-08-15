import { Plus, Settings2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useBuilderStore } from "@/features/dashboard/store/useBuilderStore";
import { cn } from "@/shared/utils";
import { motion } from "framer-motion";
import { FieldPalette } from "./FieldPalette";
import { FieldEditor } from "./FieldEditor";
import { AiPanel } from "./AiPanel";

type Tab = "add" | "edit" | "ai";

const TABS: { id: Tab; label: string; icon: typeof Plus }[] = [
    { id: "add", label: "Add", icon: Plus },
    { id: "edit", label: "Edit", icon: Settings2 },
    { id: "ai", label: "AI", icon: Sparkles },
];

export function RightPanel() {
    const form = useBuilderStore((s) => s.form);
    const selectedFieldId = useBuilderStore((s) => s.selectedFieldId);
    const [tab, setTab] = useState<Tab>("add");
    const [lastSelectedFieldId, setLastSelectedFieldId] = useState(selectedFieldId);

    if (selectedFieldId !== lastSelectedFieldId) {
        setLastSelectedFieldId(selectedFieldId);
        if (selectedFieldId) setTab("edit");
    }

    return <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200/70 bg-white/60 backdrop-blur-sm">
        <div className="flex gap-1 border-b border-slate-200/70 p-2">
            {TABS.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    disabled={!form}
                    onClick={() => setTab(id)}
                    className={cn(
                        "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[13px] font-medium transition-colors disabled:opacity-40",
                        tab === id ? "text-violet-700" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    {tab === id && (
                        <motion.div layoutId="right-tab-active" className="absolute inset-0 rounded-lg bg-violet-50" />
                    )}
                    <Icon className="h-3.5 w-3.5 relative" />
                    <span className="relative">{label}</span>
                </button>
            ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
            {!form ? (
                <p className="mt-8 text-center text-sm text-slate-400">Select a form to start editing</p>
            ) : (
                <>
                    {tab === "add" && <FieldPalette />}
                    {tab === "edit" && <FieldEditor />}
                    {tab === "ai" && <AiPanel />}
                </>
            )}
        </div>
    </aside>;
}