
import { create } from "zustand";
import { FormDetail } from "../types";
import api from "@/lib/http/internal";
import { FieldDef } from "@/server/validation/Field";
import { cloneSchema, deepEqual } from "@/shared/utils";

interface BuilderState {
    form: FormDetail | null;
    isLoading: boolean;
    isSaving: boolean;
    selectedFieldId: string | null;
    savedSchema: FieldDef[];
    savedTitle: string;
    savedDescription: string | null;
    loadForm: (id: string) => Promise<void>;
    setTitle: (title: string) => void;
    setDescription: (description: string | null) => void;
    clear: () => void;
    isDirty: () => boolean;
    save: () => Promise<void>;
    publish: () => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
    form: null,
    isLoading: false,
    isSaving: false,
    selectedFieldId: null,
    savedSchema: [],
    savedTitle: "",
    savedDescription: null,
    loadForm: async (id: string) => {
        set({ isLoading: true, form: null, selectedFieldId: null });
        const { data } = await api.get<{ form: FormDetail }>(`/v1/forms/${id}`);
        set({
            form: data.form,
            savedSchema: cloneSchema(data.form.schema),
            savedTitle: data.form.title,
            savedDescription: data.form.description,
            isLoading: false,
        });
    },

    setTitle: (title) => set((s) => (s.form ? { form: { ...s.form, title } } : s)),
    setDescription: (description) => set((s) => (s.form ? { form: { ...s.form, description } } : s)),
    clear: () => set({ form: null, isLoading: false, isSaving: false, selectedFieldId: null, savedSchema: [], savedTitle: "", savedDescription: null }),
    isDirty: () => {
    const s = get();
    if (!s.form) return false;
    return (
      s.form.title !== s.savedTitle ||
      s.form.description !== s.savedDescription ||
      !deepEqual(s.form.schema, s.savedSchema)
    );
  },

  save: async () => {
    const s = get();
    if (!s.form) return;
    set({ isSaving: true });
    const { data } = await api.patch<{ form: FormDetail }>(`/forms/${s.form.id}`, {
      title: s.form.title,
      description: s.form.description,
      schema: s.form.schema,
    });
    set({
      form: data.form,
      savedSchema: cloneSchema(data.form.schema),
      savedTitle: data.form.title,
      savedDescription: data.form.description,
      isSaving: false,
    });
  },

  publish: async () => {
    const s = get();
    if (!s.form) return;
    if (s.isDirty()) await s.save();
    const { data } = await api.post<{ form: FormDetail }>(`/forms/${s.form.id}/publish`);
    set({ form: data.form });
  },
})) 