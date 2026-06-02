import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useFPay } from "../hooks/use-fpay";
import {
  Shield,
  Home,
  PlusCircle,
  Send,
  Star,
  ArrowDownLeft,
  Smartphone,
  Loader2,
  Menu,
  X,
  CreditCard,
  Key,
  LogOut
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

type Tab = "home" | "acheter" | "envoyer" | "recompenser" | "sortie";

export default function Dashboard() {
  const {
    activeProfile,
    balance,
    transactions,
    wallet,
    generateWallet,
    buyFstart,
    profiles,
    transferP2P,
    rewardMember,
    externalTransfer
  } = useFPay();

  const [tab, setTab] = useState<Tab>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Acheter ---
  const [pack, setPack] = useState<{ fstart: number; eur: number } | null>(null);
  const [showStripe, setShowStripe] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  
  const [mmOp, setMmOp] = useState("Mvola");
  const [mmPhone, setMmPhone] = useState("");
  const [mmAmt, setMmAmt] = useState("");
  const [mmLoading, setMmLoading] = useState(false);

  // --- Envoyer (P2P) ---
  const [recipientQuery, setRecipientQuery] = useState("");
  const [giftAmt, setGiftAmt] = useState("");
  const [giftLoading, setGiftLoading] = useState(false);

  // --- Récompenser ---
  const [rewardRecipient, setRewardRecipient] = useState("CREATOR");
  const [rewardAmt, setRewardAmt] = useState("");
  const [rewardService, setRewardService] = useState("");
  const [rewardLoading, setRewardLoading] = useState(false);

  // --- Sortie Externe ---
  const [extAmt, setExtAmt] = useState("");
  const [extLoading, setExtLoading] = useState(false);

  // --- Handlers ---
  function handleBuyCB(e: React.FormEvent) {
    e.preventDefault();
    if (!pack) return;
    setStripeLoading(true);
    setTimeout(() => {
      buyFstart(pack.fstart, "STRIPE");
      setStripeLoading(false);
      setShowStripe(false);
      setPack(null);
    }, 1500);
  }

  function handleBuyMM(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(mmAmt);
    if (!amt || !mmPhone) { toast.error("Remplissez tous les champs."); return; }
    setMmLoading(true);
    setTimeout(() => {
      buyFstart(Math.floor(amt / 10), "MOBILE_MONEY");
      setMmLoading(false); setMmAmt(""); setMmPhone("");
    }, 1500);
  }

  function handleSendGift(e: React.FormEvent) {
    e.preventDefault();
    const fstarts = parseFloat(giftAmt);
    if (!fstarts || !recipientQuery.trim()) { toast.error("Remplissez tous les champs."); return; }
    
    setGiftLoading(true);
    setTimeout(() => {
      const query = recipientQuery.trim().toLowerCase();
      const match = Object.values(profiles).find(
        p => p.id !== activeProfile.id && p.email.toLowerCase() === query
      );

      if (match) {
        transferP2P(match.id, fstarts);
      } else {
        transferP2P("MEMBER", fstarts);
        toast.info(`Soutien envoyé vers le compte lié à ${recipientQuery.trim()}.`);
      }
      setGiftLoading(false);
      setGiftAmt("");
      setRecipientQuery("");
    }, 1500);
  }

  function handleReward(e: React.FormEvent) {
    e.preventDefault();
    const fstarts = parseFloat(rewardAmt);
    if (!fstarts || !rewardService.trim()) { toast.error("Remplissez tous les champs."); return; }
    setRewardLoading(true);
    setTimeout(() => {
      // @ts-ignore
      rewardMember(rewardRecipient, fstarts, rewardService);
      setRewardLoading(false);
      setRewardAmt("");
      setRewardService("");
    }, 1500);
  }

  function handleExternal(e: React.FormEvent) {
    e.preventDefault();
    const fstarts = parseFloat(extAmt);
    if (!fstarts) { toast.error("Entrez le montant à sortir."); return; }
    setExtLoading(true);
    setTimeout(() => {
      externalTransfer(fstarts);
      setExtLoading(false);
      setExtAmt("");
    }, 1500);
  }

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "home", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { key: "acheter", label: "Acheter", icon: <PlusCircle className="h-4 w-4" /> },
    { key: "envoyer", label: "Transférer (P2P)", icon: <Send className="h-4 w-4" /> },
    { key: "recompenser", label: "Récompenser", icon: <Star className="h-4 w-4" /> },
    { key: "sortie", label: "Sortie Externe", icon: <LogOut className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-500/30">
      
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#1864FF] to-blue-400 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5 text-white" fill="currentColor" fillOpacity={0.2} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">FPay</span>
          </Link>

          {/* Desktop tab bar */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto">
            {navItems.map(n => (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex items-center whitespace-nowrap gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  tab === n.key
                    ? "bg-white text-[#1864FF] shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full pl-1.5 pr-4 py-1.5 shadow-sm">
              <div className="h-7 w-7 rounded-full bg-blue-100 text-[#1864FF] flex items-center justify-center text-[10px] font-black uppercase">
                {activeProfile.avatar}
              </div>
              {activeProfile.name}
            </div>
            <button className="lg:hidden p-2 text-slate-400 hover:text-[#1864FF]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-2 absolute w-full shadow-xl">
            {navItems.map(n => (
              <button
                key={n.key}
                onClick={() => { setTab(n.key); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  tab === n.key ? "bg-blue-50 text-[#1864FF]" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {n.icon} {n.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-10">

        {tab === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Vue d'ensemble</h1>
                <p className="text-sm text-slate-500">Bienvenue, {activeProfile.name}.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-sm">
                {wallet ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Statut Wallet : <span className="text-green-600">Local Ed25519 (Prêt)</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    Statut Wallet : <span className="text-orange-600">Non généré</span>
                  </>
                )}
              </div>
            </div>

            {/* Wallet Gen Alert */}
            {!wallet && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <h3 className="font-bold text-orange-900 flex items-center gap-2"><Key className="h-5 w-5" /> Générer votre portefeuille cryptographique</h3>
                  <p className="text-orange-700 text-sm mt-1">Vos clés privées seront stockées de manière sécurisée uniquement sur cet appareil. Le serveur n'y a pas accès.</p>
                </div>
                <button onClick={generateWallet} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-sm transition-colors">
                  Générer (Ed25519)
                </button>
              </div>
            )}

            {/* Solde Unique FSTART */}
            <div className="bg-gradient-to-r from-[#1864FF] to-blue-500 rounded-3xl p-8 relative overflow-hidden shadow-xl text-white">
              <div className="absolute top-0 right-0 h-64 w-64 bg-blue-400 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Solde Total</span>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-6xl font-black tracking-tighter">{balance.toLocaleString()}</span>
                    <span className="text-2xl font-bold text-blue-200">FSTART</span>
                  </div>
                  <p className="text-sm text-blue-100 mt-2 font-medium">Jetons pour la communauté.</p>
                </div>
              </div>
            </div>

            {/* Transaction Ledger */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Registre des Transactions</h2>
                </div>
                <div className="h-8 px-3 rounded-lg bg-slate-100 border border-slate-200 flex items-center text-xs font-bold text-slate-500">
                  {transactions.length} Tx
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">Le registre est vide.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-6 px-8 py-5 hover:bg-slate-50 transition-colors">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        tx.amount > 0 ? "bg-green-50 border-green-100 text-green-600" : "bg-blue-50 border-blue-100 text-blue-600"
                      }`}>
                        {tx.amount > 0 ? <ArrowDownLeft className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{tx.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{tx.type}</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`text-base font-black tracking-tight ${tx.amount > 0 ? "text-green-600" : "text-slate-900"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount} FSTART
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "acheter" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Acheter des FSTART</h1>
              <p className="text-sm text-slate-500 mt-2">Rechargez votre compte FPay (Cash-In).</p>
            </div>

            {/* STRIPE PAYMENT */}
            <div className="space-y-5">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#1864FF]" /> Paiement CB (Stripe)
              </h2>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: "Pack Débutant", fstart: 50, eur: 5 },
                  { label: "Pack Populaire", fstart: 120, eur: 10, popular: true },
                  { label: "Pack Avancé", fstart: 300, eur: 25 },
                ].map(p => (
                  <div key={p.label} className={`bg-white border rounded-2xl p-6 flex flex-col justify-between relative transition-shadow hover:shadow-md ${
                    p.popular ? "border-[#1864FF] ring-2 ring-blue-50 shadow-sm" : "border-slate-200"
                  }`}>
                    {p.popular && (
                      <div className="absolute -top-3 inset-x-0 flex justify-center">
                        <span className="bg-[#1864FF] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Populaire</span>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{p.label}</span>
                      <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tighter">{p.fstart} <span className="text-lg">FSTART</span></h3>
                    </div>
                    <div className="mt-8">
                      <p className="text-xl font-bold text-[#1864FF] mb-4">{p.eur}.00 €</p>
                      <button
                        onClick={() => { setPack({ fstart: p.fstart, eur: p.eur }); setShowStripe(true); }}
                        className={`w-full font-bold text-sm rounded-xl py-3.5 transition-colors ${
                          p.popular ? "bg-[#1864FF] hover:bg-blue-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                        }`}
                      >
                        Sélectionner
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Money */}
            <div className="space-y-5 pt-8 border-t border-slate-200">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#1864FF]" /> Mobile Money
              </h2>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl shadow-sm">
                <form onSubmit={handleBuyMM} className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    {["Mvola", "Orange", "Airtel"].map(op => (
                      <button key={op} type="button" onClick={() => setMmOp(op)}
                        className={`py-3 text-xs font-bold rounded-xl border transition-all ${
                          mmOp === op ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}>
                        {op}
                      </button>
                    ))}
                  </div>
                  <input type="tel" placeholder="Numéro (ex: 034...)" value={mmPhone} onChange={e => setMmPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:border-[#1864FF] focus:bg-white outline-none transition-colors" />
                  <input type="number" placeholder="Montant en Ar" value={mmAmt} onChange={e => setMmAmt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:border-[#1864FF] focus:bg-white outline-none transition-colors" />
                  
                  <button type="submit" disabled={mmLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-4 transition-colors flex items-center justify-center gap-2">
                    {mmLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initier le paiement"}
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Stripe */}
            {showStripe && pack && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                  <button onClick={() => setShowStripe(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Paiement Sécurisé</h3>
                  <div className="bg-slate-50 rounded-2xl p-5 mb-6 flex justify-between items-center border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total</p>
                      <p className="text-2xl font-black text-slate-900">{pack.eur}.00 €</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Réception</p>
                      <p className="text-lg font-bold text-[#1864FF]">{pack.fstart} FSTART</p>
                    </div>
                  </div>
                  <form onSubmit={handleBuyCB} className="space-y-4">
                    <input type="text" placeholder="Numéro de carte" required className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none" />
                    <div className="flex gap-4">
                      <input type="text" placeholder="MM/AA" required className="w-1/2 bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none" />
                      <input type="text" placeholder="CVC" required className="w-1/2 bg-white border border-slate-300 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none" />
                    </div>
                    <button type="submit" disabled={stripeLoading} className="w-full bg-[#1864FF] hover:bg-blue-700 text-white font-bold text-sm rounded-xl py-3.5 mt-4 transition-colors flex justify-center items-center">
                      {stripeLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Payer ${pack.eur}.00 €`}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "envoyer" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transférer (P2P)</h1>
              <p className="text-sm text-slate-500 mt-2">Envoyez des FSTART directement à un autre membre.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl shadow-sm overflow-hidden">
              <form onSubmit={handleSendGift} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Destinataire (Email)</label>
                  <input
                    type="text"
                    placeholder="Email du membre"
                    value={recipientQuery}
                    onChange={e => setRecipientQuery(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Montant (FSTART)</label>
                  <input type="number" placeholder="ex: 50" value={giftAmt} onChange={e => setGiftAmt(e.target.value)} required min={1} max={balance}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none transition-colors" />
                </div>

                <button type="submit" disabled={giftLoading}
                  className="w-full bg-[#1864FF] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-4 transition-colors shadow-sm flex items-center justify-center gap-2">
                  {giftLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Signer et Envoyer (Ed25519)"}
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === "recompenser" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Récompenser</h1>
              <p className="text-sm text-slate-500 mt-2">Rémunérez un membre pour un service rendu à la communauté FPay.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl shadow-sm overflow-hidden p-8">
              <form onSubmit={handleReward} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Membre à récompenser</label>
                  <select value={rewardRecipient} onChange={e => setRewardRecipient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none">
                    {Object.values(profiles).filter(p => p.id !== activeProfile.id).map(p => (
                       <option key={p.id} value={p.id}>{p.name} - {p.role}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Service rendu</label>
                  <input type="text" placeholder="ex: Création d'illustration, modération, etc." value={rewardService} onChange={e => setRewardService(e.target.value)} required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Montant de la récompense</label>
                  <input type="number" placeholder="Montant en FSTART" value={rewardAmt} onChange={e => setRewardAmt(e.target.value)} required max={balance}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none transition-colors" />
                </div>
                <button type="submit" disabled={rewardLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-4 transition-colors flex items-center justify-center gap-2">
                  {rewardLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Signer et Récompenser (Ed25519)"}
                </button>
              </form>
            </div>
          </div>
        )}

        {tab === "sortie" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sortie Externe</h1>
                <p className="text-sm text-slate-500 mt-2">Poussez vos FSTART hors du système (Aucune conversion cash).</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-xl">
               <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
                 <Shield className="h-5 w-5 shrink-0 mt-0.5" />
                 <p>Cette action est définitive et expulsera vos jetons de la plateforme vers un environnement externe. Ce système n'est pas un retrait en espèces.</p>
               </div>
               
               <form onSubmit={handleExternal} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">FSTART à Sortir</label>
                    <input type="number" placeholder="Montant à expulser" value={extAmt} onChange={e => setExtAmt(e.target.value)} required max={balance}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none transition-colors" />
                  </div>
                  <button type="submit" disabled={extLoading}
                    className="w-full bg-[#1864FF] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-4 transition-colors flex items-center justify-center gap-2">
                    {extLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmer la Sortie (Ed25519)"}
                  </button>
               </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
