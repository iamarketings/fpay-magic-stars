import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, lazy, Suspense, useEffect } from "react";
import { BackofficeLayout } from "@/components/BackofficeLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const BackofficeOverview = lazy(() => import("@/components/BackofficeOverview"));
const BackofficeUsers = lazy(() => import("@/components/BackofficeUsers"));
const BackofficeTransactions = lazy(() => import("@/components/BackofficeTransactions"));
const BackofficeReconciliation = lazy(() => import("@/components/BackofficeReconciliation"));
const BackofficeSettings = lazy(() => import("@/components/BackofficeSettings"));

type Tab = "overview" | "users" | "transactions" | "reconciliation" | "settings";

export const Route = createFileRoute("/backoffice")({
  component: BackofficePage,
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/backoffice/login", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 rounded-full border-2 border-[#1864FF] border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Vérification de votre session…</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

function BackofficePage() {
  const [tab, setTab] = useState<Tab>("overview");

  const sectionComponents: Record<Tab, React.ReactNode> = {
    overview: <BackofficeOverview />,
    users: <BackofficeUsers />,
    transactions: <BackofficeTransactions />,
    reconciliation: <BackofficeReconciliation />,
    settings: <BackofficeSettings />,
  };

  return (
    <AuthGuard>
      <BackofficeLayout tab={tab} setTab={setTab}>
        <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
          {sectionComponents[tab]}
        </Suspense>
      </BackofficeLayout>
    </AuthGuard>
  );
}
