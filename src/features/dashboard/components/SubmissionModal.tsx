"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Skeleton } from "@/shared/ui/Skeleton";
import { InviteSubmissionDetail } from "../types";
import { formatDateTime } from "@/shared/utils";
import { FieldRenderer } from "./FieldRenderer";
import api from "@/lib/http/internal";

export function SubmissionModal({
  formId,
  inviteId,
  onOpenChange,
}: {
  formId: string;
  inviteId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [data, setData] = useState<InviteSubmissionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!inviteId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-change loading flag
    setLoading(true);
    api
      .get<InviteSubmissionDetail>(`/v1/forms/${formId}/invites/${inviteId}/submission`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [formId, inviteId]);

  return (
    <Modal
      open={!!inviteId}
      onOpenChange={onOpenChange}
      title={data ? data.invite.email : "Submission"}
      description={data ? `Submitted ${formatDateTime(data.invite.submittedAt)}` : undefined}
      maxWidth="max-w-lg"
    >
      {loading || !data ? (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto pr-1">
          {data.schema.map((field) => (
            <div key={field.id}>
              <p className="mb-1.5 text-sm font-medium text-slate-700">
                {field.label}
                {field.required && <span className="ml-1 text-violet-500">*</span>}
              </p>
              <FieldRenderer field={field} mode="view" value={data.values[field.id]} />
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
