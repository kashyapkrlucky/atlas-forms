import { FieldDef } from "@/server/validation/Field";

export type FormStatus = "DRAFT" | "PUBLISHED";
export type InviteStatus = "PENDING" | "SUBMITTED";

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


export interface InviteSummary {
  id: string;
  email: string;
  status: InviteStatus;
  createdAt: string;
  submittedAt: string | null;
}

export interface InviteSubmissionDetail {
  invite: { email: string; submittedAt: string };
  values: Record<string, unknown>;
  schema: FieldDef[];
}

export interface AiGenerateResult {
  schema: FieldDef[];
  summary: string;
}
