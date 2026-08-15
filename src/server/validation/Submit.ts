import { z } from "zod";
import { FieldDef } from "./Field";

function innerSchemaForField(field: FieldDef): z.ZodTypeAny {
  switch (field.type) {
    case "short_text":
    case "long_text": {
      let s = z.string().trim();
      if (field.maxLength) s = s.max(field.maxLength);
      return s;
    }
    case "email":
      return z.string().trim().email("Enter a valid email address");
    case "number": {
      let s = z.coerce.number();
      if (field.min !== undefined) s = s.min(field.min);
      if (field.max !== undefined) s = s.max(field.max);
      return s;
    }
    case "phone":
      return z
        .string()
        .trim()
        .regex(/^[0-9+\-\s()]{6,20}$/, "Enter a valid phone number");
    case "date":
      return z.string().refine((v) => !isNaN(Date.parse(v)), "Enter a valid date");
    case "single_select":
    case "dropdown":
      return z.enum(field.options.map((o) => o.id) as [string, ...string[]]);
    case "multi_select": {
      const optionIds = field.options.map((o) => o.id) as [string, ...string[]];
      return z.array(z.enum(optionIds));
    }
    case "rating":
      return z.coerce.number().int().min(1).max(field.max);
    case "yes_no":
      return z.boolean();
  }
}

function isEmptyValue(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function schemaForField(field: FieldDef): z.ZodTypeAny {
  const inner = innerSchemaForField(field);

  return z.any().transform((value, ctx) => {
    if (isEmptyValue(value)) {
      if (field.required) {
        ctx.addIssue({ code: "custom", message: "This field is required" });
        return z.NEVER;
      }
      return undefined;
    }

    const result = inner.safeParse(value);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ code: "custom", message: issue.message, path: issue.path });
      }
      return z.NEVER;
    }
    return result.data;
  });
}

export function buildSubmissionSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.id] = schemaForField(field);
  }
  return z.object(shape).strict();
}

/**
 * Zod v4 treats an entirely-absent object key differently from a key present
 * with value `undefined` (the former fails even z.any()). The client only
 * populates keys for fields the user has touched, so every field id must be
 * explicitly present before validating.
 */
export function normalizeSubmissionValues(fields: FieldDef[], values: Record<string, unknown>) {
  return Object.fromEntries(fields.map((f) => [f.id, values[f.id]]));
}

export type SubmissionValues = Record<string, unknown>;
