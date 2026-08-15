import { create } from "zustand";
import { FormSummary } from "../types";
import api from "@/lib/http/internal";
import { get } from "http";

interface FormsState {
    forms: FormSummary[];
    isLoading: boolean;
    selectedFormId: string | null;
    setForms: (forms: FormSummary[]) => void;
    fetchForms: () => Promise<void>;
    createForm: (title: string) => Promise<string>;
    deleteForm: (id: string) => Promise<void>;
    selectForm: (id: string | null) => void;
    patchFormSummary: (id: string, patch: Partial<FormSummary>) => void;
}

export const useFormsStore = create<FormsState>((set, get) => ({
    forms: [],
    isLoading: false,
    selectedFormId: null,
    setForms: (forms: FormSummary[]) => set({ forms }),

    fetchForms: async () => {
        try {
            const response = await api.get("v1/forms");
            set({ forms: response.data });
            if (!get().selectedFormId && response.data.length > 0) {
                set({ selectedFormId: response.data[0].id });
            }
        } catch (error) {
            console.error("Failed to fetch forms:", error);
        }
    },

    createForm: async (title: string) => {
        try {
            const response = await api.post("v1/forms", { title });
            set((state) => ({
                forms: [...state.forms, response.data],
            }));
            return response.data.id;
        } catch (error) {
            console.error("Failed to create form:", error);
            throw error;
        }
    },

    deleteForm: async (id: string) => {
        try {
            await api.delete(`v1/forms/${id}`);
            set((state) => ({
                forms: state.forms.filter((form) => form.id !== id),
            }));
        } catch (error) {
            console.error("Failed to delete form:", error);
            throw error;
        }
    },

    selectForm: (id: string | null) => {
        set({ selectedFormId: id });
    },

    patchFormSummary: (id: string, patch: Partial<FormSummary>) => {
        set((state) => ({
            forms: state.forms.map((form) =>
                form.id === id ? { ...form, ...patch } : form
            ),
        }));
    },
}))