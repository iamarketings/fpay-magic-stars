import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useFPay } from "../hooks/use-fpay";
import {
  Shield, CreditCard, Send, ArrowDownLeft, Key, Home, Star, LogOut, PlusCircle, 
  Smartphone, Loader2, Lock, ArrowRight, ArrowLeft, QrCode, Scan, History, User, CheckCircle2, Copy
} from "lucide-react";
import { toast } from "sonner";
import React from "react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

type Tab = "home" | "acheter" | "recevoir" | "envoyer" | "recompenser" | "sortie" | "historique" | "profil";

export function Dashboard() {
  const {
    activeProfile, profiles, wallet, balance, transactions,
    generateWallet, buyFstart, transferP2P, externalTransfer, rewardMember
  } = useFPay();

  const [tab, setTab] = useState<Tab>("home");

  // --- Achat (Entrée de valeur) ---
  const [purchaseStep, setPurchaseStep] = useState<"AMOUNT" | "METHOD">("AMOUNT");
  const [purchaseAmount, setPurchaseAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "MM">("STRIPE");
  
  const [mmOp, setMmOp] = useState("YAS");
  const [mmPhone, setMmPhone] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // --- Transfert Interne (P2P) ---
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipientNetwork, setRecipientNetwork] = useState<"FPAY" | "MADASTARS">("FPAY");
  const [giftAmt, setGiftAmt] = useState("");
  const [giftLoading, setGiftLoading] = useState(false);

  // --- Récompense ---
  const [rewardRecipient, setRewardRecipient] = useState("");
  const [rewardAmt, setRewardAmt] = useState("");
  const [rewardService, setRewardService] = useState("");
  const [rewardLoading, setRewardLoading] = useState(false);

  // --- Transfert Externe ---
  const [extAmt, setExtAmt] = useState("");
  const [extLoading, setExtLoading] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  };

  function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    const amt = typeof purchaseAmount === "number" ? purchaseAmount : parseFloat(purchaseAmount);
    if (!amt || amt <= 0) return;

    if (paymentMethod === "MM" && !mmPhone) {
      toast.error("Veuillez entrer un numéro de téléphone.");
      return;
    }

    setPurchaseLoading(true);
    setTimeout(() => {
      buyFstart(amt, paymentMethod === "STRIPE" ? "STRIPE" : "MOBILE_MONEY");
      setPurchaseLoading(false);
      setPurchaseStep("AMOUNT");
      setPurchaseAmount("");
      setMmPhone("");
      toast.success(`${amt} FSTART générés avec succès !`);
      setTab("home");
    }, 1500);
  }

  function handleSendGift(e: React.FormEvent) {
    e.preventDefault();
    const fstarts = parseFloat(giftAmt);
    if (!fstarts || !recipientQuery.trim()) { toast.error("Remplissez tous les champs."); return; }
    
    if (recipientQuery.trim().length < 8) {
      toast.error("La clé publique Ed25519 semble invalide.");
      return;
    }

    setGiftLoading(true);
    setTimeout(() => {
      transferP2P("MEMBER", fstarts);
      toast.success(`Transfert envoyé sur le réseau ${recipientNetwork} vers la clé ${recipientQuery.substring(0, 8)}...`);
      setGiftLoading(false);
      setGiftAmt("");
      setRecipientQuery("");
      setTab("home");
    }, 1500);
  }

  function handleReward(e: React.FormEvent) {
    e.preventDefault();
    const fstarts = parseFloat(rewardAmt);
    if (!fstarts || !rewardService.trim() || !rewardRecipient.trim()) { toast.error("Remplissez tous les champs."); return; }
    
    if (rewardRecipient.trim().length < 8) {
      toast.error("La clé publique Ed25519 semble invalide.");
      return;
    }

    setRewardLoading(true);
    setTimeout(() => {
      // @ts-ignore
      rewardMember("MEMBER", fstarts, rewardService); 
      toast.success(`Récompense signée pour la clé ${rewardRecipient.substring(0, 8)}...`);
      setRewardLoading(false);
      setRewardAmt("");
      setRewardService("");
      setRewardRecipient("");
      setTab("home");
    }, 1500);
  }



  const actionButtons = [
    { key: "acheter", label: "Achat", icon: <PlusCircle /> },
    { key: "recevoir", label: "Recevoir", icon: <QrCode /> },
    { key: "envoyer", label: "Envoi", icon: <Send /> },
    { key: "recompenser", label: "Récomp.", icon: <Star /> },

  ];

  const bottomNavItems = [
    { key: "home", label: "Wallet", icon: <Home /> },
    { key: "historique", label: "Historique", icon: <History /> },
    { key: "profil", label: "Profil", icon: <User /> },
  ];

  const renderTransactionList = () => (
    <div className="md:bg-white md:border md:border-slate-200 md:rounded-[2rem] md:shadow-sm overflow-hidden">
      {transactions.length === 0 ? (
        <div className="p-10 md:p-16 text-center text-slate-400 font-semibold text-sm">
          Aucune transaction
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-4 py-4 md:p-6 hover:bg-slate-50 transition-colors">
                <div className={`h-12 w-12 rounded-[1rem] flex items-center justify-center shrink-0 border ${tx.amount > 0 ? "bg-green-50 border-green-100 text-green-600" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                  {tx.amount > 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{tx.description}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{tx.date}</p>
                </div>
                <div className={`font-black text-base md:text-lg tracking-tight ${tx.amount > 0 ? "text-green-600" : "text-slate-900"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[100dvh] bg-slate-50 font-sans text-slate-800 overflow-hidden w-full">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 z-20 shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform duration-300">
              <Shield className="h-6 w-6 text-white" strokeWidth={2.2} fill="currentColor" fillOpacity={0.2} />
              <span className="absolute text-white font-bold text-sm">F</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">FPay<span className="text-blue-500">.</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {bottomNavItems.map(n => (
            <button key={n.key} onClick={() => setTab(n.key as Tab)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                tab === n.key ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className={`${tab === n.key ? "text-white" : "text-slate-400"}`}>
                {React.cloneElement(n.icon as any, { className: "h-5 w-5" })}
              </div>
              {n.label}
            </button>
          ))}
          <div className="pt-4 pb-2">
            <div className="border-t border-slate-100 mb-4"></div>
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Actions FPay</p>
          </div>
          {actionButtons.map(n => (
            <button key={n.key} onClick={() => setTab(n.key as Tab)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                tab === n.key ? "bg-blue-50 text-[#1864FF]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className={`${tab === n.key ? "text-[#1864FF]" : "text-slate-400"}`}>
                {React.cloneElement(n.icon as any, { className: "h-5 w-5" })}
              </div>
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-end px-10 h-24 shrink-0 bg-slate-50">
          <button onClick={() => setTab("profil")} className="flex items-center gap-3 bg-white border border-slate-200 py-1.5 pl-1.5 pr-4 rounded-full shadow-sm hover:border-[#1864FF] transition-colors">
            <div className="h-8 w-8 rounded-full bg-blue-50 text-[#1864FF] flex items-center justify-center font-black uppercase text-xs">
              {activeProfile.avatar}
            </div>
            <span className="text-sm font-bold text-slate-700">{activeProfile.name}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full pb-24 md:pb-10">
          
          {/* MOBILE ONLY: Blue Gradient Top Section for Home */}
          {tab === "home" && (
            <div className="md:hidden bg-gradient-to-b from-[#1864FF] to-blue-600 text-white px-6 pt-10 pb-32 relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 border border-white/10 shadow-sm">
                    <Shield className="h-5 w-5 text-white" strokeWidth={2.2} fill="currentColor" fillOpacity={0.2} />
                    <span className="absolute text-white font-bold text-[10px]">F</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight text-white">FPay<span className="text-blue-200">.</span></span>
                </div>
                <button onClick={() => setTab("profil")} className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-black shadow-sm border border-white/10">
                  {activeProfile.avatar}
                </button>
              </div>
              
              <div className="text-center mb-10">
                <p className="text-blue-200 text-sm font-semibold mb-1 uppercase tracking-widest">Total Balance</p>
                <div className="text-5xl font-black tracking-tighter">{balance.toLocaleString()}</div>
                <span className="text-lg font-bold text-blue-100">FSTART</span>
              </div>

              <div className="flex justify-between max-w-sm mx-auto overflow-x-auto gap-4 hide-scrollbar pb-2 px-2">
                {actionButtons.map(a => (
                  <button key={a.key} onClick={() => setTab(a.key as Tab)} className="flex flex-col items-center gap-2 hover:scale-105 transition-transform shrink-0">
                    <div className="h-12 w-12 rounded-full bg-white/15 border border-white/10 flex items-center justify-center shadow-lg shadow-black/5">
                      {React.cloneElement(a.icon as any, { className: "h-5 w-5 text-white" })}
                    </div>
                    <span className="text-[10px] font-bold tracking-wide text-blue-50">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={`max-w-6xl mx-auto w-full ${tab === "home" ? "md:px-10" : "p-6 md:p-10"}`}>
            
            {/* --- HOME VIEW --- */}
            {tab === "home" && (
              <div className="animate-in fade-in duration-500">
                <div className="hidden md:block mb-8">
                  <h1 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">Overview</h1>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between h-72">
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Total Balance</p>
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{balance.toLocaleString()}</h2>
                          <span className="text-xl font-bold text-[#1864FF]">FSTART</span>
                        </div>
                      </div>
                      <div className="flex gap-10">
                          {actionButtons.map(a => (
                            <button key={a.key} onClick={() => setTab(a.key as Tab)} className="flex flex-col items-center gap-2 group">
                              <div className="h-14 w-14 rounded-[1.25rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-[#1864FF] group-hover:text-white group-hover:border-[#1864FF] transition-all shadow-sm">
                                {React.cloneElement(a.icon as any, { className: "h-6 w-6" })}
                              </div>
                              <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900">{a.label}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                    <div className="col-span-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between h-72 relative overflow-hidden">
                      <div className="absolute right-0 top-0 opacity-5 pointer-events-none"><Key className="h-48 w-48 -mr-10 -mt-10" /></div>
                      <div className="relative z-10">
                        <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Ed25519 Wallet</p>
                        <div className="flex items-center gap-3">
                          {wallet ? (
                            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center"><div className="h-3 w-3 rounded-full bg-green-500" /></div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center"><div className="h-3 w-3 rounded-full bg-orange-500" /></div>
                          )}
                          <div>
                            <h3 className="font-extrabold text-slate-900">{wallet ? "Sécurisé & Actif" : "Non Activé"}</h3>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{wallet ? `Signature locale prête` : `Génération requise`}</p>
                          </div>
                        </div>
                      </div>
                      <div className="relative z-10">
                        {!wallet && <button onClick={generateWallet} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md">Générer les clés</button>}
                        {wallet && (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 mb-1">Clé Publique</p>
                            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleCopy(wallet.publicKey)}>
                              <p className="text-[10px] font-mono font-bold text-slate-700 truncate">{wallet.publicKey}</p>
                              <Copy className="h-4 w-4 text-slate-400 group-hover:text-[#1864FF] shrink-0" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:mt-0 -mt-16 relative z-10 bg-white md:bg-transparent rounded-t-[2rem] min-h-[60vh] md:min-h-0 md:rounded-none p-6 md:p-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-none">
                  {!wallet && (
                    <div className="md:hidden bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between mb-6 shadow-sm">
                       <div><h3 className="font-bold text-orange-900 text-sm">Wallet requis</h3><p className="text-orange-700 text-xs mt-0.5">Générez vos clés locales</p></div>
                       <button onClick={generateWallet} className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm">Générer</button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-widest">Transactions</h2>
                    <button onClick={() => setTab("historique")} className="text-xs font-bold text-[#1864FF]">Tout voir</button>
                  </div>
                  {renderTransactionList()}
                </div>
              </div>
            )}

            {/* --- FORMS AND VIEWS --- */}
            {tab !== "home" && (
              <div className="animate-in fade-in max-w-xl mx-auto w-full md:mt-10">
                <button onClick={() => setTab("home")} className="md:hidden flex items-center gap-2 text-slate-500 font-bold text-sm mb-6">
                  <ArrowLeft className="h-4 w-4" /> Retour au Wallet
                </button>

                {tab === "historique" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Historique</h1>
                      <p className="text-sm text-slate-500 mt-2">Toutes vos transactions FSTART.</p>
                    </div>
                    {renderTransactionList()}
                  </div>
                )}

                {tab === "profil" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mon Profil</h1>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
                       <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                          <div className="h-16 w-16 bg-blue-50 text-[#1864FF] flex items-center justify-center font-black text-2xl rounded-full">
                            {activeProfile.avatar}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-slate-900">{activeProfile.name}</h2>
                            <p className="text-slate-500 font-medium text-sm">{activeProfile.email}</p>
                          </div>
                       </div>
                       <div className="space-y-8">
                         <div className="mb-8 border-b border-slate-100 pb-8">
                           <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-[#1864FF]" /> Informations Personnelles</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prénom</label>
                               <input type="text" defaultValue={activeProfile.name.split(" ")[0]} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1864FF] outline-none font-medium text-slate-700" />
                             </div>
                             <div className="space-y-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nom</label>
                               <input type="text" defaultValue={activeProfile.name.split(" ").slice(1).join(" ") || ""} placeholder="Nom de famille" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1864FF] outline-none font-medium text-slate-700" />
                             </div>
                             <div className="space-y-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date de naissance</label>
                               <input type="date" defaultValue="1990-01-01" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1864FF] outline-none font-medium text-slate-700" />
                             </div>
                             <div className="space-y-1.5">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                               <input type="email" defaultValue={activeProfile.email} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1864FF] outline-none font-medium text-slate-700" />
                             </div>
                             <div className="space-y-1.5 md:col-span-2">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Numéro de téléphone</label>
                               <input type="tel" placeholder="+241 00 00 00 00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#1864FF] outline-none font-medium text-slate-700" />
                             </div>
                           </div>
                           <div className="mt-4 flex justify-end">
                             <button onClick={() => toast.success("Informations mises à jour")} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-sm">Enregistrer</button>
                           </div>
                         </div>
                         
                        <div className="mb-8 border-b border-slate-100 pb-8">
                           <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">Vérification d'Identité (KYC)</h3>
                           
                           <div className="space-y-3">
                             {/* Niveau 1 */}
                             <div className="bg-white border border-green-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm relative overflow-hidden">
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                               <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                                   <CheckCircle2 className="h-5 w-5" />
                                 </div>
                                 <div>
                                   <h4 className="font-bold text-slate-900 text-sm">Niveau 1 : Informations de base</h4>
                                   <p className="text-xs text-slate-500">Email & Téléphone vérifiés. (Limite: 100 FSTART)</p>
                                 </div>
                               </div>
                               <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full self-start md:self-auto">Vérifié</span>
                             </div>

                             {/* Niveau 2 */}
                             <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1864FF]"></div>
                               <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 bg-blue-50 text-[#1864FF] rounded-full flex items-center justify-center shrink-0">
                                     <span className="font-black">2</span>
                                   </div>
                                   <div>
                                     <h4 className="font-bold text-slate-900 text-sm">Niveau 2 : Pièce d'Identité</h4>
                                     <p className="text-xs text-slate-500">Débloque les limites de transfert.</p>
                                   </div>
                                 </div>
                                 <span className="text-[10px] font-bold text-[#1864FF] bg-blue-50 px-2 py-1 rounded-md uppercase tracking-widest">Requis</span>
                               </div>
                               <div className="flex flex-col sm:flex-row gap-2">
                                 <button onClick={() => toast.info("Ouverture de l'appareil photo pour la CNI...")} className="flex-1 bg-slate-50 border border-slate-200 hover:border-[#1864FF] text-slate-700 py-3 rounded-lg text-xs font-bold transition-colors">Scanner CNI/Passeport</button>
                                 <button onClick={() => toast.info("Ouverture de la caméra frontale pour le Liveness Check...")} className="flex-1 bg-slate-50 border border-slate-200 hover:border-[#1864FF] text-slate-700 py-3 rounded-lg text-xs font-bold transition-colors">Liveness Check (Selfie)</button>
                               </div>
                             </div>

                             {/* Niveau 3 */}
                             <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden opacity-60">
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                               <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 bg-slate-50 border border-slate-200 text-slate-400 rounded-full flex items-center justify-center shrink-0">
                                   <Lock className="h-4 w-4" />
                                 </div>
                                 <div>
                                   <h4 className="font-bold text-slate-900 text-sm">Niveau 3 : Justificatif de domicile</h4>
                                   <p className="text-xs text-slate-500">Requis pour les hauts volumes.</p>
                                 </div>
                               </div>
                             </div>
                           </div>
                        </div>
                         <div>
                           <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">Sécurité (Non-Custodial) <Shield className="w-5 h-5 text-[#1864FF]" /></h3>
                           <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Clé Privée (Ed25519)</p>
                             <div className="flex gap-2">
                               <input type="password" value={wallet ? "secret_fpay_private_key" : ""} readOnly className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-500 outline-none" />
                               <button onClick={() => toast.info("Entrez votre code PIN local pour révéler.")} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors">Afficher</button>
                             </div>
                             <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">Cette clé est stockée uniquement sur cet appareil. FPay n'y a pas accès. Ne la partagez avec personne.</p>
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                )}

                {tab === "recevoir" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recevoir</h1>
                      <p className="text-sm text-slate-500 mt-2">Partagez votre QR code ou votre clé publique.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-sm text-center">
                      {!wallet ? (
                        <div className="text-orange-600 font-bold">Veuillez générer vos clés dans le Dashboard.</div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="bg-slate-50 p-6 rounded-3xl inline-block border-2 border-slate-100 mb-8 shadow-sm">
                             <QrCode className="w-48 h-48 text-slate-900" strokeWidth={1} />
                          </div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Votre Clé Publique (Ed25519)</p>
                          <div onClick={() => handleCopy(wallet.publicKey)} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4 w-full cursor-pointer hover:bg-blue-50 hover:border-[#1864FF] transition-all group">
                            <span className="font-mono text-sm font-bold text-slate-700 truncate text-left">{wallet.publicKey}</span>
                            <Copy className="w-5 h-5 text-slate-400 group-hover:text-[#1864FF] shrink-0" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Forms for Acheter, Envoyer, Recompenser, Sortie ... */}
                {tab === "envoyer" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transfert</h1>
                      <p className="text-sm text-slate-500 mt-2">Envoyez des jetons vers une adresse Ed25519.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
                      <form onSubmit={handleSendGift} className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Réseau de destination</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setRecipientNetwork("FPAY")} className={`py-3 rounded-xl border-2 font-bold text-xs transition-colors ${recipientNetwork === "FPAY" ? "border-[#1864FF] bg-blue-50 text-[#1864FF]" : "border-slate-100 text-slate-600 bg-slate-50 hover:border-slate-200"}`}>Réseau FPay</button>
                            <button type="button" onClick={() => setRecipientNetwork("MADASTARS")} className={`py-3 rounded-xl border-2 font-bold text-xs transition-colors ${recipientNetwork === "MADASTARS" ? "border-[#1864FF] bg-blue-50 text-[#1864FF]" : "border-slate-100 text-slate-600 bg-slate-50 hover:border-slate-200"}`}>Réseau MadaStars</button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clé Publique (Ed25519)</label>
                          <div className="relative">
                            <input type="text" placeholder="Saisir (Ex: FPAY...)" value={recipientQuery} onChange={e => setRecipientQuery(e.target.value)} required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:border-[#1864FF] outline-none font-mono" />
                            <button type="button" onClick={() => toast.info("Ouverture du scanner QR...")} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#1864FF] shadow-sm">
                              <Scan className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Montant (FSTART)</label>
                          <input type="number" placeholder="0" value={giftAmt} onChange={e => setGiftAmt(e.target.value)} required max={balance}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xl font-black focus:border-[#1864FF] outline-none" />
                        </div>
                        <button type="submit" disabled={giftLoading} className="w-full bg-[#1864FF] disabled:opacity-50 text-white font-bold text-sm rounded-xl py-4 shadow-sm flex items-center justify-center mt-2">
                          {giftLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Signer et Envoyer (Ed25519)"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
                
                {tab === "recompenser" && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Récompenser</h1>
                      <p className="text-sm text-slate-500 mt-2">Rémunérez un service communautaire.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
                      <form onSubmit={handleReward} className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clé Publique du membre (Ed25519)</label>
                          <div className="relative">
                            <input type="text" placeholder="Saisir (Ex: FPAY...)" value={rewardRecipient} onChange={e => setRewardRecipient(e.target.value)} required
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:border-[#1864FF] outline-none font-mono" />
                            <button type="button" onClick={() => toast.info("Ouverture du scanner QR...")} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#1864FF] shadow-sm">
                              <Scan className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Service</label>
                          <input type="text" placeholder="Ex: Design, Modération..." value={rewardService} onChange={e => setRewardService(e.target.value)} required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none font-medium" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Montant (FSTART)</label>
                          <input type="number" placeholder="0" value={rewardAmt} onChange={e => setRewardAmt(e.target.value)} required max={balance}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xl font-black focus:border-[#1864FF] outline-none" />
                        </div>
                        <button type="submit" disabled={rewardLoading} className="w-full bg-slate-900 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-4 shadow-sm flex items-center justify-center mt-2">
                          {rewardLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Signer l'Attribution (Ed25519)"}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {tab === "acheter" && (
                   <div className="space-y-6">
                     <div className="text-center">
                       <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Entrée de valeur</h1>
                       <p className="text-sm text-slate-500 mt-2">Achetez des FSTART par CB ou Mobile Money.</p>
                     </div>
                     {/* Same purchase UI as before... */}
                     <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm">
                       {purchaseStep === "AMOUNT" && (
                         <div className="space-y-6 animate-in fade-in">
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                             {[50, 150, 500].map(amt => (
                               <button key={amt} onClick={() => setPurchaseAmount(amt)}
                                 className={`py-5 rounded-2xl border-2 font-bold flex flex-col items-center gap-1 ${purchaseAmount === amt ? "border-[#1864FF] bg-blue-50 text-[#1864FF]" : "border-slate-100 hover:border-slate-300 text-slate-700 bg-slate-50"}`}
                               ><span className="text-xl">{amt}</span><span className="text-[10px] uppercase tracking-widest text-slate-400">FSTART</span></button>
                             ))}
                           </div>
                           <div className="space-y-3">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block text-center">Montant personnalisé</label>
                             <input type="number" value={purchaseAmount} onChange={(e) => setPurchaseAmount(e.target.value ? parseFloat(e.target.value) : "")}
                               placeholder="0" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 text-center text-slate-900 focus:border-[#1864FF] outline-none text-2xl font-black max-w-[200px] mx-auto block" />
                           </div>
                           <button onClick={() => setPurchaseStep("METHOD")} disabled={!purchaseAmount || purchaseAmount <= 0}
                             className="w-full bg-[#1864FF] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-xl py-4 flex justify-center items-center shadow-sm">
                             Continuer
                           </button>
                         </div>
                       )}
                       {purchaseStep === "METHOD" && (
                         <div className="space-y-6 animate-in slide-in-from-right-4">
                           <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                             <button onClick={() => setPurchaseStep("AMOUNT")} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-600"><ArrowLeft className="h-4 w-4" /></button>
                             <p className="text-sm font-bold text-slate-900">Achat de {purchaseAmount} FSTART</p>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                             <button onClick={() => setPaymentMethod("STRIPE")} className={`p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-2 ${paymentMethod === "STRIPE" ? "border-[#1864FF] bg-blue-50 text-[#1864FF]" : "border-slate-100 text-slate-600 bg-slate-50"}`}><CreditCard className="h-6 w-6" /> Carte Bancaire</button>
                             <button onClick={() => setPaymentMethod("MM")} className={`p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-2 ${paymentMethod === "MM" ? "border-[#1864FF] bg-blue-50 text-[#1864FF]" : "border-slate-100 text-slate-600 bg-slate-50"}`}><Smartphone className="h-6 w-6" /> Mobile Money</button>
                           </div>
                           <form onSubmit={handlePurchase} className="space-y-5 pt-4">
                             {paymentMethod === "STRIPE" && (
                               <div className="space-y-3">
                                 <input type="text" placeholder="Numéro de carte (0000...)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none font-medium" required />
                                 <div className="flex gap-3">
                                   <input type="text" placeholder="MM/AA" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none font-medium" required />
                                   <input type="text" placeholder="CVC" className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none font-medium" required />
                                 </div>
                               </div>
                             )}
                             {paymentMethod === "MM" && (
                               <div className="space-y-5">
                                 <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                                   {["YAS", "Orange", "Airtel"].map(op => (
                                     <button key={op} type="button" onClick={() => setMmOp(op)} className={`py-2 text-xs font-bold rounded-lg ${mmOp === op ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{op}</button>
                                   ))}
                                 </div>
                                 <input type="tel" placeholder="Numéro Mobile Money" value={mmPhone} onChange={e => setMmPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm focus:border-[#1864FF] outline-none font-medium" required />
                               </div>
                             )}
                             <button type="submit" disabled={purchaseLoading} className="w-full bg-slate-900 disabled:opacity-50 text-white font-bold text-sm rounded-xl py-4 flex justify-center items-center shadow-md">
                               {purchaseLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Payer et Générer"}
                             </button>
                           </form>
                         </div>
                       )}
                     </div>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-40">
          <div className="flex items-center justify-between gap-1 h-[68px]">
            {bottomNavItems.map(n => (
              <button key={n.key} onClick={() => setTab(n.key as Tab)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${tab === n.key ? "text-[#1864FF] -translate-y-0.5" : "text-slate-400 hover:text-slate-600"}`}
              >
                {React.cloneElement(n.icon as any, { className: "h-6 w-6 mb-0.5" })}
                <span className={`text-[9px] font-bold tracking-wide ${tab === n.key ? "opacity-100" : "opacity-0"}`}>{n.label}</span>
              </button>
            ))}
          </div>
        </nav>

      </main>
    </div>
  );
}
