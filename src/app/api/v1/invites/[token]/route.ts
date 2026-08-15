import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/connect";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;

  const invite = await prisma.formInvite.findUnique({
    where: { token },
    include: { form: true },
  });

  if (!invite) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (invite.status === "SUBMITTED") {
    return NextResponse.json({ status: "submitted" });
  }

  return NextResponse.json({
    status: "pending",
    form: {
      id: invite.form.id,
      title: invite.form.title,
      description: invite.form.description,
      schema: invite.form.schema,
    },
    invite: { email: invite.email },
  });
}
