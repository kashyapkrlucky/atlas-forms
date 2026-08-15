import { FieldDef } from "@/server/validation/Field";

export interface AiGenerateResult {
  schema: FieldDef[];
  summary: string;
}
