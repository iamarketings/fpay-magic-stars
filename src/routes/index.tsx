import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  Menu,
  X,
  ArrowRight,
  Heart,
  Star,
  Send,
  Lock,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-illustration.png";
import fstarLogo from "@/assets/fstar-logo.png";
import fpayLogo from "@/assets/fpay-logo.png";
import mobileMockup from "@/assets/fpay_mobile_mockup.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FPay — Le Réseau de Soutien Numérique" },
      { name: "description", content: "Soutenez vos créateurs préférés avec FPay. Obtenez des FStar et animez la communauté." },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <Link to="/" className="flex items-center group">
      <img src={fpayLogo} alt="FPay Logo" className="h-10 w-auto rounded-xl shadow-sm group-hover:opacity-90 transition-opacity" />
    </Link>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Que sont les FStar ?",
      a: "Les FStar sont l'unique unité de valeur circulant sur notre plateforme. Ce sont des jetons numériques utilisés par les membres pour échanger des services et se récompenser au sein de la communauté.",
    },
    {
      q: "Comment les membres de la communauté peuvent-ils utiliser leurs FStar ?",
      a: "Vos FStar peuvent être transférés instantanément à d'autres membres (P2P), ou utilisés pour récompenser quelqu'un pour un service rendu à la communauté FPay.",
    },
    {
      q: "Peut-on convertir les FStar en espèces (Cash-out) ?",
      a: "Non. FPay fonctionne strictement en circuit fermé pour assurer une sécurité maximale. Aucune logique de retrait en cash ou de paiement marchand direct n'existe sur le réseau.",
    },
    {
      q: "Comment est assurée la sécurité de mon portefeuille ?",
      a: "FPay est non-custodial. Vos clés cryptographiques (Ed25519) sont générées et stockées uniquement sur votre appareil. Nous n'avons jamais accès à vos fonds.",
    }
  ];

  const navLinks = [
    { label: "Accueil", href: "#accueil" },
    { label: "Services", href: "#services" },
    { label: "FStar", href: "#fstar" },
    { label: "FAQ", href: "#faq" }
  ];

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-slate-600 flex flex-col font-sans selection:bg-blue-500/30">

      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2">
        <Lock className="h-4 w-4 text-blue-200" />
        <span>Découvrez le réseau d'engagement en circuit fermé 100% sécurisé.</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <nav className="mx-auto max-w-7xl px-6 h-24 flex items-center justify-between">
          <Logo />

          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); scrollTo(item.href); }}
                  className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 px-6 py-3 transition-all"
            >
              Mode Sandbox
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white px-6 py-3 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Accéder au Wallet
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-400 hover:text-blue-600 focus:outline-none">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-24 left-0 w-full bg-white border-b border-slate-100 shadow-xl px-6 py-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => { e.preventDefault(); scrollTo(item.href); }}
                className="text-lg font-bold text-slate-700 py-2 border-b border-slate-50"
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Link to="/dashboard" className="w-full text-center rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 px-6 py-4">
                Mode Sandbox
              </Link>
              <Link to="/dashboard" className="w-full text-center rounded-xl bg-blue-600 text-sm font-bold text-white px-6 py-4 shadow-md">
                Accéder au Wallet
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="accueil" className="relative overflow-hidden pt-24 pb-32">
        {/* Glow effects */}
        <div className="absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-blue-100 blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-50 blur-[120px] -z-10" />

        <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-16 items-center">

          <div className="lg:col-span-6 space-y-10 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-xs font-bold text-blue-600">
              <Shield className="h-4 w-4" />
              <span>Réseau communautaire fermé (Non-Custodial)</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1]">
              L'écosystème de votre <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">communauté</span>
            </h1>

            <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Obtenez des <strong className="text-blue-600">FStar</strong>, soutenez vos créateurs, transférez des jetons entre membres et récompensez les services au sein de notre communauté exclusive.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all duration-300"
              >
                Ouvrir mon Wallet <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Micro stats */}
            <div className="pt-8 border-t border-slate-100 flex justify-center lg:justify-start gap-12 text-sm text-slate-500">
              <div><strong className="block text-2xl font-black text-slate-900">10k+</strong> Membres Actifs</div>
              <div className="w-px h-12 bg-slate-200"></div>
              <div><strong className="block text-2xl font-black text-blue-600">1.2M</strong> FStar échangés</div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-blue-200 rounded-[3rem] blur-2xl opacity-40 rotate-6" />
              <img
                src={heroImage}
                alt="Illustration FPay"
                className="relative w-full h-auto drop-shadow-2xl rounded-3xl object-cover hover:scale-[1.02] transition-transform duration-700"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              {/* Fallback box if image missing */}
              <div className="absolute inset-0 bg-slate-50 border border-slate-200 rounded-3xl -z-10 flex items-center justify-center">
                <Shield className="h-32 w-32 text-blue-100" />
              </div>

              {/* Badge 1 */}
              <div className="absolute -top-6 -left-8 bg-white/90 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce-slow">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-black tracking-widest">Ed25519 Local</span>
                  <span className="text-sm font-bold text-slate-900">Sécurité Absolue</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="services" className="py-32 relative z-10 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-16">

          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-block text-sm font-black text-blue-600 bg-blue-100 px-4 py-1.5 rounded-full">
              L'écosystème FPay
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Soutien à la communauté
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Découvrez toutes les possibilités offertes par le jeton FStar, 100% géré localement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl hover:shadow-lg transition-all group">
              <div className="h-14 w-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Soutien aux créateurs</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Envoyez des FStar instantanément. La transaction est signée avec vos clés locales et le membre peut directement les utiliser sur le réseau.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl hover:shadow-lg transition-all group">
              <div className="h-14 w-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Star className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Récompense de services</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Utilisez vos FStar pour rémunérer un service rendu à la communauté (modération, art, entraide) via un transfert direct.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl hover:shadow-lg transition-all group">
              <div className="h-14 w-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Send className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Transfert P2P</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Échangez vos jetons librement et en toute sécurité avec n'importe quel autre membre du réseau grâce aux clés cryptographiques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Qu'est-ce que FStar ? */}
      <section id="fstar" className="py-32 relative bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-4 py-1.5 rounded-full">
              Le Jeton
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              Qu'est-ce que FStar ?
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              FStar est l'unité de valeur au cœur de l'écosystème FPay. Conçu pour récompenser l'engagement, il permet aux membres de la communauté de s'échanger des services, de soutenir les créateurs et de transférer de la valeur de manière fluide et sécurisée.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Star className="h-4 w-4" />
                </div>
                <span className="text-slate-700 font-bold">Unité d'échange exclusive et sécurisée</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-slate-700 font-bold">Circuit fermé : pas de cash-out</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Heart className="h-4 w-4" />
                </div>
                <span className="text-slate-700 font-bold">Récompensez le soutien et l'entraide</span>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-blue-50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
            <div className="bg-white border border-slate-200 p-12 rounded-[3rem] shadow-xl text-center space-y-6">
              <img src={fstarLogo} alt="FStar Logo" className="h-40 w-40 object-contain mx-auto" />
              <h3 className="text-2xl font-black text-slate-900">Le moteur de FPay</h3>
              <p className="text-slate-500 text-sm">
                Plus vous participez à la communauté, plus vous pouvez accumuler et utiliser des FStar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-4 py-1.5 rounded-full">
              Foire Aux Questions
            </span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Tout savoir sur FPay</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between font-bold text-slate-800 text-left hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-4">
                    <HelpCircle className="h-5 w-5 text-blue-600 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-2 animate-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Mobile Section */}
      <section className="py-32 relative bg-slate-900 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 text-center lg:text-left">
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest bg-blue-900/50 border border-blue-800/50 px-4 py-1.5 rounded-full">
              L'expérience Mobile
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              Votre portefeuille sécurisé, <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">toujours à portée de main.</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Téléchargez l'application FPay et profitez de transactions instantanées, sans frais cachés. Vos clés cryptographiques restent sur votre téléphone pour une sécurité absolue.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {/* App Store Button */}
              <button className="flex items-center gap-3 bg-black hover:bg-slate-800 border border-slate-700 text-white rounded-2xl px-6 py-3 transition-transform hover:scale-105 duration-300 w-full sm:w-auto justify-center">
                <svg viewBox="0 0 384 512" className="h-8 w-8 fill-current">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] font-medium text-slate-300 uppercase tracking-wide">Télécharger dans l'</div>
                  <div className="text-lg font-bold leading-none mt-0.5">App Store</div>
                </div>
              </button>

              {/* Google Play Button */}
              <button className="flex items-center gap-3 bg-black hover:bg-slate-800 border border-slate-700 text-white rounded-2xl px-6 py-3 transition-transform hover:scale-105 duration-300 w-full sm:w-auto justify-center">
                <svg viewBox="0 0 512 512" className="h-8 w-8 fill-current">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] font-medium text-slate-300 uppercase tracking-wide">Disponible sur</div>
                  <div className="text-lg font-bold leading-none mt-0.5">Google Play</div>
                </div>
              </button>
            </div>
          </div>
          
          <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0">
            {/* Phone Mockup Frame */}
            <div className="relative w-full max-w-[320px] aspect-[1/2.1] rounded-[3rem] border-8 border-slate-800 bg-slate-900 shadow-2xl overflow-hidden transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-slate-800 rounded-b-xl z-20"></div>
              {/* Screen Content */}
              <img src={mobileMockup} alt="FPay Mobile App" className="w-full h-full object-cover scale-105" />
            </div>
            
            {/* Decorative floaters */}
            <div className="absolute top-1/4 -right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl animate-bounce-slow">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="absolute bottom-1/4 -left-8 bg-blue-600 p-4 rounded-2xl shadow-2xl animate-bounce-slow" style={{ animationDelay: '1s' }}>
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Prêt à rejoindre l'écosystème ?</h2>
          <p className="text-slate-500 text-lg">Expérimentez le réseau fermé FPay via notre Dashboard Sandbox, découvrez le fonctionnement des clés locales Ed25519.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 text-white font-black px-10 py-5 shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300"
          >
            Accéder au Dashboard Démo
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 bg-slate-50">
        <p>© 2026 FPay. Réseau Communautaire.</p>
      </footer>
    </div>
  );
}
