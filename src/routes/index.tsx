import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Sparkles, Gift, Users, Star, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-illustration.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FPay — Soutenez vos créateurs préférés" },
      { name: "description", content: "Achetez des F-Stars, envoyez des cadeaux numériques et participez à la communauté des créateurs." },
      { property: "og:title", content: "FPay — Soutenez vos créateurs préférés" },
      { property: "og:description", content: "La plateforme de récompenses numériques pour soutenir vos créateurs." },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[var(--shadow-soft)]">
        <Shield className="h-7 w-7 text-primary-foreground" strokeWidth={2.2} fill="currentColor" fillOpacity={0.15} />
        <span className="absolute text-primary-foreground font-bold text-sm">F</span>
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">FPay</span>
    </div>
  );
}

function Index() {
  const navItems = ["Accueil", "Créateurs", "Acheter des F-Stars", "Notre Communauté"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <nav className="mx-auto max-w-7xl px-6 h-18 py-4 flex items-center justify-between">
          <Logo />
          <ul className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item}>
                <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <button className="rounded-full bg-[var(--accent-yellow)] px-5 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)] hover:scale-105 transition-transform">
            Connexion
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
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
              Achetez des F-Stars, envoyez des cadeaux numériques et participez à la communauté.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button className="group inline-flex items-center gap-2 rounded-full bg-[var(--gradient-primary)] px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-all">
                Commencer maintenant
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a href="#" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                Découvrir les créateurs →
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

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-3 gap-6">
        {[
          { icon: Sparkles, title: "F-Stars instantanés", desc: "Achetez et envoyez des étoiles numériques en quelques secondes." },
          { icon: Gift, title: "Cadeaux personnalisés", desc: "Une bibliothèque de cadeaux numériques uniques pour vos créateurs." },
          { icon: Users, title: "Communauté vibrante", desc: "Rejoignez des milliers de fans et créateurs passionnés." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="group relative rounded-2xl border border-border bg-card p-7 hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1 transition-all">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--gradient-primary)] text-primary-foreground mb-5 shadow-[var(--shadow-soft)]">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border/60 mt-10">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-muted-foreground">© 2026 FPay. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
