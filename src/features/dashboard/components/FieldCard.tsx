import { FIELD_TYPE_META, FieldDef } from "@/server/validation/Field";
import { cn } from "@/shared/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, Trash2Icon } from "lucide-react";
import { FieldRenderer } from "./FieldRenderer";

export function FieldCard({
    field,
    index,
    selected,
    onSelect,
    onRemove,
}: {
    field: FieldDef;
    index: number;
    selected: boolean;
    onSelect: () => void;
    onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: field.id,
    });
    return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
        onClick={onSelect} className={cn(
            "group relative rounded-lg border bg-white p-5 pl-11 shadow-xs transition-all cursor-pointer",
            selected ? "border-violet-400 ring-2 ring-violet-100" : "border-slate-200 hover:border-slate-300",
            isDragging && "opacity-50 z-10"
        )}>

        <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 touch-none"
            aria-label="Drag to reorder"
        >
            <GripVerticalIcon className="h-4.5 w-4.5" />
        </button>



        <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-xs font-medium text-slate-400 shrink-0">{index + 1}.</span>
                <h4 className="text-[15px] font-medium text-slate-800 truncate">
                    {field.label || "Untitled question"}
                    {field.required && <span className="ml-1 text-violet-500">*</span>}
                </h4>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-slate-400">{FIELD_TYPE_META[field.type].label}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all"
                    aria-label="Delete field"
                >
                    <Trash2Icon className="h-4 w-4" />
                </button>
            </div>
        </div>

        {field.description && <p className="mb-3 text-sm text-slate-500">{field.description}</p>}

        <div className="pointer-events-none opacity-90">
            <FieldRenderer field={field} mode="builder" />
        </div>
    </div>;
}