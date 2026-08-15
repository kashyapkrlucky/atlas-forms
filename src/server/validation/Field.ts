import { z } from "zod";

const baseField = z.object({
  id: z.string().min(1),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  required: z.boolean().default(false),
});

export const OptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});
export type OptionDef = z.infer<typeof OptionSchema>;

export const FieldSchema = z.discriminatedUnion("type", [
  baseField.extend({
    type: z.literal("short_text"),
    placeholder: z.string().optional(),
    maxLength: z.number().int().positive().optional(),
  }),
  baseField.extend({
    type: z.literal("long_text"),
    placeholder: z.string().optional(),
    maxLength: z.number().int().positive().optional(),
  }),
  baseField.extend({
    type: z.literal("email"),
    placeholder: z.string().optional(),
  }),
  baseField.extend({
    type: z.literal("number"),
    placeholder: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  baseField.extend({
    type: z.literal("phone"),
    placeholder: z.string().optional(),
  }),
  baseField.extend({
    type: z.literal("date"),
  }),
  baseField.extend({
    type: z.literal("single_select"),
    options: z.array(OptionSchema).min(2),
  }),
  baseField.extend({
    type: z.literal("multi_select"),
    options: z.array(OptionSchema).min(2),
  }),
  baseField.extend({
    type: z.literal("dropdown"),
    options: z.array(OptionSchema).min(2),
  }),
  baseField.extend({
    type: z.literal("rating"),
    max: z.number().int().min(3).max(10).default(5),
  }),
  baseField.extend({
    type: z.literal("yes_no"),
  }),
]);

export type FieldDef = z.infer<typeof FieldSchema>;
export type FieldType = FieldDef["type"];

export const FormSchemaZ = z.array(FieldSchema);
export type FormFields = z.infer<typeof FormSchemaZ>;

export const FIELD_TYPES: FieldType[] = [
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "date",
  "single_select",
  "multi_select",
  "dropdown",
  "rating",
  "yes_no",
];

export const CHOICE_FIELD_TYPES: FieldType[] = ["single_select", "multi_select", "dropdown"];

export function isChoiceField(field: FieldDef): field is Extract<FieldDef, { options: OptionDef[] }> {
  return (CHOICE_FIELD_TYPES as string[]).includes(field.type);
}
