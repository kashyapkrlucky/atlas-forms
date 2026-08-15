"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/shared/ui/Modal";
import { Textarea } from "@/shared/ui/Input";
import { Button } from "@/shared/ui/Button";
import { useBuilderStore } from "../store/useBuilderStore";
import { useFormsStore } from "../store/useFormStore";

function parseEmails(raw: string) {
  return [...new Set(raw.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

export function InviteModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const sendInvites = useBuilderStore((s) => s.sendInvites);
  const fetchForms = useFormsStore((s) => s.fetchForms);
  const [raw, setRaw] = useState("");
  const [sending, setSending] = useState(false);

  const emails = parseEmails(raw);
  const invalid = emails.filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

  async function handleSend() {
    if (emails.length === 0 || invalid.length > 0) return;
    setSending(true);
    try {
      const result = await sendInvites(emails);
      const sentCount = result.created.length;
      const skippedCount = result.skipped.length;
      const failedCount = result.emailErrors.length;
      const deliveredCount = sentCount - failedCount;
      if (deliveredCount > 0) toast.success(`Invited ${deliveredCount} ${deliveredCount === 1 ? "person" : "people"}`);
      if (skippedCount > 0) toast.info(`${skippedCount} already submitted and were skipped`);
      if (failedCount > 0) {
        toast.warning(
          `Link${failedCount === 1 ? "" : "s"} created but email delivery failed for: ${result.emailErrors.join(", ")}. Check the Brevo sender configuration.`,
          { duration: 8000 }
        );
      }
      fetchForms();
      setRaw("");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't send invites");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Invite people"
      description="Each person gets a unique link that stops working once they submit."
    >
      <Textarea
        autoFocus
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="alice@example.com, bob@example.com"
        rows={4}
      />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          {emails.length > 0 && `${emails.length} ${emails.length === 1 ? "email" : "emails"}`}
        </span>
        {invalid.length > 0 && <span className="text-rose-500">Invalid: {invalid.join(", ")}</span>}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="primary" disabled={emails.length === 0 || invalid.length > 0 || sending} onClick={handleSend}>
          {sending ? "Sending..." : "Send invites"}
        </Button>
      </div>
    </Modal>
  );
}
