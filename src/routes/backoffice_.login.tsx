import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import fpayLogo from "@/assets/fpay-logo.png";

export const Route = createFileRoute("/backoffice_/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: "/backoffice", replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    clearError();
    await login(email, password);
    setSubmitting(false);
  };

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-gradient-to-br from-[#1864FF]/5 to-[#A855F7]/5 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxODY0RkYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative z-10 text-center max-w-md">
          <img src={fpayLogo} alt="FPay Logo" className="h-16 w-auto mx-auto mb-8" />
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Backoffice FPay</h1>
          <p className="text-slate-500 leading-relaxed">
            Administration de la plateforme FPay / Magic Stars.<br />
            Gérez les utilisateurs, les transactions et la configuration système.
          </p>
          <div className="mt-10 flex justify-center gap-8 text-sm text-slate-400">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800 font-mono">16</p>
              <p>Utilisateurs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800 font-mono">30</p>
              <p>Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800 font-mono">Live</p>
              <p>Supabase</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <img src={fpayLogo} alt="FPay Logo" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900">Backoffice FPay</h1>
          </div>

          <div className="glass-panel rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Connexion</h2>
              <p className="text-sm text-slate-400 mt-1">Identifiez-vous pour accéder au backoffice</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-5">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@fpay.mg"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-slate-50 border-slate-200 h-11"
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-50 border-slate-200 h-11"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || !email || !password}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#1864FF] to-[#A855F7] hover:from-[#1864FF]/90 hover:to-[#A855F7]/90 text-white shadow-lg shadow-[#1864FF]/20"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Connexion…
                  </span>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            FPay Backoffice v1.0.0 &mdash; Circuit fermé
          </p>
        </div>
      </div>
    </div>
  );
}
