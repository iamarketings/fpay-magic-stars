import React from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Shield,
  Send,
  History,
  User,
  PlusCircle,
  QrCode,
  Star,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Copy,
  Lock,
  ChevronRight,
  Search,
  Bell,
  Sparkles,
  Eye,
  EyeOff,
  Download,
  Camera,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import fstarLogo from "@/assets/fstar-logo.png";
import fpayLogo from "@/assets/fpay-logo.png";

type Transaction = {
  id: string;
  type: "IN" | "OUT" | "REWARD" | "BUY";
  amount: number;
  date: string;
  counterparty?: string;
  status: "COMPLETED" | "PENDING";
};

type Tab = "home" | "historique" | "profil" | "acheter" | "recevoir" | "envoyer" | "recompenser";

interface DashboardDesktopProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
  wallet: any;
  balance: number;
  transactions: Transaction[];
  activeProfile: {
    name: string;
    email: string;
    avatar: string;
    username: string;
  };
  handleGenerate: () => void;
  handleCopy: (text: string) => void;
  purchaseStep: "AMOUNT" | "PAYMENT";
  setPurchaseStep: (step: "AMOUNT" | "PAYMENT") => void;
  purchaseAmount: number | "";
  setPurchaseAmount: (amt: number | "") => void;
  paymentMethod: "STRIPE" | "MM" | null;
  setPaymentMethod: (method: "STRIPE" | "MM" | null) => void;
  mmPhone: string;
  setMmPhone: (phone: string) => void;
  purchaseLoading: boolean;
  handlePurchase: (e: React.FormEvent) => void;
  giftAmt: string;
  setGiftAmt: (amt: string) => void;
  recipientQuery: string;
  setRecipientQuery: (query: string) => void;
  recipientNetwork: "FPAY" | "MADASTARS";
  setRecipientNetwork: (net: "FPAY" | "MADASTARS") => void;
  giftLoading: boolean;
  handleSendGift: (e: React.FormEvent) => void;
  rewardAmt: string;
  setRewardAmt: (amt: string) => void;
  rewardRecipient: string;
  setRewardRecipient: (rec: string) => void;
  rewardService: string;
  setRewardService: (srv: string) => void;
  rewardLoading: boolean;
  handleReward: (e: React.FormEvent) => void;
  walletPin: string;
  kycStatus: "NONE" | "VERIFIED";
  mmOperator?: "TELMA" | "ORANGE" | "AIRTEL";
  mmNumber?: string;
}

function Logo() {
  return (
    <Link to="/" className="flex items-center group">
      <img src={fpayLogo} alt="FPay Logo" className="h-8 w-auto rounded-lg shadow-sm group-hover:opacity-90 transition-opacity" />
    </Link>
  );
}

