import { createFileRoute } from "@tanstack/react-router";
import {
  Shield, Sparkles, Gift, Users, Star, ArrowRight, Check, Zap, Heart, TrendingUp,
  ShieldCheck, Globe, CreditCard, MessageCircle, Play, Award, ChevronRight, Menu,
} from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-illustration.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FPay — Soutenez vos créateurs préférés avec des F-Stars" },
      { name: "description", content: "FPay, la plateforme française de récompenses numériques. Achetez des F-Stars, envoyez des cadeaux et rejoignez une communauté de plus de 50 000 fans." },
      { property: "og:title", content: "FPay — Économie créateurs nouvelle génération" },
      { property: "og:description", content: "Soutenez vos créateurs préférés en toute sécurité avec FPay." },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <a href="#accueil" className="flex items-center gap-2.5">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[var(--shadow-soft)]">
        <Shield className="h-7 w-7 text-primary-foreground" strokeWidth={2.2} fill="currentColor" fillOpacity={0.15} />
        <span className="absolute text-primary-foreground font-bold text-sm">F</span>
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">FPay</span>
    </a>
  );
}

const navItems = [
  { label: "Accueil", href: "#accueil" },
  { label: "Créateurs", href: "#createurs" },
  { label: "Acheter des F-Stars", href: "#fstars" },
  { label: "Notre Communauté", href: "#communaute" },
];

