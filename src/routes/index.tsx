import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Gift,
  Heart,
  Lock,
  Tag,
  Store,
  Star,
  Share2
} from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-illustration.png";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FPay — Le Réseau de Soutien Numérique" },
      { name: "description", content: "Soutenez vos créateurs préférés avec FPay. Achetez des FSTART et animez la communauté." },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform duration-300">
        <Shield className="h-6 w-6 text-white" strokeWidth={2.2} fill="currentColor" fillOpacity={0.2} />
        <span className="absolute text-white font-bold text-sm">F</span>
      </div>
      <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">FPay<span className="text-blue-500">.</span></span>
    </Link>
  );
}

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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
    toast.success(`Cadeau simulé : +${amount} FSTART envoyés à ${name}.`, {
      description: "Ils pourront utiliser ces FSTART dans notre écosystème.",
    });
  };

  const faqs = [
    {
      q: "Que sont les FSTART ?",
      a: "Les FSTART sont des jetons numériques achetés par les utilisateurs pour soutenir les créateurs et consommer sur FPay. Ils constituent une vente de service numérique et ne sont pas remboursables, garantissant une conformité totale avec les régulations Stripe.",
    },
    {
      q: "Comment les membres de la communauté peuvent-ils utiliser leurs FSTART ?",
      a: "Vos FSTART peuvent être utilisés pour soutenir un créateur, générer des Bons d'Achat chez nos partenaires à Madagascar (Hôtels, Restaurants, Supermarchés) ou payer directement des marchands du réseau FPay.",
    },
    {
      q: "Peut-on retirer l'argent vers un compte bancaire ou Mobile Money ?",
      a: "Non. FPay fonctionne en circuit fermé pour assurer une sécurité maximale et prévenir le blanchiment d'argent. Les FSTART sont uniquement consommés à l'intérieur de l'écosystème FPay (Paiements marchands, Vouchers).",
    },
    {
      q: "Comment fonctionne le programme d'affiliation communautaire ?",
      a: "Vous pouvez inviter vos amis à rejoindre la communauté FPay en partageant votre lien de parrainage. Pour chaque nouvel utilisateur actif, vous recevez un bonus en FSTART directement sur votre portefeuille !",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-600 flex flex-col font-sans selection:bg-blue-500/30">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4 text-blue-200" />
        <span>Découvrez le réseau d'engagement en circuit fermé certifié Stripe.</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <nav className="mx-auto max-w-7xl px-6 h-24 flex items-center justify-between">
          <Logo />
          
          <ul className="hidden md:flex items-center gap-8">
            {["Accueil", "Créateurs", "Affiliation", "Marchands"].map((item) => (
              <li key={item}>
                <a href={`#`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
                  {item}
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

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-400 hover:text-blue-600">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Glow effects */}
        <div className="absolute top-1/4 -left-32 h-[500px] w-[500px] rounded-full bg-blue-100 blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-50 blur-[120px] -z-10" />

        <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-6 space-y-10 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 text-xs font-bold text-blue-600">
              <Sparkles className="h-4 w-4" />
              <span>SaaS d'engagement nouvelle génération</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1]">
              La monnaie de la <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">communauté</span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Achetez des <strong className="text-blue-600">FSTART</strong>, soutenez vos créateurs, parrainez vos amis et consommez chez nos marchands partenaires à Madagascar en toute simplicité.
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
              <div><strong className="block text-2xl font-black text-blue-600">1.2M</strong> FSTART échangés</div>
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
                  <span className="text-[10px] text-slate-400 block uppercase font-black tracking-widest">Stripe Secure</span>
                  <span className="text-sm font-bold text-slate-900">Conformité Absolue</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 relative z-10 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-100 px-4 py-1.5 rounded-full">
              L'écosystème FPay
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              Le portefeuille de votre communauté
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Découvrez toutes les possibilités offertes par le jeton FSTART.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl hover:shadow-lg transition-all group">
              <div className="h-14 w-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Gift className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Soutien aux créateurs</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Envoyez des FSTART instantanément. La transaction est validée et le créateur peut directement les utiliser sur le réseau.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl hover:shadow-lg transition-all group">
              <div className="h-14 w-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Store className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Consommation locale</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Utilisez vos FSTART pour générer des bons d'achat ou payer directement nos partenaires locaux (Supermarchés, Hôtels).
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl hover:shadow-lg transition-all group">
              <div className="h-14 w-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Affiliation Communautaire</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Partagez votre lien FPay. Chaque nouvel ami rejoignant la communauté vous fait gagner des FSTART en récompense !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Creators */}
      <section className="py-32 relative bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Testez l'envoi de FSTART</h2>
            <p className="text-slate-500">Simulez le soutien à un créateur et voyez sa popularité augmenter en temps réel.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { id: "clara", name: "Clara Stream", role: "Gaming & Vibe", score: creatorStars.clara, color: "from-blue-400 to-blue-600", initials: "CS" },
              { id: "jean", name: "Jean Gaming", role: "Pro Esports", score: creatorStars.jean, color: "from-blue-500 to-indigo-600", initials: "JG" },
              { id: "olivia", name: "Olivia Art", role: "Illustratrice 2D", score: creatorStars.olivia, color: "from-sky-400 to-blue-500", initials: "OA" },
            ].map(c => (
              <div key={c.id} className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col items-center text-center relative hover:shadow-xl transition-shadow">
                <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center font-black text-white text-2xl mb-4 shadow-md`}>
                  {c.initials}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{c.name}</h3>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1 mb-6">{c.role}</span>
                
                <div className="w-full bg-slate-50 rounded-2xl p-4 flex justify-between items-center border border-slate-100 mb-6">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Solde FSTART</span>
                  <span className="font-black text-slate-900 text-lg flex items-center gap-2">{c.score} <Star className="h-4 w-4 text-blue-500 fill-blue-500"/></span>
                </div>

                <div className="w-full flex gap-2">
                  <button onClick={() => handleSupportCreator(c.id as any, 10)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-slate-200">
                    <Heart className="h-4 w-4 text-slate-400" /> +10
                  </button>
                  <button onClick={() => handleSupportCreator(c.id as any, 50)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm flex items-center justify-center gap-2">
                    <Star className="h-4 w-4 text-white fill-white" /> +50
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Questions Fréquentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between font-bold text-slate-800 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-4">
                    <HelpCircle className="h-5 w-5 text-blue-600 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 text-center relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 space-y-8">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">Prêt à rejoindre l'écosystème ?</h2>
          <p className="text-slate-500">Expérimentez le réseau de paiement FPay via notre Dashboard Sandbox.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 text-white font-black px-10 py-5 shadow-lg shadow-blue-600/30 hover:scale-105 transition-all duration-300"
          >
            Accéder au Dashboard Démo
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500 bg-slate-50">
        <p>© 2026 FPay Madagascar. Modèle Circuit Fermé — Conformité Stripe Atlas.</p>
      </footer>
    </div>
  );
}
