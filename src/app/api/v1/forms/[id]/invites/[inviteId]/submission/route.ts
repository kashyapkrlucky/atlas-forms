import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/connect";
import { getUserFromHeaders } from "@/features/auth/utils";

type Params = { params: Promise<{ id: string; inviteId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id, inviteId } = await params;
  const user = await getUserFromHeaders(_req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await prisma.form.findFirst({ where: { id, userId: user } });
  if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const invite = await prisma.formInvite.findFirst({
    where: { id: inviteId, formId: id },
    include: { submission: true },
  });
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invite.status !== "SUBMITTED" || !invite.submission) {
    return NextResponse.json({ error: "Not submitted" }, { status: 400 });
  }

  return NextResponse.json({
    invite: { email: invite.email, submittedAt: invite.submittedAt },
    values: invite.submission.values,
    schema: invite.submission.formSchemaSnapshot,
  });
}
