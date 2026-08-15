"use client";

import { SideBar } from "@/features/dashboard/components/SideBar";
import { useFormsStore } from "@/features/dashboard/store/useFormStore";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { FileQuestionIcon } from "lucide-react";
import { FormHeader } from "@/features/dashboard/components/FormHeader";
import { useBuilderStore } from "@/features/dashboard/store/useBuilderStore";
import { useEffect } from "react";
import { RightPanel } from "@/features/dashboard/components/RightPanel";

export default function DashboardPage() {

  const selectedFormId = useFormsStore((s) => s.selectedFormId);
  const forms = useFormsStore((s) => s.forms);
  const loadForm = useBuilderStore((s) => s.loadForm);
  const isLoading = useBuilderStore((s) => s.isLoading);
  const clear = useBuilderStore((s) => s.clear);
  useEffect(() => {
    if (selectedFormId) {
      loadForm(selectedFormId);
    } else {
      clear();
    }
  }, [selectedFormId, loadForm, clear]);
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SideBar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-8">
          {!selectedFormId && forms.length === 0 ? (
            <EmptyState
              icon={FileQuestionIcon}
              title="Create your first form"
              description='Click "New form" in the sidebar to start building, or ask the AI panel to generate one for you.'
            />
          ) : isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-9 w-1/2" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : (
            <>
              <FormHeader />
            </>
          )}
        </div>
      </main>
      <RightPanel />
    </div>
  );
}
