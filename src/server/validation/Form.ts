import { z } from "zod";
import { FormSchemaZ } from "./Field";

export const CreateFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
});

export const UpdateFormSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  schema: FormSchemaZ.optional(),
});



export const AiGenerateSchema = z.object({
  formId: z.string().min(1).optional(),
  prompt: z.string().min(1, "Prompt is required").max(2000),
  currentSchema: FormSchemaZ,
});
