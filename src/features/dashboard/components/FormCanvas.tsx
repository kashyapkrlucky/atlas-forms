import { EmptyState } from "@/shared/ui/EmptyState";
import { useBuilderStore } from "../store/useBuilderStore";

import { LayoutList } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FieldCard } from "./FieldCard";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";

export function FormCanvas() {
    const form = useBuilderStore((s) => s.form);
    const selectedFieldId = useBuilderStore((s) => s.selectedFieldId);
    const selectField = useBuilderStore((s) => s.selectField);
    const removeField = useBuilderStore((s) => s.removeField);
    const reorderFields = useBuilderStore((s) => s.reorderFields);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
    if (!form) return null;
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id || !form) return;
        const fromIndex = form.schema.findIndex((f) => f.id === active.id);
        const toIndex = form.schema.findIndex((f) => f.id === over.id);
        if (fromIndex === -1 || toIndex === -1) return;
        reorderFields(fromIndex, toIndex);
    }

    if (form.schema.length === 0) {
        return (
            <EmptyState
                icon={LayoutList}
                title="This form has no questions yet"
                description="Add a field from the panel on the right, or ask the AI assistant to build one for you."
            />
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={form.schema.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                        {form.schema.map((field, index) => (
                            <motion.div
                                key={field.id}
                                layout
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                            >
                                <FieldCard
                                    field={field}
                                    index={index}
                                    selected={selectedFieldId === field.id}
                                    onSelect={() => selectField(field.id)}
                                    onRemove={() => removeField(field.id)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </SortableContext>
        </DndContext >
    );
}