function Index() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/75 border-b border-border/60">
        <nav className="mx-auto max-w-7xl px-6 h-18 py-4 flex items-center justify-between">
          <Logo />
          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="hidden md:flex items-center gap-3">
            <a href="#connexion" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Connexion</a>
            <a href="#fstars" className="rounded-full bg-[var(--accent-yellow)] px-5 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)] hover:scale-105 transition-transform">
              S'inscrire
            </a>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground" aria-label="Menu">
            <Menu className="h-6 w-6" />
          </button>
        </nav>
        {open && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
            {navItems.map(i => (
              <a key={i.label} href={i.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-foreground hover:text-primary">{i.label}</a>
            ))}
            <a href="#connexion" className="block text-sm font-semibold text-primary">Connexion</a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="accueil" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-60" />
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-[var(--accent-cyan)] opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary opacity-15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 backdrop-blur px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Économie créateurs nouvelle génération
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
              Soutenez vos<br />
              <span className="bg-[var(--gradient-primary)] bg-clip-text text-transparent">créateurs préférés</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Achetez des F-Stars, envoyez des cadeaux numériques uniques et rejoignez une communauté vibrante de fans et de créateurs passionnés. Simple, sécurisé, instantané.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href="#fstars" className="group inline-flex items-center gap-2 rounded-full bg-[var(--gradient-primary)] px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-all">
                Commencer maintenant
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#createurs" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
                <Play className="h-4 w-4" /> Voir comment ça marche
              </a>
            </div>

            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-2">
                {[0,1,2,3].map(i => (
                  <div key={i} className="h-9 w-9 rounded-full border-2 border-background" style={{background: `linear-gradient(135deg, oklch(0.${5+i} 0.15 ${200+i*30}), oklch(0.7 0.12 ${180+i*20}))`}} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-[var(--accent-yellow)]">
                  {[...Array(5)].map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">+50 000 utilisateurs actifs</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[var(--gradient-primary)] rounded-[3rem] blur-3xl opacity-30" />
            <img src={heroImage} alt="Illustration FPay créateurs et F-Stars" className="relative w-full h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: "50K+", l: "Utilisateurs actifs" },
            { v: "2 500+", l: "Créateurs vérifiés" },
            { v: "1.2M", l: "F-Stars envoyés" },
            { v: "99.9%", l: "Disponibilité" },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">{s.v}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Fonctionnalités</p>
          <h2 className="text-4xl font-bold text-foreground mb-4">Tout ce qu'il faut pour soutenir vos créateurs</h2>
          <p className="text-muted-foreground">Une plateforme pensée pour rapprocher fans et créateurs, en toute simplicité.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Sparkles, title: "F-Stars instantanés", desc: "Achetez et envoyez des étoiles numériques en quelques secondes, sans friction." },
            { icon: Gift, title: "Cadeaux personnalisés", desc: "Une bibliothèque de cadeaux numériques uniques pour marquer le coup." },
            { icon: Users, title: "Communauté vibrante", desc: "Échangez avec des milliers de fans et créateurs passionnés." },
            { icon: ShieldCheck, title: "Paiements sécurisés", desc: "Transactions chiffrées et conformes aux normes bancaires européennes." },
            { icon: Zap, title: "Notifications en temps réel", desc: "Vos créateurs reçoivent vos soutiens instantanément, où qu'ils soient." },
            { icon: Globe, title: "Disponible partout", desc: "Application web et mobile, accessible 24/7 dans toute la francophonie." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group relative rounded-2xl border border-border bg-card p-7 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gradient-primary)] text-primary-foreground mb-5 shadow-[var(--shadow-soft)]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--gradient-hero)]/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Comment ça marche</p>
            <h2 className="text-4xl font-bold text-foreground mb-4">3 étapes pour soutenir un créateur</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01", t: "Créez votre compte", d: "Inscription gratuite en moins d'une minute, sans carte requise." },
              { n: "02", t: "Achetez des F-Stars", d: "Choisissez un pack adapté à votre budget et payez en toute sécurité." },
              { n: "03", t: "Envoyez & soutenez", d: "Offrez des F-Stars et cadeaux à vos créateurs favoris en un clic." },
            ].map(s => (
              <div key={s.n} className="relative rounded-2xl bg-card border border-border p-7">
                <div className="text-5xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent mb-4">{s.n}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top creators */}
      <section id="createurs" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Créateurs en vedette</p>
            <h2 className="text-4xl font-bold text-foreground">Découvrez nos talents</h2>
          </div>
          <a href="#" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Voir tous les créateurs <ChevronRight className="h-4 w-4" />
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Léa Martin", role: "Musicienne", fans: "12.4K", hue: 252 },
            { name: "Hugo Bernard", role: "Streamer Gaming", fans: "28.1K", hue: 215 },
            { name: "Amélie Roux", role: "Illustratrice", fans: "9.8K", hue: 320 },
            { name: "Karim Benali", role: "Podcasteur", fans: "15.2K", hue: 180 },
          ].map(c => (
            <div key={c.name} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all">
              <div className="h-32" style={{background: `linear-gradient(135deg, oklch(0.6 0.18 ${c.hue}), oklch(0.8 0.14 ${c.hue + 40}))`}} />
              <div className="px-5 pb-5 -mt-10">
                <div className="h-20 w-20 rounded-2xl border-4 border-card mb-3" style={{background: `linear-gradient(135deg, oklch(0.5 0.18 ${c.hue}), oklch(0.7 0.16 ${c.hue + 60}))`}} />
                <h3 className="font-bold text-foreground">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.role}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted-foreground"><Heart className="inline h-3 w-3 mr-1" />{c.fans} fans</span>
                  <button className="text-xs font-semibold text-primary">Soutenir →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* F-Stars packs / pricing */}
      <section id="fstars" className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Packs F-Stars</p>
            <h2 className="text-4xl font-bold text-foreground mb-4">Choisissez votre pack</h2>
            <p className="text-muted-foreground">Des prix transparents, sans abonnement. Vos F-Stars n'expirent jamais.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "4,99 €", stars: "50 F-Stars", perks: ["Envoi instantané", "Cadeaux de base", "Support email"], featured: false },
              { name: "Pro", price: "19,99 €", stars: "250 F-Stars", perks: ["Tout du pack Starter", "Cadeaux premium", "Badge supporter", "+10% bonus"], featured: true },
              { name: "Élite", price: "49,99 €", stars: "700 F-Stars", perks: ["Tout du pack Pro", "Cadeaux exclusifs", "Accès VIP créateurs", "+20% bonus"], featured: false },
            ].map(p => (
              <div key={p.name} className={`relative rounded-2xl p-7 transition-all ${p.featured ? "bg-[var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)] scale-105" : "bg-background border border-border"}`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent-yellow)] text-foreground text-xs font-bold px-3 py-1 rounded-full">
                    LE PLUS POPULAIRE
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${p.featured ? "text-primary-foreground" : "text-foreground"}`}>{p.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">{p.price}</span>
                </div>
                <p className={`text-sm mb-6 ${p.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.stars}</p>
                <ul className="space-y-3 mb-7">
                  {p.perks.map(perk => (
                    <li key={perk} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 flex-shrink-0 ${p.featured ? "text-[var(--accent-yellow)]" : "text-primary"}`} />
                      <span className={p.featured ? "text-primary-foreground" : "text-foreground"}>{perk}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full rounded-full py-3 text-sm font-semibold transition-all ${p.featured ? "bg-[var(--accent-yellow)] text-foreground hover:scale-[1.02]" : "bg-foreground text-background hover:opacity-90"}`}>
                  Acheter
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            <CreditCard className="inline h-3 w-3 mr-1" /> Paiement sécurisé · Carte bancaire, PayPal, Apple Pay, Google Pay
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="communaute" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Notre communauté</p>
          <h2 className="text-4xl font-bold text-foreground mb-4">Ils nous font confiance</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { q: "FPay a complètement transformé ma relation avec mes fans. Les F-Stars c'est génial !", a: "Léa M.", r: "Musicienne", hue: 252 },
            { q: "Une interface ultra simple, des paiements rapides. Je recommande à 100%.", a: "Thomas D.", r: "Supporter", hue: 215 },
            { q: "Enfin une plateforme française qui comprend les créateurs. Bravo l'équipe !", a: "Hugo B.", r: "Streamer", hue: 320 },
          ].map(t => (
            <div key={t.a} className="rounded-2xl border border-border bg-card p-7">
              <div className="flex gap-0.5 text-[var(--accent-yellow)] mb-4">
                {[...Array(5)].map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-foreground leading-relaxed mb-5">« {t.q} »</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full" style={{background: `linear-gradient(135deg, oklch(0.5 0.18 ${t.hue}), oklch(0.7 0.16 ${t.hue + 40}))`}} />
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.a}</div>
                  <div className="text-xs text-muted-foreground">{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="text-4xl font-bold text-foreground">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Qu'est-ce qu'un F-Star ?", a: "Un F-Star est une étoile numérique que vous offrez à vos créateurs préférés pour les soutenir. Chaque F-Star représente une valeur monétaire qui leur est reversée." },
              { q: "Comment sont reversés les paiements aux créateurs ?", a: "Les créateurs reçoivent leurs paiements directement sur leur compte bancaire chaque semaine, avec des frais réduits." },
              { q: "Mes F-Stars expirent-ils ?", a: "Non, vos F-Stars n'expirent jamais et restent disponibles dans votre portefeuille tant que votre compte est actif." },
              { q: "Comment devenir créateur sur FPay ?", a: "Il suffit de créer un compte créateur, de vérifier votre identité, et de personnaliser votre page. C'est gratuit et rapide." },
              { q: "Quels moyens de paiement acceptez-vous ?", a: "Cartes bancaires (Visa, Mastercard, CB), PayPal, Apple Pay et Google Pay. Tous les paiements sont sécurisés et chiffrés." },
            ].map((f, i) => (
              <details key={i} className="group rounded-xl border border-border bg-background p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-foreground">
                  {f.q}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="connexion" className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--gradient-primary)] p-12 lg:p-16 text-center shadow-[var(--shadow-elegant)]">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[var(--accent-cyan)] opacity-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[var(--accent-yellow)] opacity-20 blur-3xl" />
          <div className="relative">
            <Award className="h-12 w-12 text-primary-foreground mx-auto mb-5" />
            <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">Prêt à rejoindre l'aventure ?</h2>
            <p className="text-primary-foreground/90 max-w-xl mx-auto mb-8 text-lg">
              Inscrivez-vous gratuitement et offrez vos premiers F-Stars dès aujourd'hui.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#fstars" className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-yellow)] px-7 py-3.5 text-base font-semibold text-foreground hover:scale-105 transition-transform">
                Créer mon compte <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#createurs" className="inline-flex items-center gap-2 rounded-full bg-background/15 backdrop-blur border border-primary-foreground/30 px-7 py-3.5 text-base font-semibold text-primary-foreground hover:bg-background/25 transition-colors">
                <MessageCircle className="h-4 w-4" /> Parler à l'équipe
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            <div className="lg:col-span-2 space-y-4">
              <Logo />
              <p className="text-sm text-muted-foreground max-w-xs">
                FPay, la plateforme française qui rapproche fans et créateurs grâce aux F-Stars.
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" /> +50 000 utilisateurs actifs
              </div>
            </div>
            {[
              { title: "Produit", links: ["Acheter des F-Stars", "Créateurs", "Cadeaux", "Tarifs"] },
              { title: "Communauté", links: ["Notre Communauté", "Devenir créateur", "Blog", "Événements"] },
              { title: "Entreprise", links: ["À propos", "Contact", "Conditions", "Confidentialité"] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold text-foreground mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 FPay. Tous droits réservés.</p>
            <div className="flex items-center gap-5 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary">Mentions légales</a>
              <a href="#" className="hover:text-primary">CGU</a>
              <a href="#" className="hover:text-primary">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
