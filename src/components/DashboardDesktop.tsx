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
  UploadCloud
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
  // Achat
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
  // Envoi
  giftAmt: string;
  setGiftAmt: (amt: string) => void;
  recipientQuery: string;
  setRecipientQuery: (query: string) => void;
  recipientNetwork: "FPAY" | "MADASTARS";
  setRecipientNetwork: (net: "FPAY" | "MADASTARS") => void;
  giftLoading: boolean;
  handleSendGift: (e: React.FormEvent) => void;
  // Recompense
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
  tab,
  setTab,
  wallet,
  balance,
  transactions,
  activeProfile,
  handleGenerate,
  handleCopy,
  purchaseStep,
  setPurchaseStep,
  purchaseAmount,
  setPurchaseAmount,
  paymentMethod,
  setPaymentMethod,
  mmPhone,
  setMmPhone,
  purchaseLoading,
  handlePurchase,
  giftAmt,
  setGiftAmt,
  recipientQuery,
  setRecipientQuery,
  recipientNetwork,
  setRecipientNetwork,
  giftLoading,
  handleSendGift,
  rewardAmt,
  setRewardAmt,
  rewardRecipient,
  setRewardRecipient,
  rewardService,
  setRewardService,
  rewardLoading,
  handleReward,
  walletPin,
  kycStatus,
  mmOperator,
  mmNumber
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Transactions Récentes</h3>
          {limit && transactions.length > limit && (
            <button onClick={() => setTab("historique")} className="text-xs font-bold text-[#1864FF] hover:underline">Voir tout</button>
          )}
        </div>
        {txs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">Aucune transaction trouvée.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {txs.map(tx => (
              <div key={tx.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.type === "IN" || tx.type === "BUY" ? "bg-green-50 text-green-600" :
                    tx.type === "OUT" ? "bg-slate-100 text-slate-600" :
                    "bg-blue-50 text-[#1864FF]"
                  }`}>
                    {tx.type === "IN" || tx.type === "BUY" ? <ArrowDownLeft className="h-5 w-5" /> :
                     tx.type === "OUT" ? <ArrowUpRight className="h-5 w-5" /> : <Star className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {tx.type === "BUY" ? "Achat FStar" :
                       tx.type === "IN" ? "Réception" :
                       tx.type === "OUT" ? "Transfert P2P" : "Récompense"}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{tx.counterparty || "Réseau"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === "IN" || tx.type === "BUY" ? "text-green-600" : "text-slate-900"}`}>
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-[#1864FF]/20 text-slate-800">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
          <Logo />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-white">
              {activeProfile.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{activeProfile.name}</p>
              <p className="text-[10px] text-slate-500">Compte Personnel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {sideNavItems.map(n => (
            <button
              key={n.key}
              onClick={() => setTab(n.key as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === n.key ? "bg-[#1864FF] text-white shadow-md shadow-[#1864FF]/20" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              {React.cloneElement(n.icon as any, { className: "h-4 w-4" })}
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-800/50">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-green-400" />
              <span className="text-xs font-bold text-white">Réseau Ed25519</span>
            </div>
            <p className="text-[10px] text-slate-400">Connecté • Local Node</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* DESKTOP TOPBAR */}
        <header className="flex h-20 items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0">
          <h1 className="text-lg font-black text-slate-900 capitalize">
            {tab === "home" ? "Tableau de Bord" : tab}
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Rechercher une clé..." className="bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#1864FF] outline-none w-64" />
            </div>
            <button className="relative text-slate-400 hover:text-slate-600">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* -------------------- HOME -------------------- */}
            {tab === "home" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Center Column (Overview & History) */}
                <div className="lg:col-span-2 space-y-6">
                  {!wallet ? (
                     <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                       <Shield className="w-12 h-12 text-[#1864FF] mx-auto mb-4" />
                       <h2 className="text-xl font-bold text-slate-900 mb-2">Initialisation Sandbox</h2>
                       <p className="text-sm text-slate-500 mb-6">Générez une paire de clés cryptographiques Ed25519 pour commencer à tester FPay.</p>
                       <button onClick={handleGenerate} className="bg-[#1864FF] hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-sm transition-all">Générer mes clés</button>
                     </div>
                  ) : (
                    <>
                      {/* Overview Card */}
                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <img src={fstarLogo} alt="FStar Logo" className="h-10 w-10 object-contain" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Solde Disponible</span>
                          </div>
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Réseau Local</span>
                        </div>
                        <div>
                          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tabular-nums tracking-tight">
                            {balance.toLocaleString()} <span className="text-xl text-slate-400">FStar</span>
                          </h2>
                          <div className="mt-4 flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-500 truncate w-48">{wallet.publicKey}</span>
                            <button onClick={() => handleCopy(wallet.publicKey)} className="text-[#1864FF] hover:bg-blue-50 p-1.5 rounded-md transition-colors"><Copy className="h-3 w-3" /></button>
                          </div>
                        </div>
                      </div>

                      {renderTransactionList(5)}
                    </>
                  )}
                </div>

                {/* Right Column (Quick Actions - Desktop Only) */}
                <div className="lg:col-span-1">
                   <div className="bg-slate-900 rounded-xl shadow-sm text-white overflow-hidden sticky top-8">
                      <div className="px-6 py-4 border-b border-slate-800">
                        <h3 className="font-bold text-sm">Actions Rapides</h3>
                      </div>
                      <div className="p-2">
                        {actionButtons.map(a => (
                          <button key={a.key} onClick={() => setTab(a.key as Tab)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-left">
                            <div className="text-[#1864FF]">{React.cloneElement(a.icon as any, { className: "h-5 w-5" })}</div>
                            <span className="font-bold text-sm">{a.label}</span>
                            <ChevronRight className="h-4 w-4 ml-auto text-slate-600" />
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

              </div>
            )}

            {/* -------------------- OTHER TABS (Forms) -------------------- */}
            
            {tab === "historique" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-2xl font-black text-slate-900 mb-6">Historique complet</h2>
                {renderTransactionList()}
              </div>
            )}

            {tab === "profil" && (() => {
              const [revealedKey, setRevealedKey] = React.useState("");
              const nameParts = activeProfile.name.split(" ");
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";

              const handleRevealKey = () => {
                if (revealedKey) {
                  setRevealedKey("");
                  return;
                }
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
                if (enteredPin !== walletPin) {
                  toast.error("Code PIN incorrect.");
                  return;
                }

                let fn = firstName;
                let ln = lastName;
                let ph = mmNumber || "";
                let cntry = "Madagascar";

                try {
                  const savedKyc = localStorage.getItem(`fpay_kyc_${activeProfile.username}`);
                  if (savedKyc) {
                    const parsedKyc = JSON.parse(savedKyc);
                    fn = parsedKyc.firstName || fn;
                    ln = parsedKyc.lastName || ln;
                    ph = parsedKyc.phone || ph;
                    cntry = parsedKyc.country || cntry;
                  }
                } catch (e) {
                  console.error(e);
                }

                const backupData = {
                  version: "fpay-v1",
                  username: activeProfile.username,
                  email: activeProfile.email,
                  mmOperator: mmOperator || "TELMA",
                  mmNumber: mmNumber || "",
                  firstName: fn,
                  lastName: ln,
                  phone: ph,
                  country: cntry,
                  publicKey: wallet?.publicKey || "",
                  secret: wallet?.secret || "",
                  pin: walletPin
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
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                     <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="h-16 w-16 bg-blue-50 text-[#1864FF] flex items-center justify-center font-black text-2xl rounded-xl">
                           {activeProfile.avatar}
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-slate-900">{activeProfile.name}</h2>
                           <p className="text-slate-500 text-sm">{activeProfile.email}</p>
                        </div>
                     </div>

                     <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-[#1864FF]" /> Informations Personnelles</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prénom</label>
                         <input type="text" defaultValue={firstName} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#1864FF] outline-none" />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nom</label>
                         <input type="text" defaultValue={lastName} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#1864FF] outline-none" />
                       </div>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Opérateur Mobile Money</label>
                         <input type="text" readOnly value={mmOperator || "Non configuré"} className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none text-slate-500 font-bold" />
                       </div>
                       <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Numéro Mobile Money</label>
                         <input type="text" readOnly value={mmNumber || "Non configuré"} className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none text-slate-500 font-mono" />
                       </div>
                     </div>

                     <h3 className="text-sm font-bold text-slate-900 mb-4">Vérification KYC</h3>
                     <div className="space-y-3">
                       <div className="border border-green-200 bg-white rounded-lg p-3 flex justify-between items-center relative overflow-hidden">
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                         <div className="flex items-center gap-3">
                           <CheckCircle2 className="h-5 w-5 text-green-500" />
                           <div>
                             <p className="text-sm font-bold text-slate-900">Niveau 1</p>
                             <p className="text-xs text-slate-500">Email validé</p>
                           </div>
                         </div>
                         <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded">Vérifié</span>
                       </div>

                       {kycStatus === "VERIFIED" ? (
                         <div className="border border-green-200 bg-white rounded-lg p-3 flex justify-between items-center relative overflow-hidden">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                           <div className="flex items-center gap-3">
                             <CheckCircle2 className="h-5 w-5 text-green-500" />
                             <div>
                               <p className="text-sm font-bold text-slate-900">Niveau 2 (Identité)</p>
                               <p className="text-xs text-slate-500">Documents validés</p>
                             </div>
                           </div>
                           <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded">Vérifié</span>
                         </div>
                       ) : (
                         <div className="border border-blue-200 bg-white rounded-lg p-3 relative overflow-hidden">
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1864FF]"></div>
                           <div className="flex justify-between items-center mb-3">
                             <div className="flex items-center gap-3">
                               <div className="h-5 w-5 bg-blue-50 text-[#1864FF] rounded flex items-center justify-center text-xs font-bold">2</div>
                               <p className="text-sm font-bold text-slate-900">Niveau 2 (Identité)</p>
                             </div>
                             <span className="text-[10px] font-bold text-[#1864FF] bg-blue-50 px-2 py-1 rounded">Requis</span>
                           </div>
                           <div className="flex gap-2">
                             <button onClick={() => toast.info("Caméra...")} className="flex-1 bg-slate-50 border border-slate-200 hover:border-[#1864FF] text-slate-700 py-2 rounded-md text-[10px] font-bold transition-colors">Scanner ID</button>
                             <button onClick={() => toast.info("Caméra...")} className="flex-1 bg-slate-50 border border-slate-200 hover:border-[#1864FF] text-slate-700 py-2 rounded-md text-[10px] font-bold transition-colors">Selfie</button>
                           </div>
                         </div>
                       )}
                     </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2"><Lock className="w-4 h-4" /> Sécurité Clé Privée</h3>
                    <div className="flex gap-2">
                      <input type={revealedKey ? "text" : "password"} value={wallet ? (revealedKey || "••••••••••••••••••••••••••••••••••••") : ""} readOnly className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs font-mono text-slate-500 outline-none" />
                      <button onClick={handleRevealKey} className="px-3 bg-slate-900 text-white font-bold text-xs rounded-md">{revealedKey ? "Masquer" : "Voir"}</button>
                    </div>
                    <button onClick={handleExportKeys} className="w-full py-2 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-[#1864FF] text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      <UploadCloud className="h-3.5 w-3.5 rotate-180" /> Exporter la sauvegarde JSON
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ACTION TABS */}
            {["acheter", "envoyer", "recompenser", "recevoir"].includes(tab) && (
               <div className="max-w-lg mx-auto">
                 <button onClick={() => setTab("home")} className="mb-4 text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1">
                   ← Retour
                 </button>
                 <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    
                    {tab === "acheter" && (
                      <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900">Acheter des FStar</h2>
                        {purchaseStep === "AMOUNT" ? (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500">Montant (FStar)</label>
                              <input type="number" min="1" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value ? parseFloat(e.target.value) : "")} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-lg font-bold focus:border-[#1864FF] outline-none" placeholder="1000" />
                            </div>
                            <button onClick={() => { if(purchaseAmount) setPurchaseStep("PAYMENT"); else toast.error("Entrez un montant"); }} className="w-full bg-[#1864FF] text-white font-bold py-3 rounded-lg shadow-sm">Continuer</button>
                          </div>
                        ) : (
                          <form onSubmit={handlePurchase} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <button type="button" onClick={() => setPaymentMethod("STRIPE")} className={`py-3 rounded-lg border text-xs font-bold ${paymentMethod === "STRIPE" ? "border-[#1864FF] bg-blue-50 text-[#1864FF]" : "border-slate-200 bg-slate-50"}`}>Carte Bancaire</button>
                              <button type="button" onClick={() => setPaymentMethod("MM")} className={`py-3 rounded-lg border text-xs font-bold ${paymentMethod === "MM" ? "border-[#1864FF] bg-blue-50 text-[#1864FF]" : "border-slate-200 bg-slate-50"}`}>Mobile Money</button>
                            </div>
                            {paymentMethod === "MM" && (
                              <div className="space-y-3">
                                <input type="tel" placeholder="N° Téléphone" value={mmPhone} onChange={e => setMmPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-[#1864FF] outline-none font-mono" />
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-[#1864FF] font-bold text-left space-y-1">
                                  <p>Opérateur détecté : {mmOperator === "TELMA" ? "Telma (Mvola)" : mmOperator === "ORANGE" ? "Orange Money" : "Airtel Money"}</p>
                                  <p className="text-[10px] text-slate-500 font-normal">
                                    {mmOperator === "TELMA" ? "Composer le #111# pour valider la transaction MVola sur votre mobile." :
                                     mmOperator === "ORANGE" ? "Composer le #144# pour valider la transaction Orange Money sur votre mobile." :
                                     "Composer le #400# pour valider la transaction Airtel Money sur votre mobile."}
                                  </p>
                                </div>
                              </div>
                            )}
                            <button type="submit" disabled={purchaseLoading || !paymentMethod} className="w-full bg-slate-900 disabled:opacity-50 text-white font-bold py-3 rounded-lg mt-4 shadow-sm">
                              {purchaseLoading ? "Paiement..." : "Payer"}
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {tab === "recevoir" && (
                      <div className="text-center space-y-6">
                        <h2 className="text-xl font-bold text-slate-900">Recevoir des FStar</h2>
                        {!wallet ? (
                          <p className="text-orange-600 text-sm font-bold">Générez vos clés d'abord.</p>
                        ) : (
                          <>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block">
                              <QrCode className="w-40 h-40 text-slate-900" strokeWidth={1} />
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3 text-left">
                              <div className="overflow-hidden">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Clé Publique</p>
                                <p className="text-xs font-mono text-slate-900 truncate w-48">{wallet.publicKey}</p>
                              </div>
                              <button onClick={() => handleCopy(wallet.publicKey)} className="text-[#1864FF] bg-blue-50 p-2 rounded-md"><Copy className="h-4 w-4" /></button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {tab === "envoyer" && (
                      <form onSubmit={handleSendGift} className="space-y-5">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Envoyer</h2>
                        <div className="grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => setRecipientNetwork("FPAY")} className={`py-2 rounded-lg border text-xs font-bold ${recipientNetwork === "FPAY" ? "border-[#1864FF] bg-blue-50 text-[#1864FF]" : "border-slate-200 bg-slate-50 text-slate-600"}`}>Réseau FPay</button>
                          <button type="button" onClick={() => setRecipientNetwork("MADASTARS")} className={`py-2 rounded-lg border text-xs font-bold ${recipientNetwork === "MADASTARS" ? "border-[#1864FF] bg-blue-50 text-[#1864FF]" : "border-slate-200 bg-slate-50 text-slate-600"}`}>MadaStars</button>
                        </div>
                        <input type="text" placeholder="Clé publique destinataire..." value={recipientQuery} onChange={e => setRecipientQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:border-[#1864FF] outline-none" />
                        <input type="number" min="1" placeholder="Montant FStar" value={giftAmt} onChange={e => setGiftAmt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-lg font-bold focus:border-[#1864FF] outline-none" />
                        <button type="submit" disabled={giftLoading || !wallet} className="w-full bg-[#1864FF] text-white font-bold py-3 rounded-lg mt-2 shadow-sm">
                          {giftLoading ? "Signature..." : "Envoyer"}
                        </button>
                      </form>
                    )}

                    {tab === "recompenser" && (
                      <form onSubmit={handleReward} className="space-y-5">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Récompenser</h2>
                        <input type="text" placeholder="Clé publique du membre..." value={rewardRecipient} onChange={e => setRewardRecipient(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:border-[#1864FF] outline-none" />
                        <select value={rewardService} onChange={e => setRewardService(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-[#1864FF] outline-none text-slate-700">
                          <option value="">Sélectionnez le service rendu</option>
                          <option value="moderation">Modération Communautaire</option>
                          <option value="tutorat">Entraide / Tutorat</option>
                          <option value="art">Création Artistique</option>
                          <option value="dev">Développement Outils</option>
                        </select>
                        <input type="number" min="1" placeholder="Montant FStar" value={rewardAmt} onChange={e => setRewardAmt(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-lg font-bold focus:border-[#1864FF] outline-none" />
                        <button type="submit" disabled={rewardLoading || !wallet} className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg mt-2 shadow-sm">
                          {rewardLoading ? "Signature..." : "Récompenser"}
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
