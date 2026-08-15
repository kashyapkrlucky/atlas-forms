
import { create } from "zustand";
import { FormDetail, InviteSummary } from "../types";
import api from "@/lib/http/internal";
import { FieldDef, FieldType } from "@/server/validation/Field";
import { cloneSchema, deepEqual, generateFieldId, generateOptionId } from "@/shared/utils";

function defaultFieldForType(type: FieldType): FieldDef {
  const base = { id: generateFieldId(), label: "Untitled question", required: false };
  switch (type) {
    case "single_select":
    case "multi_select":
    case "dropdown":
      return {
        ...base,
        type,
        options: [
          { id: generateOptionId(), label: "Option 1" },
          { id: generateOptionId(), label: "Option 2" },
        ],
      };
    case "rating":
      return { ...base, type, max: 5 };
    default:
      return { ...base, type } as FieldDef;
  }
}
interface BuilderState {
  form: FormDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  selectedFieldId: string | null;
  savedSchema: FieldDef[];
  savedTitle: string;
  savedDescription: string | null;
  invites: InviteSummary[];
  loadForm: (id: string) => Promise<void>;
  setTitle: (title: string) => void;
  setDescription: (description: string | null) => void;
  clear: () => void;
  isDirty: () => boolean;
  save: () => Promise<void>;
  publish: () => Promise<void>;
  addField: (type: FieldType) => void;
  updateField: (id: string, patch: Partial<FieldDef>) => void;
  removeField: (id: string) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  selectField: (id: string | null) => void;
  replaceSchema: (schema: FieldDef[]) => void;
  fetchInvites: () => Promise<void>;
  sendInvites: (
    emails: string[]
  ) => Promise<{ created: InviteSummary[]; skipped: { email: string; reason: string }[]; emailErrors: string[] }>;
  resendInvite: (email: string) => Promise<{ emailErrors: string[] }>;
  cancelInvite: (inviteId: string) => Promise<void>;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  form: null,
  isLoading: false,
  isSaving: false,
  selectedFieldId: null,
  savedSchema: [],
  savedTitle: "",
  savedDescription: null,
  invites: [],
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
    if (data.form.status === "PUBLISHED") {
      get().fetchInvites();
    }
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
    const { data } = await api.patch<{ form: FormDetail }>(`/v1/forms/${s.form.id}`, {
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
    const { data } = await api.post<{ form: FormDetail }>(`/v1/forms/${s.form.id}/publish`);
    set({ form: data.form });
  },
  addField: (type) => {
    const field = defaultFieldForType(type);
    set((s) => (s.form ? { form: { ...s.form, schema: [...s.form.schema, field] }, selectedFieldId: field.id } : s));
  },

  updateField: (id, patch) => {
    set((s) => {
      if (!s.form) return s;
      const schema = s.form.schema.map((f) => (f.id === id ? ({ ...f, ...patch } as FieldDef) : f));
      return { form: { ...s.form, schema } };
    });
  },

  removeField: (id) => {
    set((s) => {
      if (!s.form) return s;
      const schema = s.form.schema.filter((f) => f.id !== id);
      return {
        form: { ...s.form, schema },
        selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
      };
    });
  },

  reorderFields: (fromIndex, toIndex) => {
    set((s) => {
      if (!s.form) return s;
      const schema = [...s.form.schema];
      const [moved] = schema.splice(fromIndex, 1);
      schema.splice(toIndex, 0, moved);
      return { form: { ...s.form, schema } };
    });
  },

  selectField: (id) => set({ selectedFieldId: id }),

  replaceSchema: (schema) => set((s) => (s.form ? { form: { ...s.form, schema: cloneSchema(schema) } } : s)),
  fetchInvites: async () => {
    const s = get();
    if (!s.form) return;
    const { data } = await api.get<{ invites: InviteSummary[] }>(`/v1/forms/${s.form.id}/invites`);
    set({ invites: data.invites });
  },

  sendInvites: async (emails) => {
    const s = get();
    if (!s.form) throw new Error("no form loaded");
    const { data } = await api.post<{
      created: InviteSummary[];
      skipped: { email: string; reason: string }[];
      emailErrors: string[];
    }>(`/v1/forms/${s.form.id}/invites`, { emails });
    await s.fetchInvites();
    return data;
  },

  resendInvite: async (email) => {
    const s = get();
    if (!s.form) throw new Error("no form loaded");
    const { data } = await api.post<{ emailErrors: string[] }>(`/v1/forms/${s.form.id}/invites`, { emails: [email] });
    await s.fetchInvites();
    return { emailErrors: data.emailErrors };
  },

  cancelInvite: async (inviteId) => {
    const s = get();
    if (!s.form) return;
    await api.delete(`/v1/forms/${s.form.id}/invites/${inviteId}`);
    await s.fetchInvites();
  },
})) 