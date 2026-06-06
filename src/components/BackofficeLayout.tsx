import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Settings,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  LogOut,
  Shield,
  Smartphone,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useBackoffice } from "@/hooks/use-backoffice";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import fpayLogo from "@/assets/fpay-logo.png";

type Tab = "overview" | "users" | "transactions" | "reconciliation" | "settings";

interface BackofficeLayoutProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Aperçu", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "users", label: "Utilisateurs", icon: <Users className="h-4 w-4" /> },
  { key: "transactions", label: "Transactions", icon: <ArrowLeftRight className="h-4 w-4" /> },
  { key: "reconciliation", label: "Réconciliation", icon: <Smartphone className="h-4 w-4" /> },
  { key: "settings", label: "Paramètres", icon: <Settings className="h-4 w-4" /> },
];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Aperçu",
  users: "Utilisateurs",
  transactions: "Transactions",
  reconciliation: "Réconciliation Mobile Money",
  settings: "Paramètres",
};

function BackofficeLogo() {
  return (
    <Link to="/backoffice" className="flex items-center gap-3 px-5 h-[72px] border-b border-slate-200">
      <img src={fpayLogo} alt="FPay Logo" className="h-9 w-auto" />
      <div>
        <p className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">FPay</p>
        <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Backoffice</p>
      </div>
    </Link>
  );
}

export function BackofficeLayout({ tab, setTab, children }: BackofficeLayoutProps) {
  const { error } = useBackoffice();
  const { profile, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/backoffice/login", replace: true });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 text-slate-800 selection:bg-[#1864FF]/20">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 glass-panel border-r border-slate-200 shrink-0 rounded-none">
        <BackofficeLogo />
        <nav className="flex-1 px-3 pt-6 space-y-1">
          {NAV_ITEMS.map(n => (
            <button
              key={n.key}
              onClick={() => setTab(n.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                tab === n.key
                  ? "bg-gradient-to-r from-[#1864FF] to-[#A855F7] text-white shadow-lg shadow-[#1864FF]/20"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-3 space-y-2">
          {/* Admin profile */}
          {profile && (
            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#1864FF] to-[#A855F7] flex items-center justify-center text-white text-xs font-bold">
                  {profile.firstName[0]}{profile.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{profile.firstName} {profile.lastName}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Administrateur</p>
                </div>
              </div>
            </div>
          )}
          <Separator className="bg-slate-200" />
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard Principal
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="flex h-[72px] items-center justify-between px-8 glass-panel border-b border-slate-200 shrink-0 rounded-none">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 font-bold">{TAB_LABELS[tab]}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1864FF]/5 border border-[#1864FF]/10 text-[#1864FF] text-[11px] font-bold">
              <Shield className="h-3 w-3" />
              Admin
            </div>
            {error && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
