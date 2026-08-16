
import { FIELD_TYPES, FIELD_TYPE_META, FieldType } from "@/server/validation/Field";
import { useBuilderStore } from "@/features/dashboard/store/useBuilderStore";

import {
    AlignLeft,
    Calendar,
    CheckSquare,
    ChevronDown,
    CircleDot,
    Hash,
    Mail,
    Phone,
    Star,
    TextCursorInput,
    ToggleLeft,
    type LucideIcon,
} from "lucide-react";
const ICONS: Record<string, LucideIcon> = {
    TextCursorInput,
    AlignLeft,
    Mail,
    Hash,
    Phone,
    Calendar,
    CircleDot,
    CheckSquare,
    ChevronDown,
    Star,
    ToggleLeft,
};
export function FieldPalette() {
    const addField = useBuilderStore((s) => s.addField);
    const form = useBuilderStore((s) => s.form);
    return (
        <div className="grid grid-cols-2 gap-2">
            {FIELD_TYPES.map((type: FieldType) => {
                const meta = FIELD_TYPE_META[type];
                const Icon = ICONS[meta.icon];
                return (
                    <button
                        key={type}
                        disabled={!form}
                        onClick={() => addField(type)}
                        className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-violet-300 hover:bg-violet-50/40 hover:shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-[13px] font-medium text-slate-700">{meta.label}</span>
                    </button>
                );
            })}
        </div>
    );
}