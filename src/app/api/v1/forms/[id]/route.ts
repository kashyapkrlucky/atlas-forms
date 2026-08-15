import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { prisma } from "@/infra/db/connect";
import { UpdateFormSchema } from "@/server/validation/Form";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromHeaders(_req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await prisma.form.findFirst({ where: { id, userId: user } });
  if (!form) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ form });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromHeaders(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = UpdateFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.form.findFirst({ where: { id, userId: user } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const form = await prisma.form.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      ...(parsed.data.schema !== undefined ? { schema: parsed.data.schema } : {}),
    },
  });

  return NextResponse.json({ form });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromHeaders(_req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.form.findFirst({ where: { id, userId: user } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.form.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}