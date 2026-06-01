import { createFileRoute } from "@tanstack/react-router";
import { Shield, Menu } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-illustration.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FPay — Soutenez vos créateurs préférés" },
      { name: "description", content: "Achetez des F-Stars, envoyez des cadeaux numériques et participez à la communauté." },
      { property: "og:title", content: "FPay — Soutenez vos créateurs préférés" },
      { property: "og:description", content: "Achetez des F-Stars, envoyez des cadeaux numériques et participez à la communauté." },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-[var(--shadow-soft)]">
        <Shield className="h-7 w-7 text-primary-foreground" strokeWidth={2.2} fill="currentColor" fillOpacity={0.15} />
        <span className="absolute text-primary-foreground font-bold text-sm">F</span>
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">FPay</span>
    </a>
  );
}

const navItems = ["Accueil", "Créateurs", "Acheter des F-Stars", "Notre Communauté"];

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
              <li key={item}>
                <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <a href="#" className="hidden md:inline-flex rounded-full bg-[var(--accent-yellow)] px-5 py-2.5 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)] hover:scale-105 transition-transform">
            Connexion
          </a>
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground" aria-label="Menu">
            <Menu className="h-6 w-6" />
          </button>
        </nav>
        {open && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
            {navItems.map(i => (
              <a key={i} href="#" className="block text-sm font-medium text-foreground hover:text-primary">{i}</a>
            ))}
            <a href="#" className="block text-sm font-semibold text-primary">Connexion</a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-60" />
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-[var(--accent-cyan)] opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary opacity-15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Soutenez vos{" "}
              <span className="bg-[var(--gradient-primary)] bg-clip-text text-transparent">créateurs préférés</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Achetez des F-Stars, envoyez des cadeaux numériques et participez à la communauté.
            </p>
            <div>
              <a href="#" className="inline-flex items-center gap-2 rounded-full bg-[var(--gradient-primary)] px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-all">
                Commencer maintenant
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[var(--gradient-primary)] rounded-[3rem] blur-3xl opacity-30" />
            <img src={heroImage} alt="Illustration FPay créateurs et F-Stars" className="relative w-full h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
