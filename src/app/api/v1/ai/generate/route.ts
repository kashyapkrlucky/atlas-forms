import { NextRequest, NextResponse } from "next/server";
import { generateFormSchema } from "@/infra/ai";
import { AiGenerateSchema } from "@/server/validation/Form";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = AiGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error.issues }, { status: 400 });
  }

  try {
    const result = await generateFormSchema(parsed.data.prompt, parsed.data.currentSchema);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "ai_invalid_output" }, { status: 502 });
  }
}
