"use client"
import { Button } from "@/shared/ui/Button";
import { useBuilderStore } from "../store/useBuilderStore";
import { MailIcon, UserPlus } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { InviteRow } from "./InviteRow";
import { InviteModal } from "./InviteModal";
import { SubmissionModal } from "./SubmissionModal";

export function InviteList() {
    const form = useBuilderStore((s) => s.form);
    const invites = useBuilderStore((s) => s.invites);

    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [openInviteId, setOpenInviteId] = useState<string | null>(null);

    if (!form || form.status !== "PUBLISHED") return null;
    return (
        <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">
                    Invites {invites.length > 0 && <span className="text-slate-400 font-normal">({invites.length})</span>}
                </h3>
                <Button variant="outline" size="sm" onClick={() => setInviteModalOpen(true)}>
                    <UserPlus className="h-3.5 w-3.5" />
                    Invite people
                </Button>
            </div>

            {invites.length === 0 ? (
                <EmptyState
                    icon={MailIcon}
                    title="No one invited yet"
                    description="Invite people by email and track who has submitted the form."
                    action={
                        <Button variant="primary" size="sm" onClick={() => setInviteModalOpen(true)}>
                            <UserPlus className="h-3.5 w-3.5" />
                            Invite people
                        </Button>
                    }
                />
            ) : (
                <div className="flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                        {invites.map((invite) => (
                            <InviteRow key={invite.id} invite={invite} onOpen={() => setOpenInviteId(invite.id)} />
                        ))}
                    </AnimatePresence>
                </div>
            )}


            <InviteModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} />
            <SubmissionModal formId={form.id} inviteId={openInviteId} onOpenChange={(open) => !open && setOpenInviteId(null)} />
        </div>
    );
}