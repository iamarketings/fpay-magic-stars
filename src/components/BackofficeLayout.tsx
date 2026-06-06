import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
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

function SidebarContent({ tab, setTab, onNav }: { tab: Tab; setTab: (t: Tab) => void; onNav?: () => void }) {
  const { profile, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/backoffice/login", replace: true });
  };

  return (
    <>
      <BackofficeLogo />
      <nav className="flex-1 px-3 pt-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(n => (
          <button
            key={n.key}
            onClick={() => { setTab(n.key); onNav?.(); }}
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
          onClick={onNav}
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
    </>
  );
}

export function BackofficeLayout({ tab, setTab, children }: BackofficeLayoutProps) {
  const { error } = useBackoffice();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 text-slate-800 selection:bg-[#1864FF]/20">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-slate-200 shrink-0 rounded-none">
        <SidebarContent tab={tab} setTab={setTab} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar panel */}
          <aside className="relative w-72 max-w-[85vw] h-full glass-panel rounded-none border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent tab={tab} setTab={setTab} onNav={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="flex h-[72px] items-center justify-between px-4 md:px-8 glass-panel border-b border-slate-200 shrink-0 rounded-none">
          <div className="flex items-center gap-3 text-sm text-slate-400 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden sm:inline">Dashboard</span>
            <ChevronRight className="hidden sm:block h-3 w-3 shrink-0" />
            <span className="text-slate-900 font-bold truncate">{TAB_LABELS[tab]}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1864FF]/5 border border-[#1864FF]/10 text-[#1864FF] text-[11px] font-bold">
              <Shield className="h-3 w-3" />
              Admin
            </div>
            {error && (
              <div className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold max-w-[160px] md:max-w-none truncate">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span className="truncate">{error}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
