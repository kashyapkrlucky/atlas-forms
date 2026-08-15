import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/connect";
import { getUserFromHeaders } from "@/features/auth/utils";

type Params = { params: Promise<{ id: string; inviteId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, inviteId } = await params;
  const user = await getUserFromHeaders(_req);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await prisma.form.findFirst({ where: { id, userId: user } });
  if (!form) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const invite = await prisma.formInvite.findFirst({ where: { id: inviteId, formId: id } });
  if (!invite) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (invite.status === "SUBMITTED") {
    return NextResponse.json({ error: "already_submitted" }, { status: 400 });
  }

  await prisma.formInvite.delete({ where: { id: inviteId } });
  return NextResponse.json({ ok: true });
}
