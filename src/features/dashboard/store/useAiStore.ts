import { create } from "zustand";
import { cloneSchema, deepEqual } from "@/shared/utils";
import type { FieldDef } from "@/server/validation/Field";
import type { AiGenerateResult } from "@/shared/types";
import { useBuilderStore } from "./useBuilderStore";
import api from "@/lib/http/internal";

interface AiHistory {
    before: FieldDef[];
    after: FieldDef[];
}

interface AiState {
    prompt: string;
    isGenerating: boolean;
    error: string | null;
    suggestion: AiGenerateResult | null;
    history: AiHistory | null;

    setPrompt: (prompt: string) => void;
    generate: () => Promise<void>;
    discardSuggestion: () => void;
    apply: () => void;
    revert: () => void;
    reapply: () => void;
    canRevert: () => boolean;
    canReapply: () => boolean;
}

export const useAiStore = create<AiState>((set, get) => ({
    prompt: "",
    isGenerating: false,
    error: null,
    suggestion: null,
    history: null,

    setPrompt: (prompt) => set({ prompt }),

    generate: async () => {
        const builder = useBuilderStore.getState();
        if (!builder.form || !get().prompt.trim()) return;
        set({ isGenerating: true, error: null, suggestion: null });
        try {
            const { data } = await api.post<AiGenerateResult>("/v1/ai/generate", {
                formId: builder.form.id,
                prompt: get().prompt,
                currentSchema: builder.form.schema,
            });
            set({ suggestion: data, isGenerating: false });
        } catch {
            set({ isGenerating: false, error: "Couldn't generate a suggestion. Try rephrasing your request." });
        }
    },

    discardSuggestion: () => set({ suggestion: null, prompt: "" }),

    apply: () => {
        const { suggestion } = get();
        const builder = useBuilderStore.getState();
        if (!suggestion || !builder.form) return;
        const before = cloneSchema(builder.form.schema);
        const after = cloneSchema(suggestion.schema);
        builder.replaceSchema(after);
        set({ history: { before, after }, suggestion: null, prompt: "" });
    },

    revert: () => {
        const { history } = get();
        const builder = useBuilderStore.getState();
        if (!history) return;
        builder.replaceSchema(cloneSchema(history.before));
    },

    reapply: () => {
        const { history } = get();
        const builder = useBuilderStore.getState();
        if (!history) return;
        builder.replaceSchema(cloneSchema(history.after));
    },

    canRevert: () => {
        const { history } = get();
        const builder = useBuilderStore.getState();
        if (!history || !builder.form) return false;
        return deepEqual(builder.form.schema, history.after);
    },

    canReapply: () => {
        const { history } = get();
        const builder = useBuilderStore.getState();
        if (!history || !builder.form) return false;
        return deepEqual(builder.form.schema, history.before);
    },
}));
