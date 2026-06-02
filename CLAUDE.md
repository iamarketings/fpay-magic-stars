# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Globale (FPay / Magic Stars)

FPay est une plateforme transactionnelle à circuit fermé combinant Stripe pour le cash-in et un registre interne Ed25519 pour les transferts de F-Stars. Les gains (Solde B) sont consommés uniquement par paiement marchand ou bons d'achat (vouchers). Aucun cash-out externe.

### Architecture Tripartite
1. **Cash-In (Stripe)** : Achat de packs F-Stars par carte bancaire
2. **Coeur (Rust Ledger - en développement)** : Registre de transferts Ed25519 entre clés publiques, avec KYC obligatoire
3. **Consommation** : Paiement Marchand et Bons d'Achat (circuit fermé)

### Stack Actuelle (Frontend)
- **React 19** + **TypeScript 5.8**
- **TanStack Router** (fichier-based routing via plugin Vite)
- **TanStack Query** (React Query)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **shadcn/ui** (Radix UI primitives + class-variance-authority)
- **Vite 7** (build tool)
- **Bun** (runtime/package manager)
- Sonner (toasts), Lucide React (icons), Recharts (graphiques), Zod (validation)

### Structure des Répertoires

```
src/
├── main.tsx                    # Point d'entrée React
├── router.tsx                  # Configuration TanStack Router
├── routeTree.gen.ts            # Généré automatiquement
├── styles.css                  # Global Tailwind
├── routes/
│   ├── __root.tsx              # Layout racine (providers : QueryClient, FPay, Toaster)
│   ├── index.tsx               # Landing page (route /)
│   └── dashboard.tsx           # Dashboard principal (route /dashboard)
├── hooks/
│   └── use-fpay.tsx            # State management FPay (React Context)
├── lib/
│   ├── utils.ts                # Utilitaire cn() pour Tailwind merge
│   └── api/                    # API client functions (pour futur backend)
├── components/
│   └── ui/                     # Composants shadcn/ui
└── assets/                     # Images statiques
serveurblock/                   # Projet Rust Ledger (à implémenter)
```

### Modèle à Double Solde (use-fpay.tsx)

Le coeur du système est un **React Context** (`FPayProvider`) qui gère :

- **Solde A (F-Stars)** : Jetons achetés via Stripe, utilisables pour les envois
- **Solde B (F-Credits/Gains)** : Valeur en Ariary reçue via transferts, consommable par paiement marchand ou bons d'achat
- `transferP2P`: débite Solde A de l'émetteur, crédite Solde B du destinataire (taux 1 F-Star = 10 Ar)
- 3 profils simulés : `USER`, `CREATOR`, `MERCHANT`
- Frais : paiement marchand 1.5% (prélevé sur le marchand)

### Routes

| Route | Fichier | Description |
|---|---|---|
| `/` | `src/routes/index.tsx` | Landing page (hero, features, créateurs, FAQ) |
| `/dashboard` | `src/routes/dashboard.tsx` | Dashboard avec 5 tabs : Accueil, Acheter, Envoyer/Retirer, Recevoir, Payer |

### Règles Métier Importantes

- Les F-Stars achetés via Stripe sont définitifs (pas de remboursement) — conformité "vente de biens numériques"
- Stripe ne gère que le cash-in ; le circuit est fermé (pas de cash-out externe)
- KYC obligatoire pour chaque wallet (profil d'identité vérifié)
- Transferts entre clés publiques Ed25519 (pas d'email en clair pour le routage)

## Commandes

```bash
bun dev          # Lancer le serveur de développement Vite
bun build        # Build production
bun run preview  # Prévisualiser le build
bun run lint     # ESLint (flat config)
bun run format   # Prettier
```

## À Implémenter (Rust Ledger)

Le dossier `serveurblock/` est le squelette du backend Rust. Structures de données définies :

```rust
KycStatus (Pending, Verified, Suspended)
PublicProfile (first_name, last_name)
ProtectedProfile (encrypted_email, encrypted_phone)
IdentityProfile (wallet_public_key, status, public_data, protected_data, authority_signature)
IdentityPayloadToSign (wallet_public_key, status, public_data, protected_data)
```

Fonctionnalités clés à implémenter : clés Ed25519 (`ed25519-dalek`), signature d'autorité, vérification de credentials, API REST pour le frontend.
