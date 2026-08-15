import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/connect";
import { getUserFromHeaders } from "@/features/auth/utils";
import { FieldDef } from "@/server/validation/Field";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromHeaders(_req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.form.findFirst({ where: { id, userId: user } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const fields = existing.schema as unknown as FieldDef[];
  if (fields.length === 0) {
    return NextResponse.json({ error: "empty_schema" }, { status: 400 });
  }

  const form = await prisma.form.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: existing.publishedAt ?? new Date() },
  });

  return NextResponse.json({ form });
}
