"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store/useAuthStore";
import { toast } from "sonner";
import { getCodeFromURL } from "@/features/auth/utils";
import PageLoader from "@/shared/ui/PageLoader";
import { TopNav } from "@/features/home/components/TopNav";

export default function Home() {
  const { getUserData, isAuthenticated, loading } = useAuthStore();
  const [isOAuthChecked, setIsOAuthChecked] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = getCodeFromURL();
      if (code) {
        try {
          const result = await getUserData(code);
          if (!result) {
            toast.error("Failed to complete sign in. Please try again.");
          }
        } catch (error) {
          console.error("OAuth callback failed:", error);
          toast.error("Failed to complete sign in. Please try again.");
        } finally {
          setIsOAuthChecked(true);
        }
      } else {
        setIsOAuthChecked(true);
      }
    };

    handleOAuthCallback();
  }, [getUserData]);

  useEffect(() => {
    if (isOAuthChecked && !isAuthenticated && !loading) {
      router.push("/");
    }
  }, [isAuthenticated, loading, isOAuthChecked, router]);

  if (loading || !isOAuthChecked) {
    return <PageLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
    </div>
  );
}
