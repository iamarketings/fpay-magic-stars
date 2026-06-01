import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Users,
  CreditCard,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Gift,
  Heart,
  TrendingUp,
  Lock,
} from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-illustration.png";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FPay — Plateforme d'Engagement & Micro-Soutien" },
      { name: "description", content: "Soutenez vos créateurs préférés avec FPay. Achetez des jetons de service F-Stars pour envoyer des cadeaux virtuels et animer la communauté." },
      { property: "og:title", content: "FPay — Valorisation de Contenu & Micro-Soutien" },
      { property: "og:description", content: "Découvrez notre plateforme d'engagement communautaire. Vente sécurisée de F-Stars pour encourager la création numérique." },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.4)] group-hover:scale-105 transition-transform duration-300">
        <Shield className="h-6 w-6 text-white" strokeWidth={2.2} fill="currentColor" fillOpacity={0.1} />
        <span className="absolute text-white font-bold text-sm">F</span>
      </div>
      <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">FPay</span>
    </Link>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Local demo state for interactive creator cards on the landing page
  const [creatorStars, setCreatorStars] = useState({
    clara: 1420,
    jean: 850,
    olivia: 2115,
  });

  const handleSupportCreator = (name: "clara" | "jean" | "olivia", amount: number) => {
    setCreatorStars((prev) => ({
      ...prev,
      [name]: prev[name] + amount,
    }));
    toast.success(`Merci ! Vous avez simulé l'envoi de ${amount} ⭐ à ${name === 'clara' ? 'Clara Stream' : name === 'jean' ? 'Jean Gaming' : 'Olivia Art'}.`, {
      description: "Pour faire cela en direct, connectez-vous au tableau de bord.",
    });
  };

  const navItems = [
    { label: "Accueil", href: "#" },
    { label: "Créateurs", href: "#creators" },
    { label: "Comment ça marche", href: "#how-it-works" },
    { label: "Sécurité", href: "#security" },
  ];

  const faqs = [
    {
      q: "Que sont les F-Stars ?",
      a: "Les F-Stars sont des crédits virtuels internes achetés par les utilisateurs pour soutenir les créateurs sur FPay. Ils constituent une vente de service numérique (micro-engagement) et ne peuvent en aucun cas être reconvertis en monnaie par l'acheteur, garantissant une conformité totale avec les régulations de paiement internationales.",
    },
    {
      q: "Comment les créateurs sont-ils récompensés ?",
      a: "Lorsqu'un utilisateur envoie des F-Stars à un créateur, le système crédite le compte du créateur en F-Credits (Gains). Ces F-Credits mesurent la valeur générée et l'engagement de l'audience, et peuvent être retirés par le créateur via nos partenaires de paiement locaux.",
    },
    {
      q: "Le paiement est-il sécurisé ?",
      a: "Oui, à 100%. L'achat de packs de F-Stars est opéré par Stripe, leader mondial du paiement en ligne. Toutes les transactions par carte bancaire sont chiffrées selon la norme PCI-DSS. Vos coordonnées bancaires ne transitent jamais par nos serveurs.",
    },
    {
      q: "Quelle est la politique de remboursement ?",
      a: "Conformément à nos CGU de services numériques, l'achat de jetons virtuels F-Stars est définitif dès leur crédit sur le compte de l'utilisateur. En cas de problème technique lors du paiement, notre support est à votre disposition pour régulariser la transaction sous 48h.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans scroll-smooth">
      {/* Top Banner (Audit/Stripe indicator) */}
      <div className="bg-indigo-900 text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
        <span>Découvrez le futur de l'engagement communautaire pour créateurs.</span>
      </div>

      {/* Floating Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        <nav className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">
          <Logo />
          
          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-sm font-semibold text-slate-700 px-5 py-2.5 transition-all"
            >
              Démo Interactive
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white px-6 py-2.5 shadow-[0_4px_14px_-2px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Connexion
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-indigo-600 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-6 space-y-4 shadow-lg animate-in slide-in-from-top-4 duration-200">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block text-base font-medium text-slate-700 hover:text-indigo-600 transition-colors py-1"
              >
                {item.label}
              </a>
            ))}
            <div className="h-[1px] bg-slate-100 my-2"></div>
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold text-slate-700 py-3 transition-colors"
            >
              Démo Interactive
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white py-3 shadow-md"
            >
              Connexion
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 py-20 lg:py-28">
        {/* Glow spots */}
        <div className="absolute top-1/4 -left-20 h-[350px] w-[350px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-[450px] w-[450px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3.5 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SaaS d'engagement de nouvelle génération</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Soutenez vos <br />
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">créateurs préférés</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Achetez des packs de **F-Stars**, débloquez du contenu exclusif, et envoyez des cadeaux virtuels en toute sécurité pour encourager votre communauté.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-base font-semibold text-white px-8 py-4 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.5)] transition-all duration-200 group"
              >
                <span>Commencer maintenant</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-50 text-base font-semibold text-slate-700 border border-slate-300 px-8 py-4 shadow-sm hover:border-slate-400 transition-all duration-200"
              >
                Accéder au Sandbox
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="pt-6 border-t border-slate-200/80 flex justify-center lg:justify-start gap-8 text-xs text-slate-500">
              <div>
                <strong className="block text-lg font-bold text-slate-900">10k+</strong>
                Membres actifs
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <div>
                <strong className="block text-lg font-bold text-slate-900">1.2M+</strong>
                Étoiles échangées
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <div>
                <strong className="block text-lg font-bold text-slate-900">0%</strong>
                Frais d'achat client
              </div>
            </div>
          </div>

          {/* Right Image + Glassmorphic Badges */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative max-w-[480px] w-full">
              {/* Decorative back-panel glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-[2.5rem] blur-2xl opacity-15 rotate-3 scale-95" />
              
              <img
                src={heroImage}
                alt="Illustration FPay créateurs et F-Stars"
                className="relative w-full h-auto drop-shadow-[0_15px_35px_rgba(0,0,0,0.1)] rounded-2xl object-cover hover:scale-[1.01] transition-transform duration-500"
              />

              {/* Floating Badge 1 (Stripe Verified) */}
              <div className="absolute -top-4 -left-6 bg-white/95 backdrop-blur border border-slate-200 p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Shield className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Sécurité Stripe</span>
                  <span className="text-xs font-semibold text-slate-800">Paiement 100% Certifié</span>
                </div>
              </div>

              {/* Floating Badge 2 (Live conversion counter) */}
              <div className="absolute -bottom-4 -right-6 bg-white/95 backdrop-blur border border-slate-200 p-3.5 rounded-2xl shadow-xl space-y-1.5 w-44">
                <span className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">Engagement communautaire</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Pack Actif</span>
                  <span className="font-bold text-amber-500">Gold Star</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Partner Marquee (SaaS trust badges) */}
      <section className="bg-slate-100 border-y border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-4">
            Opéré de manière transparente et sécurisée avec
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="text-base font-extrabold text-slate-700 tracking-tight font-sans">Stripe Secure</span>
            <span className="text-base font-bold text-slate-700 tracking-tight">Visa & Mastercard</span>
            <span className="text-base font-bold text-slate-700 tracking-tight">Mvola Gateway</span>
            <span className="text-base font-bold text-slate-700 tracking-tight">Orange Money API</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              Pourquoi FPay ?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Une plateforme conçue pour valoriser le contenu numérique
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              FPay offre un environnement d'engagement interactif respectant rigoureusement les normes internationales de paiement pour assurer la sécurité financière de tous les acteurs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-6">
            
            {/* Card 1 */}
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl hover:shadow-lg hover:border-indigo-500/20 transition-all group">
              <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-105 transition-transform">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Jetons F-Stars</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Achetez des F-Stars de manière fluide et sécurisée. Vos étoiles vous permettent d'envoyer des encouragements et d'animer les sessions live de vos créateurs préférés.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl hover:shadow-lg hover:border-indigo-500/20 transition-all group">
              <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Soutien direct</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interagissez directement avec la communauté en ligne. Créez des micro-engagements à fort impact pour fidéliser l'audience et stimuler l'économie de contenu.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl hover:shadow-lg hover:border-indigo-500/20 transition-all group">
              <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-105 transition-transform">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Structure Sécurisée</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Grâce au principe du Double Jeton, notre solution sépare les soldes d'achat (CB Stripe) et de gains pour éviter les blocages de compte et assurer une conformité réglementaire totale.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              Fonctionnement
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Comment fonctionne FPay ?</h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Découvrez la simplicité de l'économie de soutien numérique en trois étapes rapides.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative shadow-sm">
              <span className="absolute -top-4 -left-3 h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900 mb-2 mt-2">Achetez vos F-Stars</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sélectionnez un pack d'étoiles sur notre plateforme et payez instantanément par Carte Bleue ou via vos passerelles locales.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative shadow-sm">
              <span className="absolute -top-4 -left-3 h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900 mb-2 mt-2">Envoyez des cadeaux</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Distribuez vos F-Stars aux créateurs de contenu de votre choix pour témoigner votre reconnaissance et valoriser leur travail.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl relative shadow-sm">
              <span className="absolute -top-4 -left-3 h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900 mb-2 mt-2">Conversion créateur</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Les créateurs reçoivent des F-Credits qu'ils peuvent récupérer sous forme de virement local ou échanger contre des cartes cadeaux internationales.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Creators Section (Interactive Demonstration) */}
      <section id="creators" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              Démonstration
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Soutenez les créateurs en direct</h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Cliquez sur les boutons pour simuler l'envoi de F-Stars et observez leur solde de popularité grimper instantanément.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            
            {/* Creator 1 */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between items-center text-center shadow-sm relative group">
              <div className="space-y-4 w-full">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-md">
                  CS
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Clara Stream</h3>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold uppercase">Gaming & Vibe</span>
                  <p className="text-[11px] text-slate-400 mt-2">"Streamer variété. Rejoignez l'aventure tous les soirs dès 20h !"</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Popularité</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    {creatorStars.clara} ⭐
                  </span>
                </div>
              </div>

              <div className="mt-5 w-full flex gap-1.5">
                <button
                  onClick={() => handleSupportCreator("clara", 5)}
                  className="flex-1 py-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Heart className="h-3 w-3 fill-white" /> +5 ⭐
                </button>
                <button
                  onClick={() => handleSupportCreator("clara", 20)}
                  className="flex-1 py-1.5 text-[11px] bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" /> +20 ⭐
                </button>
              </div>
            </div>

            {/* Creator 2 */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between items-center text-center shadow-sm relative group">
              <div className="space-y-4 w-full">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-md">
                  JG
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Jean Gaming</h3>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold uppercase">Pro Esports</span>
                  <p className="text-[11px] text-slate-400 mt-2">"Joueur FPS professionnel. Sessions analyses et astuces tactiques."</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Popularité</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    {creatorStars.jean} ⭐
                  </span>
                </div>
              </div>

              <div className="mt-5 w-full flex gap-1.5">
                <button
                  onClick={() => handleSupportCreator("jean", 5)}
                  className="flex-1 py-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Heart className="h-3 w-3 fill-white" /> +5 ⭐
                </button>
                <button
                  onClick={() => handleSupportCreator("jean", 20)}
                  className="flex-1 py-1.5 text-[11px] bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" /> +20 ⭐
                </button>
              </div>
            </div>

            {/* Creator 3 */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between items-center text-center shadow-sm relative group">
              <div className="space-y-4 w-full">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-md">
                  OA
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Olivia Art</h3>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold uppercase">Illustratrice 2D</span>
                  <p className="text-[11px] text-slate-400 mt-2">"Création de personnages et tutoriels de dessin numérique."</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Popularité</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    {creatorStars.olivia} ⭐
                  </span>
                </div>
              </div>

              <div className="mt-5 w-full flex gap-1.5">
                <button
                  onClick={() => handleSupportCreator("olivia", 5)}
                  className="flex-1 py-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Heart className="h-3 w-3 fill-white" /> +5 ⭐
                </button>
                <button
                  onClick={() => handleSupportCreator("olivia", 20)}
                  className="flex-1 py-1.5 text-[11px] bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-1"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" /> +20 ⭐
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Security Info Panel */}
      <section id="security" className="py-20 bg-slate-900 text-white relative">
        <div className="absolute inset-0 bg-indigo-600/5" />
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative">
          
          <div className="space-y-6">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Conformité de paiement</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Intégration Stripe Atlas Sécurisée</h2>
            
            <div className="space-y-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
              <p>
                FPay a été conçu en partenariat avec les exigences de conformité de Stripe pour sécuriser les comptes de nos utilisateurs et créateurs :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>**PCI-DSS Niveau 1 :** Vos données de cartes bancaires sont entièrement sécurisées et ne sont pas stockées sur nos serveurs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>**Régulation des jetons de service :** Les F-Stars achetées via Stripe sont des crédits de divertissement non-revendables par le client, ce qui évite les classifications de transfert d'argent non-autorisées.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>**Frais de versement transparents :** Nous appliquons des protocoles d'audit robustes pour prévenir toute fraude ou blanchiment.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Lock className="h-4.5 w-4.5 text-emerald-400" />
              Politique de Sécurité
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toutes les données de nos utilisateurs et créateurs sont protégées par chiffrement de bout en bout (SSL 256 bits). Nous appliquons également des contrôles de sécurité rigoureux sur chaque transaction pour garantir la stabilité de notre passerelle de paiement internationale.
            </p>
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">Statut Réseau</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Opérationnel
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">FAQ</span>
            <h2 className="text-3xl font-bold text-slate-900">Questions Fréquentes</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Tout savoir sur le fonctionnement des micro-engagements FPay.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-200">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between font-semibold text-slate-800 text-sm text-left transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 py-4 bg-white text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-white space-y-6">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-600/10 rounded-full blur-2xl"></div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Prêt à propulser vos créations ?</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Inscrivez-vous dès aujourd'hui sur FPay et profitez d'une démo interactive sandbox de notre système à double jeton.
            </p>

            <div>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white px-8 py-3.5 shadow-md shadow-indigo-600/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                Accéder au Dashboard Démo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stripe-Compliant Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12 text-sm">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-[0_2px_10px_-2px_rgba(79,70,229,0.4)]">
                <Shield className="h-5 w-5 text-white" strokeWidth={2.2} fill="currentColor" fillOpacity={0.1} />
                <span className="absolute text-white font-bold text-xs">F</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">FPay</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Plateforme SaaS d'engagement communautaire et de valorisation de contenus numériques pour créateurs.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Légal</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Conditions Générales d'Utilisation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Politique de Confidentialité</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Politique de Remboursement</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Solution</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">F-Stars (Jetons Virtuels)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Portail Créateur</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sécurité des transactions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Contact & Support</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>Email : support@fpay.mg</li>
              <li>Téléphone : +261 20 22 000 00</li>
              <li>Adresse : Lot IVG 42, Antananarivo, Madagascar</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 border-t border-slate-800/80 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          <p>© 2026 FPay Madagascar. Tous droits réservés.</p>
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-md text-[11px] text-slate-500 flex items-center gap-1.5 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Conformité Stripe Atlas validée — Vente de jetons de services numériques
          </div>
        </div>
      </footer>
    </div>
  );
}
