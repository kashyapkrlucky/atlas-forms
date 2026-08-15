import { FieldDef } from "@/server/validation/Field";

export type FormStatus = "DRAFT" | "PUBLISHED";

export interface FormSummary {
  id: string;
  title: string;
  status: FormStatus;
  updatedAt: string;
  fieldCount: number;
  inviteCount: number;
  submittedCount: number;
}
export interface FormDetail {
  id: string;
  title: string;
  description: string | null;
  status: FormStatus;
  schema: FieldDef[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
