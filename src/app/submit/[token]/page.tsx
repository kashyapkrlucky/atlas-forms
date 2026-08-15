import { SubmissionClosed } from "@/features/submission/SubmissionClosed";
import { PublicSubmissionForm } from "@/features/submission/PublicSubmissionForm";
import { prisma } from "@/infra/db/connect";
import type { FieldDef } from "@/server/validation/Field";


export default async function SubmitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await prisma.formInvite.findUnique({
    where: { token },
    include: { form: true },
  });

  if (!invite) {
    return (
      <SubmissionClosed
        title="We couldn't find this form"
        description="This link may be incorrect. Double check the link you received, or contact whoever invited you."
      />
    );
  }

  if (invite.status === "SUBMITTED") {
    return <SubmissionClosed />;
  }

  return (
    <PublicSubmissionForm
      token={token}
      form={{
        id: invite.form.id,
        title: invite.form.title,
        description: invite.form.description,
        schema: invite.form.schema as unknown as FieldDef[],
      }}
    />
  );
}
