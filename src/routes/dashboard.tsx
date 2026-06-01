import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useFPay } from "../hooks/use-fpay";
import {
  Shield,
  Home,
  PlusCircle,
  Send,
  QrCode,
  Store,
  Star,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  MapPin,
  Clock,
  Info,
  Loader2,
  Copy,
  CreditCard,
  Search,
  CheckCircle,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

// ---- Helpers ----
function formatAr(n: number) {
  return n.toLocaleString("fr-MG") + " Ar";
}

type Tab = "home" | "acheter" | "envoyer" | "recevoir" | "payer";

export default function Dashboard() {
  const {
    activeProfile,
    balances,
    transactions,
    virtualCards,
    exchangeRate,
    buyStarsCB,
    buyStarsMobileMoney,
    withdrawMobileMoney,
    withdrawCashPoint,
    generateVirtualCard,
    payMerchant,
    profiles,
    transferP2P,
  } = useFPay();

  const [tab, setTab] = useState<Tab>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─── Acheter ───
  const [pack, setPack] = useState<{ stars: number; eur: number } | null>(null);
  const [showStripe, setShowStripe] = useState(false);
  const [cardNo, setCardNo] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [customStripeAmt, setCustomStripeAmt] = useState("");
  const [mmOp, setMmOp] = useState("Mvola");
  const [mmPhone, setMmPhone] = useState("");
  const [mmAmt, setMmAmt] = useState("");
  const [mmLoading, setMmLoading] = useState(false);

  // ─── Envoyer ───
  const [sendMode, setSendMode] = useState<"gift" | "mobile" | "cash">("gift");
  // gift (F-Stars → créateur)
  const [recipientQuery, setRecipientQuery] = useState(""); // email ou téléphone
  const [giftAmt, setGiftAmt] = useState("");
  const [giftLoading, setGiftLoading] = useState(false);
  // retrait mobile
  const [wdOp, setWdOp] = useState("Mvola");
  const [wdPhone, setWdPhone] = useState("");
  const [wdAmt, setWdAmt] = useState("");
  const [wdLoading, setWdLoading] = useState(false);
  // retrait cash point
  const [cpLocation, setCpLocation] = useState("Supermaki Analakely");
  const [cpAmt, setCpAmt] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [voucher, setVoucher] = useState<{ code: string; amount: number; location: string; fees: number } | null>(null);

  // ─── Recevoir ───
  const [qrStars, setQrStars] = useState("");
  const [qrNote, setQrNote] = useState("");
  const [scanLoading, setScanLoading] = useState(false);

  // ─── Carte virtuelle ───
  const [vcAmt, setVcAmt] = useState("");
  const [vcProv, setVcProv] = useState<"Visa" | "Mastercard">("Visa");
  const [vcLoading, setVcLoading] = useState(false);

  // ─── Payer ───
  const [showMerchant, setShowMerchant] = useState(false);
  const [paySource, setPaySource] = useState<"SOLDE_A" | "SOLDE_B">("SOLDE_A");
  const [payLoading, setPayLoading] = useState(false);
  const merchantItem = { name: "Casque Audio JBL Pro", priceAr: 180_000 };

  const bal = balances[activeProfile.id];
  const fee2 = (v: string) => Math.round((parseFloat(v) || 0) * 0.02);
  const fee3 = (v: string) => Math.round((parseFloat(v) || 0) * 0.03);

  // ── Handlers ──
  function handleBuyCB(e: React.FormEvent) {
    e.preventDefault();
    if (!pack) return;
    setStripeLoading(true);
    setTimeout(() => {
      buyStarsCB(pack.stars, pack.eur);
      setStripeLoading(false);
      setShowStripe(false);
      setPack(null);
      setCardNo(""); setCardExp(""); setCardCvv("");
    }, 1500);
  }

  function handleBuyMM(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(mmAmt);
    if (!amt || !mmPhone) { toast.error("Remplissez tous les champs."); return; }
    setMmLoading(true);
    setTimeout(() => {
      buyStarsMobileMoney(Math.floor(amt / exchangeRate), amt, mmOp, mmPhone);
      setMmLoading(false); setMmAmt(""); setMmPhone("");
    }, 1500);
  }

  function handleSendGift(e: React.FormEvent) {
    e.preventDefault();
    const stars = parseFloat(giftAmt);
    if (!stars || !recipientQuery.trim()) { toast.error("Remplissez tous les champs."); return; }
    if (bal.soldeA < stars) { toast.error("Vos F-Stars sont insuffisants."); return; }
    setGiftLoading(true);
    setTimeout(() => {
      // 1. Chercher le destinataire par email exact parmi les profils connus
      const query = recipientQuery.trim().toLowerCase();
      const match = Object.values(profiles).find(
        p => p.id !== activeProfile.id && (
          p.email.toLowerCase() === query ||
          // Recherche aussi par numéro de téléphone simulé (format 03X)
          query.replace(/\s/g, "").startsWith("03")
        )
      );

      if (match) {
        // ✅ Profil connu : transferP2P applique la règle :
        //   → Débite soldeA (F-Stars) chez l'émetteur
        //   → Crédite soldeB (Gains en Ariary) chez le destinataire
        //   → Taux de conversion : 1 F-Star = exchangeRate Ar
        transferP2P(match.id, stars);
      } else {
        // ❌ Destinataire externe inconnu du système : on simule uniquement le débit
        // (dans la réalité, un webhook enverrait la notification au destinataire)
        transferP2P("CREATOR", stars); // Simulation : on crédite Clara par défaut
        toast.info(`Cadeau envoyé à ${recipientQuery.trim()} — ils recevront une notification FPay.`);
      }
      setGiftLoading(false);
      setGiftAmt("");
      setRecipientQuery("");
    }, 1500);
  }

  function handleWithdrawMM(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(wdAmt);
    if (!amt || !wdPhone) { toast.error("Remplissez tous les champs."); return; }
    setWdLoading(true);
    setTimeout(() => {
      withdrawMobileMoney(wdOp, wdPhone, amt);
      setWdLoading(false); setWdAmt(""); setWdPhone("");
    }, 1500);
  }

  function handleWithdrawCash(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(cpAmt);
    if (!amt) { toast.error("Entrez un montant valide."); return; }
    setCpLoading(true);
    setTimeout(() => {
      const res = withdrawCashPoint(cpLocation, amt);
      if (res) setVoucher({ code: res.code, amount: amt, location: cpLocation, fees: res.fees });
      setCpLoading(false); setCpAmt("");
    }, 1500);
  }

  function handleSimulateScan() {
    const stars = parseFloat(qrStars) || 50;
    setScanLoading(true);
    setTimeout(() => {
      const ariaryEquivalent = stars * exchangeRate;
      balances[activeProfile.id].soldeB += ariaryEquivalent;
      transactions.unshift({
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toLocaleDateString("fr-FR") + " " + new Date().toLocaleTimeString("fr-FR").slice(0, 5),
        type: "TRANSFERT",
        description: `Cadeau reçu via QR Code (${stars} ⭐)`,
        amountA: 0,
        amountB: ariaryEquivalent,
        status: "COMPLETED",
      });
      setScanLoading(false);
      toast.success(`Vous avez reçu ${stars} ⭐ soit ${formatAr(ariaryEquivalent)} de gains !`);
    }, 1500);
  }

  function handleGenCard(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(vcAmt);
    if (!amt) { toast.error("Entrez un montant valide."); return; }
    setVcLoading(true);
    setTimeout(() => {
      generateVirtualCard(amt, vcProv);
      setVcLoading(false); setVcAmt("");
    }, 1500);
  }

  function handleMerchantPay(e: React.FormEvent) {
    e.preventDefault();
    setPayLoading(true);
    setTimeout(() => {
      const ok = payMerchant("MERCHANT", paySource, merchantItem.priceAr);
      setPayLoading(false);
      if (ok) setShowMerchant(false);
    }, 1500);
  }

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "home", label: "Accueil", icon: <Home className="h-4 w-4" /> },
    { key: "acheter", label: "Acheter", icon: <PlusCircle className="h-4 w-4" /> },
    { key: "envoyer", label: "Envoyer / Retirer", icon: <Send className="h-4 w-4" /> },
    { key: "recevoir", label: "Recevoir", icon: <QrCode className="h-4 w-4" /> },
    { key: "payer", label: "Payer", icon: <Store className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">

      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_3px_10px_-2px_rgba(79,70,229,0.4)]">
              <Shield className="h-5 w-5 text-white" fill="currentColor" fillOpacity={0.1} />
            </div>
            <span className="text-lg font-bold text-slate-900">FPay</span>
          </Link>

          {/* Desktop tab bar */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 rounded-full p-1">
            {navItems.map(n => (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  tab === n.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5">
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">{activeProfile.avatar}</div>
              {activeProfile.name}
            </div>
            <Link to="/" className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 px-3 py-2 rounded-full transition-colors">
              Déconnexion
            </Link>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1">
            {navItems.map(n => (
              <button
                key={n.key}
                onClick={() => { setTab(n.key); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  tab === n.key ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {n.icon} {n.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-8">

        {/* ════════════════════════════════
            TAB ACCUEIL
        ════════════════════════════════ */}
        {tab === "home" && (
          <div className="space-y-8">

            {/* Greeting */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-white text-lg shadow-md">
                {activeProfile.avatar}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">Bonjour, {activeProfile.name}</h1>
                <p className="text-xs text-slate-500">{activeProfile.email} · Taux : 1 F-Star = {exchangeRate} Ar</p>
              </div>
            </div>

            {/* Balance Cards */}
            <div className="grid sm:grid-cols-2 gap-6">

              {/* F-Stars card */}
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-6 text-slate-900 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-8 -mt-8" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Mes F-Stars</span>
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Star className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-5xl font-black tracking-tight relative z-10">{bal.soldeA.toLocaleString()}</p>
                <p className="text-sm font-semibold mt-1 opacity-70 relative z-10">F-Stars disponibles</p>
                <div className="mt-6 flex gap-2 relative z-10">
                  <button onClick={() => setTab("acheter")} className="flex-1 bg-slate-900/20 hover:bg-slate-900/30 text-slate-900 font-bold text-xs rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1">
                    <PlusCircle className="h-3.5 w-3.5" /> Acheter
                  </button>
                  <button onClick={() => { setTab("envoyer"); setSendMode("gift"); }} className="flex-1 bg-white/30 hover:bg-white/40 text-slate-900 font-bold text-xs rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1">
                    <Send className="h-3.5 w-3.5" /> Envoyer
                  </button>
                </div>
              </div>

              {/* Gains card */}
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -mr-8 -mt-8" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Mes Gains</span>
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-4xl font-black tracking-tight relative z-10">{bal.soldeB.toLocaleString()}</p>
                <p className="text-sm font-semibold mt-1 opacity-70 relative z-10">Ariary disponibles</p>
                <div className="mt-6 flex gap-2 relative z-10">
                  <button onClick={() => { setTab("envoyer"); setSendMode("mobile"); }} className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" /> Retirer
                  </button>
                  <button onClick={() => setTab("recevoir")} className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1">
                    <QrCode className="h-3.5 w-3.5" /> Recevoir
                  </button>
                </div>
              </div>

            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <PlusCircle className="h-5 w-5 text-amber-600" />, label: "Acheter", bg: "bg-amber-50", action: () => setTab("acheter") },
                { icon: <Send className="h-5 w-5 text-indigo-600" />, label: "Envoyer", bg: "bg-indigo-50", action: () => { setTab("envoyer"); setSendMode("gift"); } },
                { icon: <QrCode className="h-5 w-5 text-emerald-600" />, label: "Recevoir", bg: "bg-emerald-50", action: () => setTab("recevoir") },
                { icon: <CreditCard className="h-5 w-5 text-purple-600" />, label: "Carte virtuelle", bg: "bg-purple-50", action: () => setTab("recevoir") },
              ].map(a => (
                <button key={a.label} onClick={a.action} className={`${a.bg} border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all group`}>
                  {a.icon}
                  <span className="text-[10px] font-bold text-slate-600 text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>

            {/* Transaction History */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Historique des transactions</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">{transactions.length} opérations</span>
              </div>

              {transactions.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">Aucune transaction pour le moment.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      {/* Icon */}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === "ACHAT" ? "bg-emerald-50 text-emerald-600" :
                        tx.type === "TRANSFERT" && tx.amountA < 0 ? "bg-amber-50 text-amber-600" :
                        tx.type === "TRANSFERT" && tx.amountB > 0 ? "bg-indigo-50 text-indigo-600" :
                        tx.type === "RETRAIT" ? "bg-rose-50 text-rose-600" :
                        "bg-purple-50 text-purple-600"
                      }`}>
                        {tx.type === "ACHAT" ? <ArrowDownLeft className="h-5 w-5" /> :
                         tx.type === "RETRAIT" ? <ArrowUpRight className="h-5 w-5" /> :
                         tx.amountA < 0 ? <Send className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{tx.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{tx.date} {tx.fees ? `· Frais: ${tx.fees} Ar` : ""}</p>
                      </div>
                      {/* Amounts */}
                      <div className="text-right shrink-0 space-y-0.5">
                        {tx.amountA !== 0 && (
                          <p className={`text-sm font-bold ${tx.amountA > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {tx.amountA > 0 ? "+" : ""}{tx.amountA} ⭐
                          </p>
                        )}
                        {tx.amountB !== 0 && (
                          <p className={`text-sm font-bold ${tx.amountB > 0 ? "text-indigo-600" : "text-rose-600"}`}>
                            {tx.amountB > 0 ? "+" : ""}{tx.amountB.toLocaleString()} Ar
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ════════════════════════════════
            TAB ACHETER
        ════════════════════════════════ */}
        {tab === "acheter" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Acheter des F-Stars</h1>
              <p className="text-sm text-slate-500 mt-1">Sélectionnez un pack pour encourager vos créateurs préférés.</p>
            </div>

            {/* CB Stripe packs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600" />
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Paiement par Carte Bancaire (Stripe)</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Pack Bronze", stars: 50, eur: 5, desc: "Idéal pour démarrer." },
                  { label: "Pack Argent", stars: 120, eur: 10, desc: "Le plus populaire.", popular: true },
                  { label: "Pack Or", stars: 300, eur: 25, desc: "Soutien VIP Premium." },
                ].map(p => (
                  <div
                    key={p.label}
                    className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between relative transition-all hover:shadow-md ${
                      p.popular ? "border-indigo-400 ring-1 ring-indigo-400" : "border-slate-200"
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full">Populaire</span>
                    )}
                    <div>
                      <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">{p.label}</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-2">{p.stars} F-Stars</h3>
                      <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                    </div>
                    <div className="mt-5">
                      <p className="text-xl font-black text-slate-900 mb-3">{p.eur}.00 €</p>
                      <button
                        onClick={() => { setPack({ stars: p.stars, eur: p.eur }); setShowStripe(true); }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl py-2.5 transition-colors shadow-sm"
                      >
                        Payer avec ma carte
                      </button>
                    </div>
                  </div>
                ))}

                {/* Custom Amount */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative transition-all hover:shadow-md">
                  <div>
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                      <PlusCircle className="h-5 w-5 text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">Montant Libre</span>
                    <h3 className="text-lg font-black text-slate-900 mt-2 leading-tight">Saisissez un montant</h3>
                    <p className="text-[11px] text-slate-500 mt-1">10 F-Stars = 1.00 €.</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="relative">
                      <input type="number" placeholder="Ex: 500" value={customStripeAmt} onChange={e => setCustomStripeAmt(e.target.value)} min={10}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400" />
                      <Star className="absolute right-3 top-3 h-4 w-4 text-amber-400 fill-amber-400" />
                    </div>
                    <button
                      disabled={!customStripeAmt || parseFloat(customStripeAmt) < 10}
                      onClick={() => { 
                        const stars = parseFloat(customStripeAmt);
                        setPack({ stars, eur: Math.ceil(stars / 10) }); 
                        setShowStripe(true); 
                        setCustomStripeAmt("");
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-xs rounded-xl py-2.5 transition-colors shadow-sm"
                    >
                      {customStripeAmt && parseFloat(customStripeAmt) >= 10 ? `Payer ${Math.ceil(parseFloat(customStripeAmt) / 10)}.00 €` : "Payer avec ma carte"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Money */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-indigo-600" />
                <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Recharge Mobile Money (Madagascar)</h2>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Rechargez vos F-Stars directement via votre compte local. Taux : <strong className="text-indigo-700">1 F-Star = {exchangeRate} Ar</strong>
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2">
                      <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500">Aucun frais d'entrée sur les recharges Mobile Money.</p>
                    </div>
                  </div>

                  <form onSubmit={handleBuyMM} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {["Mvola", "Orange Money", "Airtel Money"].map(op => (
                        <button key={op} type="button" onClick={() => setMmOp(op)}
                          className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${mmOp === op ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                          {op}
                        </button>
                      ))}
                    </div>
                    <input type="tel" placeholder="Numéro Mobile Money (ex: 034 00 000 00)" value={mmPhone} onChange={e => setMmPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                    <div className="relative">
                      <input type="number" placeholder="Montant en Ariary" value={mmAmt} onChange={e => setMmAmt(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                      <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold">Ar</span>
                    </div>
                    {mmAmt && (
                      <p className="text-xs text-indigo-700 font-semibold text-right">
                        = {Math.floor(parseFloat(mmAmt) / exchangeRate)} F-Stars crédités
                      </p>
                    )}
                    <button type="submit" disabled={mmLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl py-3 transition-colors shadow-sm flex items-center justify-center gap-2">
                      {mmLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider la recharge"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            TAB ENVOYER / RETIRER
        ════════════════════════════════ */}
        {tab === "envoyer" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Envoyer & Retirer</h1>
              <p className="text-sm text-slate-500 mt-1">Envoyez des F-Stars à quelqu'un ou retirez vos gains en Ariary.</p>
            </div>

            {/* Mode selector */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "gift", label: "Envoyer un cadeau", icon: <Send className="h-5 w-5" />, color: "text-amber-600", bg: "bg-amber-50" },
                { key: "mobile", label: "Retrait Mobile Money", icon: <Smartphone className="h-5 w-5" />, color: "text-indigo-600", bg: "bg-indigo-50" },
                { key: "cash", label: "Retrait en Espèces", icon: <MapPin className="h-5 w-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map(m => (
                <button key={m.key} onClick={() => setSendMode(m.key as any)}
                  className={`p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                    sendMode === m.key ? `border-indigo-600 bg-indigo-50` : "border-slate-200 bg-white hover:border-slate-300"
                  }`}>
                  <div className={`h-10 w-10 rounded-xl ${m.bg} flex items-center justify-center ${m.color}`}>{m.icon}</div>
                  <span className={`text-xs font-bold ${sendMode === m.key ? "text-indigo-700" : "text-slate-600"}`}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* GIFT MODE */}
            {sendMode === "gift" && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
                  <h2 className="font-bold text-amber-900">Envoyer des F-Stars à un créateur</h2>
                  <p className="text-xs text-amber-700 mt-0.5">Vos F-Stars disponibles : <strong>{bal.soldeA} ⭐</strong></p>
                </div>
                <form onSubmit={handleSendGift} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Destinataire (email ou téléphone FPay)</label>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ex: clara.stream@fpay.mg ou 034 00 000 00"
                        value={recipientQuery}
                        onChange={e => setRecipientQuery(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Entrez l'adresse email ou le numéro de téléphone enregistré sur FPay.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nombre de F-Stars à envoyer</label>
                    <div className="relative">
                      <Star className="h-4 w-4 absolute left-3.5 top-3.5 text-amber-500 fill-amber-500" />
                      <input type="number" placeholder="ex: 50" value={giftAmt} onChange={e => setGiftAmt(e.target.value)} required min={1} max={bal.soldeA}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" />
                    </div>
                    {giftAmt && (
                      <p className="text-[11px] text-emerald-600 font-semibold">
                        Le créateur recevra l'équivalent de {formatAr(parseFloat(giftAmt) * exchangeRate)} dans ses Gains.
                      </p>
                    )}
                  </div>

                  {/* Quick amounts */}
                  <div>
                    <p className="text-xs text-slate-500 mb-2 font-semibold">Montants rapides :</p>
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 20, 50, 100].map(n => (
                        <button key={n} type="button" onClick={() => setGiftAmt(String(n))}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                            giftAmt === String(n) ? "bg-amber-500 border-amber-500 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-amber-400"
                          }`}>
                          {n} ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={giftLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-900 font-bold text-sm rounded-xl py-3 transition-colors shadow-sm flex items-center justify-center gap-2">
                    {giftLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Envoyer le cadeau</>}
                  </button>
                </form>
              </div>
            )}

            {/* MOBILE MONEY WITHDRAWAL */}
            {sendMode === "mobile" && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                  <h2 className="font-bold text-indigo-900">Retrait vers Mobile Money</h2>
                  <p className="text-xs text-indigo-700 mt-0.5">Gains disponibles : <strong>{formatAr(bal.soldeB)}</strong> · Frais de sortie : 2%</p>
                </div>
                <form onSubmit={handleWithdrawMM} className="p-6 space-y-5">
                  <div className="grid grid-cols-3 gap-2">
                    {["Mvola", "Orange Money", "Airtel Money"].map(op => (
                      <button key={op} type="button" onClick={() => setWdOp(op)}
                        className={`py-2.5 text-[11px] font-bold rounded-xl border transition-all ${wdOp === op ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                        {op}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Numéro Mobile Money de réception</label>
                    <input type="tel" placeholder="034 00 000 00" value={wdPhone} onChange={e => setWdPhone(e.target.value)} required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Montant à retirer (Ariary)</label>
                    <div className="relative">
                      <input type="number" placeholder="ex: 50000" value={wdAmt} onChange={e => setWdAmt(e.target.value)} required min={1}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                      <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold">Ar</span>
                    </div>
                    {wdAmt && (
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-rose-500">Frais (2%) : {fee2(wdAmt)} Ar</span>
                        <span className="text-emerald-600">Vous recevez : {formatAr((parseFloat(wdAmt) || 0) - fee2(wdAmt))}</span>
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={wdLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl py-3 transition-colors shadow-sm flex items-center justify-center gap-2">
                    {wdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowUpRight className="h-4 w-4" /> Valider le retrait</>}
                  </button>
                </form>
              </div>
            )}

            {/* CASH POINT WITHDRAWAL */}
            {sendMode === "cash" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4">
                    <h2 className="font-bold text-emerald-900">Retrait en Espèces</h2>
                    <p className="text-xs text-emerald-700 mt-0.5">Gains disponibles : <strong>{formatAr(bal.soldeB)}</strong> · Frais : 3%</p>
                  </div>
                  <form onSubmit={handleWithdrawCash} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Point de retrait</label>
                      <select value={cpLocation} onChange={e => setCpLocation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none">
                        <option>Supermaki Analakely</option>
                        <option>Point Cash Ankorondrano</option>
                        <option>Boutique FPay Tamatave Centre</option>
                        <option>Point Service Majunga Bord</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Montant (Ariary)</label>
                      <div className="relative">
                        <input type="number" placeholder="ex: 100000" value={cpAmt} onChange={e => setCpAmt(e.target.value)} required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-16 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400" />
                        <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold">Ar</span>
                      </div>
                      {cpAmt && (
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-rose-500">Frais (3%) : {fee3(cpAmt)} Ar</span>
                          <span className="text-emerald-600">Vous recevez : {formatAr((parseFloat(cpAmt) || 0) - fee3(cpAmt))}</span>
                        </div>
                      )}
                    </div>
                    <button type="submit" disabled={cpLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm rounded-xl py-3 transition-colors shadow-sm flex items-center justify-center gap-2">
                      {cpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><MapPin className="h-4 w-4" /> Générer le bon de retrait</>}
                    </button>
                  </form>
                </div>

                {/* Voucher */}
                {voucher && (
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300">Bon de Retrait Cash</p>
                        <h3 className="font-black text-lg mt-0.5 tracking-widest font-mono">{voucher.code}</h3>
                      </div>
                      <Clock className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-white/60">Boutique</span><span className="font-semibold">{voucher.location}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Montant net</span><span className="font-black text-emerald-400">{formatAr(voucher.amount - voucher.fees)}</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Frais</span><span className="text-white/50">{formatAr(voucher.fees)}</span></div>
                    </div>
                    {/* Barcode visual */}
                    <div className="bg-white rounded-xl p-3 flex flex-col items-center gap-1">
                      <div className="w-full h-10 bg-slate-900 flex items-center justify-center font-mono text-[9px] text-white/30 tracking-[0.4em] select-none px-2">
                        ||| || ||| | |||| || ||| | ||||||
                      </div>
                      <p className="text-[9px] font-mono font-bold text-slate-500 tracking-widest">{voucher.code}</p>
                    </div>
                    <p className="text-[10px] text-center text-white/40">Présentez ce bon au comptoir dans les 24 heures.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════
            TAB RECEVOIR
        ════════════════════════════════ */}
        {tab === "recevoir" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Recevoir des F-Stars</h1>
              <p className="text-sm text-slate-500 mt-1">Partagez votre QR code ou votre adresse pour recevoir des F-Stars et augmenter vos Gains.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

              {/* QR Display */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center gap-5">
                <div>
                  <p className="text-center font-bold text-slate-900">{activeProfile.name}</p>
                  <p className="text-center text-xs text-slate-500 mt-0.5">{activeProfile.role}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                  <div className="w-44 h-44 bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center">
                    <div className="absolute top-2 left-2 h-6 w-6 border-t-[3px] border-l-[3px] border-amber-400 rounded-tl-sm" />
                    <div className="absolute top-2 right-2 h-6 w-6 border-t-[3px] border-r-[3px] border-amber-400 rounded-tr-sm" />
                    <div className="absolute bottom-2 left-2 h-6 w-6 border-b-[3px] border-l-[3px] border-amber-400 rounded-bl-sm" />
                    <div className="absolute bottom-2 right-2 h-6 w-6 border-b-[3px] border-r-[3px] border-amber-400 rounded-br-sm" />
                    <div className="grid grid-cols-5 gap-1 w-28 h-28">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`rounded-[2px] ${[0, 2, 4, 6, 8, 11, 14, 16, 18, 20, 22, 24].includes(i) ? "bg-amber-400" : "bg-slate-800"}`} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Adresse FPay</p>
                    <p className="text-sm font-mono font-semibold text-slate-700">{activeProfile.email}</p>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(activeProfile.email); toast.success("Adresse copiée !"); }}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Config + Simulator */}
              <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <h2 className="font-bold text-slate-800">Configurer ma demande</h2>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Montant en F-Stars (facultatif)</label>
                    <div className="relative">
                      <Star className="h-4 w-4 absolute left-3.5 top-3.5 text-amber-400 fill-amber-400" />
                      <input type="number" placeholder="ex: 50" value={qrStars} onChange={e => setQrStars(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 outline-none focus:border-amber-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motif</label>
                    <input type="text" placeholder="ex: Support live du soir, Commande artiste..." value={qrNote} onChange={e => setQrNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-amber-400" />
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-3">
                  <h2 className="font-bold text-indigo-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-indigo-500" /> Simulateur de paiement
                  </h2>
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    Cliquez pour simuler un utilisateur qui scanne votre QR et vous envoie les F-Stars demandés. Vos Gains augmenteront immédiatement.
                  </p>
                  <button onClick={handleSimulateScan} disabled={scanLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl py-3 transition-colors flex items-center justify-center gap-2">
                    {scanLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><QrCode className="h-4 w-4" /> Simuler la réception de {qrStars || "50"} F-Stars</>}
                  </button>
                </div>

                {/* Card Generator */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-500" /> Générer une Carte Virtuelle
                  </h2>
                  <p className="text-xs text-slate-500">Convertissez vos Gains en carte bancaire internationale (Visa/Mastercard).</p>
                  <form onSubmit={handleGenCard} className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input type="number" placeholder="Montant en Ar" value={vcAmt} onChange={e => setVcAmt(e.target.value)} required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-2.5 text-sm text-slate-700 outline-none focus:border-purple-400" />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Ar</span>
                      </div>
                      <select value={vcProv} onChange={e => setVcProv(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm text-slate-700 outline-none">
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                      </select>
                    </div>
                    <button type="submit" disabled={vcLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold text-sm rounded-xl py-2.5 transition-colors flex items-center justify-center gap-2">
                      {vcLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer ma carte"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Virtual Cards Display */}
            {virtualCards.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-bold text-slate-800">Mes Cartes Virtuelles</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {virtualCards.map((c, i) => (
                    <div key={i} className={`rounded-2xl p-5 shadow-md flex flex-col justify-between h-36 relative overflow-hidden bg-gradient-to-br ${c.provider === "Visa" ? "from-indigo-600 to-blue-700" : "from-slate-700 to-slate-900"}`}>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded uppercase">{c.provider}</span>
                        <Shield className="h-5 w-5 text-white/30" />
                      </div>
                      <div>
                        <p className="text-sm font-mono tracking-widest text-white">{c.cardNumber}</p>
                        <div className="flex gap-4 text-[10px] text-white/60 mt-1">
                          <span>EXP <strong className="text-white">{c.expiry}</strong></span>
                          <span>CVV <strong className="text-white">{c.cvv}</strong></span>
                          <span className="ml-auto font-bold text-white">{c.amount.toLocaleString()} Ar</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════
            TAB PAYER (API Marchand)
        ════════════════════════════════ */}
        {tab === "payer" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Payer chez un Marchand</h1>
              <p className="text-sm text-slate-500 mt-1">Démonstration du bouton de paiement FPay intégré sur un site e-commerce partenaire.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

              {/* Simulated e-commerce */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <span>shopmada.mg — Produit High-Tech</span>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex gap-4 items-start">
                    <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 shadow-inner shrink-0">JBL</div>
                    <div>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase">Audio High-End</p>
                      <h3 className="font-black text-slate-900">{merchantItem.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">Casque Bluetooth, réduction de bruit active, autonomie 40h.</p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Prix total</p>
                      <p className="text-xl font-black text-slate-900">{formatAr(merchantItem.priceAr)}</p>
                    </div>
                    <button onClick={() => setShowMerchant(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl px-5 py-2.5 shadow-sm flex items-center gap-2 transition-colors">
                      <Store className="h-4 w-4" /> Payer avec FPay
                    </button>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
                <h2 className="font-bold text-slate-800">Comment fonctionne le paiement marchand ?</h2>
                <ul className="space-y-3 text-sm text-slate-500">
                  {[
                    "Le client paie avec ses F-Stars ou ses Gains.",
                    "Le marchand est crédité instantanément sur son compte FPay.",
                    "FPay prélève automatiquement 1.5% de commission sur chaque vente.",
                    "Le marchand peut retirer ses revenus en Mobile Money à tout moment.",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="bg-slate-900 rounded-xl p-3 font-mono text-[10px] text-indigo-400 space-y-1">
                  <p className="text-slate-500">// API FPay /checkout</p>
                  <p>{"{ merchant_id: 'ShopMada',"}</p>
                  <p>{"  amount_mga: 180000,"}</p>
                  <p>{"  commission: 1.5%,"}</p>
                  <p>{"  status: 'authorized' }"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ════ MODAL STRIPE ════ */}
      {showStripe && pack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Stripe Secure Checkout</span>
              </div>
              <button onClick={() => setShowStripe(false)} className="text-slate-400 hover:text-slate-700 font-semibold text-xs">✕ Fermer</button>
            </div>
            <form onSubmit={handleBuyCB} className="p-5 space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-[10px] text-indigo-500 font-bold uppercase">Pack sélectionné</p>
                <p className="text-xl font-black text-slate-900 mt-1">{pack.stars} F-Stars</p>
                <p className="text-2xl font-black text-indigo-600">{pack.eur}.00 €</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Numéro de carte</label>
                  <input type="text" required placeholder="4242 4242 4242 4242" value={cardNo} onChange={e => setCardNo(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Expiration</label>
                    <input type="text" required placeholder="MM/AA" value={cardExp} onChange={e => setCardExp(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">CVV</label>
                    <input type="text" required placeholder="123" value={cardCvv} onChange={e => setCardCvv(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400" />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                Facturation : <em>FPAY TOKENS MG</em>. Achat de crédits de soutien communautaire numérique. PCI-DSS conforme.
              </p>
              <button type="submit" disabled={stripeLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 shadow-sm">
                {stripeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Payer ${pack.eur}.00 €`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ════ MODAL MARCHAND ════ */}
      {showMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Paiement FPay · ShopMada</span>
              </div>
              <button onClick={() => setShowMerchant(false)} className="text-slate-400 hover:text-slate-700 font-semibold text-xs">✕</button>
            </div>
            <form onSubmit={handleMerchantPay} className="p-5 space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-[10px] text-indigo-500 font-bold uppercase">{merchantItem.name}</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">{formatAr(merchantItem.priceAr)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payer avec</p>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaySource("SOLDE_A")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${paySource === "SOLDE_A" ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <Star className={`h-4 w-4 mb-1 ${paySource === "SOLDE_A" ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                    <p className="text-[10px] font-black uppercase">Mes F-Stars</p>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{bal.soldeA} ⭐</p>
                  </button>
                  <button type="button" onClick={() => setPaySource("SOLDE_B")}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${paySource === "SOLDE_B" ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <Wallet className={`h-4 w-4 mb-1 ${paySource === "SOLDE_B" ? "text-indigo-600" : "text-slate-400"}`} />
                    <p className="text-[10px] font-black uppercase">Mes Gains</p>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">{formatAr(bal.soldeB)}</p>
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-xl p-3">
                Le marchand reçoit {formatAr(Math.round(merchantItem.priceAr * 0.985))} après déduction de la commission FPay (1.5%).
              </p>
              <button type="submit" disabled={payLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 shadow-sm">
                {payLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer le paiement"}
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        © 2026 FPay Madagascar · Plateforme d'engagement communautaire
      </footer>
    </div>
  );
}
