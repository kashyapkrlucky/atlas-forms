import { getUserFromHeaders } from "@/features/auth/utils";
import { prisma } from "@/infra/db/connect";
import { sendInviteEmail } from "@/infra/mailer";
import { CreateInvitesSchema } from "@/server/validation/Form";
import { generateInviteToken } from "@/shared/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromHeaders(_req);

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await prisma.form.findFirst({ where: { id, userId: user } });
  if (!form) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const invites = await prisma.formInvite.findMany({
    where: { formId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, status: true, createdAt: true, submittedAt: true },
  });

  return NextResponse.json({ invites });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getUserFromHeaders(req);
  
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userEmail = await prisma.user.findUnique({ where: { id: user }, select: { email: true } });
  if (!userEmail) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }
  
  const body = await req.json();
  const parsed = CreateInvitesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error.issues }, { status: 400 });
  }

  const form = await prisma.form.findFirst({ where: { id, userId: user } });
  if (!form) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (form.status !== "PUBLISHED") {
    return NextResponse.json({ error: "not_published" }, { status: 400 });
  }

  const emails = [...new Set(parsed.data.emails.map((e) => e.toLowerCase()))];
  const existingInvites = await prisma.formInvite.findMany({ where: { formId: id, email: { in: emails } } });
  const existingByEmail = new Map(existingInvites.map((inv) => [inv.email, inv]));

  const created: unknown[] = [];
  const skipped: { email: string; reason: string }[] = [];
  const emailErrors: string[] = [];

  for (const email of emails) {
    const existing = existingByEmail.get(email);
    if (existing?.status === "SUBMITTED") {
      skipped.push({ email, reason: "already_submitted" });
      continue;
    }

    const token = generateInviteToken();
    const invite = existing
      ? await prisma.formInvite.update({ where: { id: existing.id }, data: { token, createdAt: new Date() } })
      : await prisma.formInvite.create({ data: { formId: id, email, token } });

    created.push({
      id: invite.id,
      email: invite.email,
      status: invite.status,
      createdAt: invite.createdAt,
      submittedAt: invite.submittedAt,
    });

    try {
      await sendInviteEmail({ from: userEmail.email, to: email, formTitle: form.title, link: `${process.env.NEXT_PUBLIC_API_URL}/submit/${token}` });
    } catch {
      emailErrors.push(email);
    }
  }

  return NextResponse.json({ created, skipped, emailErrors });
}
