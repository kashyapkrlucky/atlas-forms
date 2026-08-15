import { FIELD_TYPES, FieldDef, FormSchemaZ } from "@/server/validation/Field";
import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AiResponseSchema = z.object({
    schema: FormSchemaZ,
    summary: z.string(),
});

const SYSTEM_PROMPT = `You are a form-building assistant for a Typeform-like product. Given a user's request and the form's current field schema, propose a new, complete field schema for the whole form.

Rules:
- Respond with ONLY a JSON object matching this exact shape: {"schema": FieldDef[], "summary": string}.
- "schema" is the COMPLETE ordered list of fields the form should have after your change (not just the diff). If the user asks to add a field, include the existing fields plus the new one(s), in a sensible order.
- Every field object has: id (string, keep the existing id when you keep a field, invent a short lowercase-with-hyphens id like "full-name" for new fields), label (string), type (one of: ${FIELD_TYPES.join(", ")}), required (boolean), and optionally description (string).
- Fields of type single_select, multi_select, or dropdown MUST also include "options": an array of at least 2 objects like {"id": "opt-1", "label": "Option label"}.
- Fields of type rating MUST include "max" (integer 3-10, default 5).
- Fields of type number MAY include "min" and "max" (numbers).
- Fields of type short_text or long_text MAY include "placeholder" and "maxLength".
- "summary" is a short (<20 words) human-readable description of what changed, e.g. "Added a rating field and made email required."
- Never invent fields the user didn't ask for beyond what's reasonably implied. Keep existing fields untouched unless the user's request implies changing them.`;

export async function generateFormSchema(
    prompt: string,
    currentSchema: FieldDef[]
): Promise<{ schema: FieldDef[]; summary: string }> {
    const userMessage = `Current form schema (JSON):\n${JSON.stringify(currentSchema)}\n\nUser request: ${prompt}`;

    const attempt = async (extra?: string) => {
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage },
                ...(extra ? [{ role: "user" as const, content: extra }] : []),
            ],
            temperature: 0.4,
        });
        const content = completion.choices[0]?.message?.content ?? "{}";
        return JSON.parse(content);
    };

    let raw = await attempt();
    let parsed = AiResponseSchema.safeParse(raw);

    if (!parsed.success) {
        raw = await attempt(
            `Your previous response failed validation with this error: ${JSON.stringify(
                parsed.error.issues
            )}. Return ONLY the corrected JSON object matching the required shape.`
        );
        parsed = AiResponseSchema.safeParse(raw);
    }

    if (!parsed.success) {
        throw new Error("ai_invalid_output");
    }

    return parsed.data;
}