export function DashboardDesktop({
  tab, setTab, wallet, balance, transactions, activeProfile,
  handleGenerate, handleCopy,
  purchaseStep, setPurchaseStep, purchaseAmount, setPurchaseAmount,
  paymentMethod, setPaymentMethod, mmPhone, setMmPhone, purchaseLoading, handlePurchase,
  giftAmt, setGiftAmt, recipientQuery, setRecipientQuery,
  recipientNetwork, setRecipientNetwork, giftLoading, handleSendGift,
  rewardAmt, setRewardAmt, rewardRecipient, setRewardRecipient,
  rewardService, setRewardService, rewardLoading, handleReward,
  walletPin, kycStatus, mmOperator, mmNumber
}: DashboardDesktopProps) {
  const actionButtons = [
    { key: "acheter", label: "Achat", icon: <PlusCircle /> },
    { key: "recevoir", label: "Recevoir", icon: <QrCode /> },
    { key: "envoyer", label: "Envoi", icon: <Send /> },
    { key: "recompenser", label: "Récompenser", icon: <Star /> },
  ];

  const sideNavItems = [
    { key: "home", label: "Tableau de Bord", icon: <Activity /> },
    { key: "historique", label: "Historique", icon: <History /> },
    { key: "profil", label: "Profil & KYC", icon: <User /> },
  ];

  const renderTransactionList = (limit?: number) => {
    const txs = limit ? transactions.slice(0, limit) : transactions;
    return (
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/60 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm">Transactions Récentes</h3>
          {limit && transactions.length > limit && (
            <button onClick={() => setTab("historique")} className="text-xs font-bold text-[#1864FF] hover:text-[#A855F7] transition-colors">Voir tout</button>
          )}
        </div>
        {txs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Aucune transaction trouvée.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {txs.map(tx => (
              <div key={tx.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === "IN" || tx.type === "BUY" ? "bg-emerald-50 text-emerald-600" :
                    tx.type === "OUT" ? "bg-slate-100 text-slate-500" :
                    "bg-blue-50 text-[#1864FF]"
                  }`}>
                    {tx.type === "IN" || tx.type === "BUY" ? <ArrowDownLeft className="h-5 w-5" /> :
                     tx.type === "OUT" ? <ArrowUpRight className="h-5 w-5" /> : <Star className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-slate-700 transition-colors">
                      {tx.type === "BUY" ? "Achat FStar" :
                       tx.type === "IN" ? "Réception" :
                       tx.type === "OUT" ? "Transfert P2P" : "Récompense"}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{tx.counterparty || "Réseau"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === "IN" || tx.type === "BUY" ? "text-emerald-600" : "text-slate-900"}`}>
                    {tx.type === "IN" || tx.type === "BUY" ? "+" : "-"}{tx.amount} FStar
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProfilTab = () => {
    const [revealedKey, setRevealedKey] = React.useState("");
    const nameParts = activeProfile.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const handleRevealKey = () => {
      if (revealedKey) { setRevealedKey(""); return; }
      const enteredPin = prompt("Saisissez votre code PIN à 6 chiffres pour déverrouiller la clé privée :");
      if (enteredPin === walletPin) {
        setRevealedKey(wallet?.secret || "");
        toast.success("Clé privée déverrouillée !");
      } else {
        toast.error("Code PIN incorrect.");
      }
    };

    const handleExportKeys = () => {
      const enteredPin = prompt("Saisissez votre code PIN à 6 chiffres pour autoriser l'exportation :");
      if (enteredPin !== walletPin) { toast.error("Code PIN incorrect."); return; }

      let fn = firstName, ln = lastName, ph = mmNumber || "", cntry = "Madagascar";
      try {
        const savedKyc = localStorage.getItem(`fpay_kyc_${activeProfile.username}`);
        if (savedKyc) {
          const parsedKyc = JSON.parse(savedKyc);
          fn = parsedKyc.firstName || fn; ln = parsedKyc.lastName || ln;
          ph = parsedKyc.phone || ph; cntry = parsedKyc.country || cntry;
        }
      } catch (e) { console.error(e); }

      const backupData = {
        version: "fpay-v1", username: activeProfile.username, email: activeProfile.email,
        mmOperator: mmOperator || "TELMA", mmNumber: mmNumber || "",
        firstName: fn, lastName: ln, phone: ph, country: cntry,
        publicKey: wallet?.publicKey || "", secret: wallet?.secret || "", pin: walletPin
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `fpay_backup_${activeProfile.username}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Sauvegarde exportée avec succès ! Gardez ce fichier en lieu sûr.");
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 max-w-2xl">
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200/60">
            <div className="h-16 w-16 bg-gradient-to-br from-[#1864FF]/10 to-[#A855F7]/10 text-[#1864FF] flex items-center justify-center font-black text-2xl rounded-xl ring-2 ring-slate-100">
              {activeProfile.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{activeProfile.name}</h2>
              <p className="text-slate-500 text-sm">{activeProfile.email}</p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#1864FF]" /> Informations Personnelles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prénom</label>
              <input type="text" defaultValue={firstName} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#1864FF] outline-none transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nom</label>
              <input type="text" defaultValue={lastName} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:border-[#1864FF] outline-none transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Opérateur Mobile Money</label>
              <input type="text" readOnly value={mmOperator || "Non configuré"} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none text-slate-500 font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Numéro Mobile Money</label>
              <input type="text" readOnly value={mmNumber || "Non configuré"} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none text-slate-500 font-mono" />
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" /> Vérification KYC
          </h3>
          <div className="space-y-3">
            <KycLevelBadge
              level="Niveau 1"
              sub="Email validé"
              verified={true}
            />
            {kycStatus === "VERIFIED" ? (
              <KycLevelBadge
                level="Niveau 2 (Identité)"
                sub="Documents validés"
                verified={true}
              />
            ) : (
              <div className="glass-panel rounded-lg p-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-blue-50 text-[#1864FF] rounded flex items-center justify-center text-xs font-bold">2</div>
                    <p className="text-sm font-bold text-slate-900">Niveau 2 (Identité)</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#1864FF] bg-blue-50 px-2 py-1 rounded-full border border-blue-200">Requis</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toast.info("Caméra...")} className="flex-1 bg-white border border-slate-200 hover:border-[#1864FF] text-slate-600 hover:text-[#1864FF] py-2 rounded-lg text-[10px] font-bold transition-all hover:bg-blue-50 flex items-center justify-center gap-1.5">
                    <Camera className="h-3 w-3" /> Scanner ID
                  </button>
                  <button onClick={() => toast.info("Caméra...")} className="flex-1 bg-white border border-slate-200 hover:border-[#1864FF] text-slate-600 hover:text-[#1864FF] py-2 rounded-lg text-[10px] font-bold transition-all hover:bg-blue-50 flex items-center justify-center gap-1.5">
                    <Camera className="h-3 w-3" /> Selfie
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-[#A855F7]" /> Sécurité Clé Privée
          </h3>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center">
              <span className="font-mono text-xs text-slate-400 truncate flex-1">
                {wallet ? (revealedKey || "••••••••••••••••••••••••••••••••••••••••") : ""}
              </span>
              <button onClick={handleRevealKey} className="text-slate-400 hover:text-slate-600 transition-all hover:scale-110 active:scale-95 p-1">
                {revealedKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button onClick={handleExportKeys} className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer group">
            <Download className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            Exporter la sauvegarde JSON
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 font-sans selection:bg-[#1864FF]/20 text-slate-600">

      {/* SIDEBAR */}
      <aside className="flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <Logo />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-[#1864FF]/10 to-[#A855F7]/10 rounded-xl flex items-center justify-center font-bold text-[#1864FF] ring-1 ring-slate-200">
              {activeProfile.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{activeProfile.name}</p>
              <p className="text-[10px] text-slate-400">Compte Personnel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {sideNavItems.map(n => (
            <button
              key={n.key}
              onClick={() => setTab(n.key as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === n.key
                  ? "bg-gradient-to-r from-[#1864FF] to-[#A855F7] text-white shadow-md"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {React.cloneElement(n.icon as any, { className: "h-4 w-4" })}
              {n.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-3 ring-1 ring-slate-200/60">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-900">Réseau Ed25519</span>
            </div>
            <p className="text-[10px] text-slate-400">Connecté • Local Node</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* TOPBAR */}
        <header className="relative flex h-20 items-center justify-between px-8 border-b border-slate-200/60 shrink-0 rounded-none z-10 bg-white/80 backdrop-blur-xl">
          <h1 className="text-lg font-black text-slate-900 capitalize">
            {tab === "home" ? "Tableau de Bord" : tab === "acheter" ? "Achat FStar" : tab === "envoyer" ? "Envoi" : tab === "recompenser" ? "Récompenser" : tab}
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Rechercher une clé..." className="bg-slate-100 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#1864FF] outline-none w-64 text-slate-600 placeholder-slate-400 transition-all duration-300 focus:bg-white" />
            </div>
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-gradient-to-br from-red-400 to-red-600 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-5xl mx-auto">

            {/* HOME */}
            {tab === "home" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">
                  {!wallet ? (
                     <div className="glass-panel rounded-xl p-8 text-center">
                       <Shield className="w-12 h-12 text-[#1864FF] mx-auto mb-4" />
                       <h2 className="text-xl font-bold text-slate-900 mb-2">Initialisation Sandbox</h2>
                       <p className="text-sm text-slate-500 mb-6">Générez une paire de clés cryptographiques Ed25519 pour commencer à tester FPay.</p>
                       <button onClick={handleGenerate} className="bg-gradient-to-r from-[#1864FF] to-[#A855F7] hover:from-[#1864FF]/90 hover:to-[#A855F7]/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#1864FF]/20 transition-all duration-300 hover:scale-105 active:scale-95">
                         Générer mes clés
                       </button>
                     </div>
                  ) : (
                    <>
                      {/* Balance Card */}
                      <div className="premium-card rounded-xl p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <img src={fstarLogo} alt="FStar Logo" className="h-10 w-10 object-contain" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Solde Disponible</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">Réseau Local</span>
                        </div>
                        <div>
                          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tabular-nums tracking-tight">
                            {balance.toLocaleString()} <span className="text-xl text-slate-400 font-bold">FStar</span>
                          </h2>
                          <div className="mt-4 flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400 truncate w-48">{wallet.publicKey}</span>
                            <button onClick={() => handleCopy(wallet.publicKey)} className="text-[#1864FF] hover:bg-blue-50 p-1.5 rounded-md transition-colors"><Copy className="h-3 w-3" /></button>
                          </div>
                        </div>
                      </div>

                      {renderTransactionList(5)}
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-1">
                   <div className="glass-panel rounded-xl overflow-hidden sticky top-8">
                      <div className="px-6 py-4 border-b border-slate-200/60">
                        <h3 className="font-bold text-sm text-slate-900">Actions Rapides</h3>
                      </div>
                      <div className="p-2">
                        {actionButtons.map(a => (
                          <button key={a.key} onClick={() => setTab(a.key as Tab)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-all duration-200 text-left group">
                            <div className="text-[#1864FF] group-hover:scale-110 transition-transform">{React.cloneElement(a.icon as any, { className: "h-5 w-5" })}</div>
                            <span className="font-bold text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{a.label}</span>
                            <ChevronRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-slate-400 transition-colors" />
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

              </div>
            )}

            {/* HISTORIQUE */}
            {tab === "historique" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 text-[#1864FF]" />
                  <h2 className="text-2xl font-black text-slate-900">Historique complet</h2>
                </div>
                {renderTransactionList()}
              </div>
            )}

            {/* PROFIL */}
            {tab === "profil" && renderProfilTab()}

            {/* ACTION TABS */}
            {["acheter", "envoyer", "recompenser", "recevoir"].includes(tab) && (
              <div className="max-w-lg mx-auto">
                <button
                  onClick={() => setTab("home")}
                  className="mb-4 text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  Retour
                </button>
                <div className="glass-panel rounded-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-2">

                  {/* ACHAT */}
                  {tab === "acheter" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <PlusCircle className="h-5 w-5 text-[#1864FF]" />
                        <h2 className="text-xl font-bold text-slate-900">Acheter des FStar</h2>
                      </div>
                      {purchaseStep === "AMOUNT" ? (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500">Montant (FStar)</label>
                            <div className="relative">
                              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input type="number" min="1" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value ? parseFloat(e.target.value) : "")} className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-lg font-bold text-slate-900 focus:border-[#1864FF] outline-none transition-colors" placeholder="1000" />
                            </div>
                          </div>
                          <button
                            onClick={() => { if(purchaseAmount) setPurchaseStep("PAYMENT"); else toast.error("Entrez un montant"); }}
                            className="w-full bg-gradient-to-r from-[#1864FF] to-[#A855F7] hover:from-[#1864FF]/90 hover:to-[#A855F7]/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#1864FF]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                          >
                            Continuer
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handlePurchase} className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setPaymentMethod("STRIPE")} className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                              paymentMethod === "STRIPE"
                                ? "border-[#1864FF] bg-blue-50 text-[#1864FF]"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            }`}>
                              Carte Bancaire
                            </button>
                            <button type="button" onClick={() => setPaymentMethod("MM")} className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                              paymentMethod === "MM"
                                ? "border-[#1864FF] bg-blue-50 text-[#1864FF]"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            }`}>
                              Mobile Money
                            </button>
                          </div>
                          {paymentMethod === "MM" && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                              <input type="tel" placeholder="N° Téléphone" value={mmPhone} onChange={e => setMmPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-[#1864FF] outline-none transition-colors font-mono" />
                              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-[#1864FF] font-bold space-y-1">
                                <p>Opérateur détecté : {mmOperator === "TELMA" ? "Telma (Mvola)" : mmOperator === "ORANGE" ? "Orange Money" : "Airtel Money"}</p>
                                <p className="text-[10px] text-slate-500 font-normal">
                                  {mmOperator === "TELMA" ? "Composer le #111# pour valider la transaction MVola sur votre mobile." :
                                   mmOperator === "ORANGE" ? "Composer le #144# pour valider la transaction Orange Money sur votre mobile." :
                                   "Composer le #400# pour valider la transaction Airtel Money sur votre mobile."}
                                </p>
                              </div>
                            </div>
                          )}
                          <button type="submit" disabled={purchaseLoading || !paymentMethod} className="w-full bg-gradient-to-r from-[#1864FF] to-[#A855F7] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#1864FF]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100">
                            {purchaseLoading ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Paiement...
                              </span>
                            ) : "Payer"}
                          </button>
                        </form>
                      )}
                    </div>
                  )}

                  {/* RECEVOIR */}
                  {tab === "recevoir" && (
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center gap-3">
                        <QrCode className="h-5 w-5 text-[#1864FF]" />
                        <h2 className="text-xl font-bold text-slate-900">Recevoir des FStar</h2>
                      </div>
                      {!wallet ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="text-amber-700 text-sm font-bold">Générez vos clés d'abord.</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-6 rounded-xl border border-slate-200 inline-block shadow-sm">
                            <QrCode className="w-40 h-40 text-slate-800" strokeWidth={1} />
                          </div>
                          <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-3 text-left shadow-sm">
                            <div className="overflow-hidden">
                              <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Clé Publique</p>
                              <p className="text-xs font-mono text-slate-800 truncate w-48">{wallet.publicKey}</p>
                            </div>
                            <button onClick={() => handleCopy(wallet.publicKey)} className="text-[#1864FF] bg-blue-50 p-2.5 rounded-lg hover:bg-blue-100 transition-all hover:scale-110 active:scale-95">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ENVOYER */}
                  {tab === "envoyer" && (
                    <form onSubmit={handleSendGift} className="space-y-5">
                      <div className="flex items-center gap-3">
                        <Send className="h-5 w-5 text-[#1864FF]" />
                        <h2 className="text-xl font-bold text-slate-900">Envoyer des FStar</h2>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setRecipientNetwork("FPAY")} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          recipientNetwork === "FPAY"
                            ? "border-[#1864FF] bg-blue-50 text-[#1864FF]"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}>
                          Réseau FPay
                        </button>
                        <button type="button" onClick={() => setRecipientNetwork("MADASTARS")} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          recipientNetwork === "MADASTARS"
                            ? "border-[#1864FF] bg-blue-50 text-[#1864FF]"
                            : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                        }`}>
                          MadaStars
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Clé publique du destinataire</label>
                        <input type="text" placeholder="Clé publique..." value={recipientQuery} onChange={e => setRecipientQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 font-mono focus:border-[#1864FF] outline-none transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Montant (FStar)</label>
                        <input type="number" min="1" placeholder="Montant" value={giftAmt} onChange={e => setGiftAmt(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-lg font-bold text-slate-900 focus:border-[#1864FF] outline-none transition-colors" />
                      </div>
                      <button type="submit" disabled={giftLoading || !wallet} className="w-full bg-gradient-to-r from-[#1864FF] to-[#A855F7] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#1864FF]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100 flex items-center justify-center gap-2">
                        {giftLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Signature...
                          </span>
                        ) : (
                          <><Send className="h-4 w-4" /> Envoyer</>
                        )}
                      </button>
                    </form>
                  )}

                  {/* RECOMPENSER */}
                  {tab === "recompenser" && (
                    <form onSubmit={handleReward} className="space-y-5">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-[#1864FF]" />
                        <h2 className="text-xl font-bold text-slate-900">Récompenser un Membre</h2>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Clé publique du membre</label>
                        <input type="text" placeholder="Clé publique..." value={rewardRecipient} onChange={e => setRewardRecipient(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 font-mono focus:border-[#1864FF] outline-none transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Service rendu</label>
                        <select value={rewardService} onChange={e => setRewardService(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-[#1864FF] outline-none transition-colors">
                          <option value="">Sélectionnez le service rendu</option>
                          <option value="moderation">Modération Communautaire</option>
                          <option value="tutorat">Entraide / Tutorat</option>
                          <option value="art">Création Artistique</option>
                          <option value="dev">Développement Outils</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Montant (FStar)</label>
                        <input type="number" min="1" placeholder="Montant" value={rewardAmt} onChange={e => setRewardAmt(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-lg font-bold text-slate-900 focus:border-[#1864FF] outline-none transition-colors" />
                      </div>
                      <button type="submit" disabled={rewardLoading || !wallet} className="w-full bg-gradient-to-r from-[#1864FF] to-[#A855F7] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#1864FF]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:hover:scale-100 flex items-center justify-center gap-2">
                        {rewardLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Signature...
                          </span>
                        ) : (
                          <><Sparkles className="h-4 w-4" /> Récompenser</>
                        )}
                      </button>
                    </form>
                  )}

                </div>
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
}

function KycLevelBadge({ level, sub, verified }: { level: string; sub: string; verified: boolean }) {
  return (
    <div className="glass-panel rounded-lg p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <CheckCircle2 className={`h-5 w-5 ${verified ? "text-emerald-500" : "text-slate-300"}`} />
        <div>
          <p className="text-sm font-bold text-slate-900">{level}</p>
          <p className="text-xs text-slate-500">{sub}</p>
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
        verified
          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
          : "text-slate-400 bg-slate-50 border-slate-200"
      }`}>
        {verified ? "Vérifié" : "En attente"}
      </span>
    </div>
  );
}
