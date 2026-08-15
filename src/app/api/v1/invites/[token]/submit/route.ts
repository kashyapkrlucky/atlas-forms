import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infra/db/connect";
import { SubmitInviteSchema } from "@/server/validation/Form";
import { buildSubmissionSchema, normalizeSubmissionValues } from "@/server/validation/Submit";
import { FieldDef } from "@/server/validation/Field";
import { Prisma } from "../../../../../../../generated/prisma/browser";

type Params = { params: Promise<{ token: string }> };

class AlreadySubmittedError extends Error {}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const body = await req.json();
  const parsed = SubmitInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", details: parsed.error.issues }, { status: 400 });
  }

  const invite = await prisma.formInvite.findUnique({ where: { token }, include: { form: true } });
  if (!invite) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (invite.status === "SUBMITTED") {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }

  const fields = invite.form.schema as unknown as FieldDef[];
  const submissionSchema = buildSubmissionSchema(fields);
  const validated = submissionSchema.safeParse(normalizeSubmissionValues(fields, parsed.data.values));
  if (!validated.success) {
    return NextResponse.json({ error: "invalid_values", details: validated.error.issues }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.formInvite.updateMany({
        where: { token, status: "PENDING" },
        data: { status: "SUBMITTED", submittedAt: new Date() },
      });
      if (updated.count !== 1) {
        throw new AlreadySubmittedError();
      }
      await tx.formSubmission.create({
        data: {
          inviteId: invite.id,
          formId: invite.formId,
          values: validated.data as Prisma.InputJsonValue,
          formSchemaSnapshot: fields as unknown as Prisma.InputJsonValue,
        },
      });
    });
  } catch (err) {
    if (err instanceof AlreadySubmittedError) {
      return NextResponse.json({ error: "already_submitted" }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
