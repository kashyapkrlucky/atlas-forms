"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { InviteSummary } from "../types";
import { useBuilderStore } from "../store/useBuilderStore";
import { useFormsStore } from "../store/useFormStore";
import { formatDateTime } from "@/shared/utils";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Badge } from "@/shared/ui/Badge";

export function InviteRow({ invite, onOpen }: { invite: InviteSummary; onOpen: () => void }) {
  const resendInvite = useBuilderStore((s) => s.resendInvite);
  const cancelInvite = useBuilderStore((s) => s.cancelInvite);
  const fetchForms = useFormsStore((s) => s.fetchForms);
  const submitted = invite.status === "SUBMITTED";
  const [resending, setResending] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function handleResend(e: React.MouseEvent) {
    e.stopPropagation();
    setResending(true);
    try {
      const { emailErrors } = await resendInvite(invite.email);
      if (emailErrors.length > 0) {
        toast.warning(`Link refreshed but email delivery failed for ${invite.email}`);
      } else {
        toast.success(`Invite resent to ${invite.email}`);
      }
    } catch {
      toast.error("Couldn't resend the invite");
    } finally {
      setResending(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelInvite(invite.id);
      fetchForms();
      toast.success(`Invite to ${invite.email} cancelled`);
    } catch {
      toast.error("Couldn't cancel the invite");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <motion.div
      layout
      onClick={submitted ? onOpen : undefined}
      className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${submitted
          ? "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/30 cursor-pointer"
          : "border-slate-200 bg-white/60"
        }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-700">{invite.email}</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Invited {formatDateTime(invite.createdAt)}
          {submitted && invite.submittedAt && ` · Submitted ${formatDateTime(invite.submittedAt)}`}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!submitted && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={handleResend}
              disabled={resending}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-600 disabled:opacity-40 transition-colors"
              aria-label="Resend invite"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmCancel(true);
              }}
              disabled={cancelling}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40 transition-colors"
              aria-label="Cancel invite"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <Badge tone={submitted ? "emerald" : "amber"} className="shrink-0">
          {submitted ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {submitted ? "Submitted" : "Pending"}
        </Badge>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this invite?"
        description={`The link sent to ${invite.email} will stop working immediately.`}
        confirmLabel="Cancel invite"
        danger
        onConfirm={handleCancel}
      />
    </motion.div>
  );
}
