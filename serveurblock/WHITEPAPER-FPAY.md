# FPay / Magic Stars — Whitepaper Technique

**Version 1.0 — Juin 2026**

---

## Résumé Exécutif

FPay est une plateforme transactionnelle à **circuit fermé** conçue pour l'inclusion financière à Madagascar. Elle permet à tout utilisateur d'accéder à un wallet numérique avec double solde : des jetons numériques (F-Stars) pour les transferts et des gains en Ariary pour la consommation sur la plateforme.

Le système repose sur trois piliers : un cash-in via **Stripe** (cartes bancaires), un registre cryptographique immuable en **Rust** (Ed25519) pour les transferts P2P, et une consommation interne via **paiement marchand** et **bons d'achat**.

Aucun argent ne sort du système — garantissant une conformité totale avec les régulations Stripe et une prévention absolue du blanchiment d'argent.

---

## 1. Problématique et Contexte

### 1.1 Inclusion financière à Madagascar

Madagascar compte plus de **15 millions d'abonnés Mobile Money** mais moins de 10 % de la population possède un compte bancaire. Les transferts d'argent et les paiements numériques restent un défi majeur.

### 1.2 Les limites des solutions existantes

| Problème | Impact |
|---|---|
| Pas de wallet multi-devise | Impossible de séparer l'usage de l'épargne |
| Pas de registre de transferts | Auditabilité limitée |
| KYC absent ou incomplet | Risque de fraude |
| Cash-out non maîtrisé | Conformité réglementaire complexe |
| Dépendance aux opérateurs | Verrouillage propriétaire |

### 1.3 La vision FPay

Créer un **ledger ouvert, cryptographiquement signé, en circuit fermé**, permettant l'achat de jetons numériques, leur circulation entre utilisateurs, et leur consommation sur la plateforme — sans jamais sortir d'argent réel vers l'extérieur.

---

## 2. Architecture du Système

```
                    ┌──────────────────────────────┐
                    │      FRONTEND REACT           │
                    │  TanStack Router/Query        │
                    └────────────┬─────────────────┘
                                 │ API REST
                    ┌────────────▼─────────────────┐
                    │    BACKEND RUST (AXUM)        │
                    │                               │
                    │  Handlers → Services → DB     │
                    │  JWT · KYC · Ed25519 · AES   │
                    └────────────┬─────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
        ┌──────────┐     ┌──────────────┐     ┌──────────┐
        │ STRIPE   │     │  SUPABASE    │     │ CASH-OUT │
        │ Cash-In  │     │  PostgreSQL  │     │ Fermé    │
        │ Cartes   │     │  Auth + JWT  │     │ Vouchers │
        └──────────┘     └──────────────┘     │ Marchands│
                                              └──────────┘
```

### 2.1 Flux de bout en bout

```
UTILISATEUR              FRONTEND              BACKEND RUST              STRIPE
    │                        │                      │                      │
    │ 1. Inscription         │                      │                      │
    │ (clé Ed25519) ────────►│ POST /profiles       │                      │
    │                        │─────────────────────►│                      │
    │                        │◄── 201 ─────────────│                      │
    │                        │                      │                      │
    │ 2. KYC ───────────────►│ POST /kyc            │                      │
    │                        │─────────────────────►│                      │
    │ 3. Admin valide        │                      │                      │
    │                        │ POST /kyc/verify     │                      │
    │                        │ Authority Signature  │                      │
    │                        │◄── verified ────────│                      │
    │                        │                      │                      │
    │ 4. Achat F-Stars       │                      │                      │
    │ ──────────────────────►│ POST /buy-cb ───────►│ PaymentIntent        │
    │                        │                      │─────────────────────►│
    │                        │◄── client_secret ────│◄── confirm ─────────│
    │                        │                      │                      │
    │ 5. Paiement confirmé   │                      │                      │
    │                        │ WEBHOOK /stripe      │                      │
    │                        │◄──── SUCCESS ────────│◄── event ───────────│
    │                        │ solde_a crédité      │                      │
    │                        │                      │                      │
    │ 6. Transfert P2P       │                      │                      │
    │ ──────────────────────►│ POST /transfer ─────►│ Vérifie KYC + nonce  │
    │                        │                      │ FOR UPDATE           │
    │                        │◄── completed ───────│ Débite A, crédite B  │
    │                        │                      │                      │
    │ 7. Paiement Marchand   │                      │                      │
    │ ──────────────────────►│ POST /pay-merchant ─►│ Débite B, crédite    │
    │                        │                      │ commerçant (1.5%)    │
    │                        │                      │                      │
    │ 8. Bon d'Achat         │                      │                      │
    │ ──────────────────────►│ POST /redeem ───────►│ Débite B, génère     │
    │                        │                      │ code voucher         │
```

---

## 3. Le Modèle en Circuit Fermé

FPay fonctionne comme une **marketplace fermée** : l'argent entre via Stripe, circule sous forme de jetons, et est consommé sur la plateforme. Aucun cash-out externe.

### 3.1 Pourquoi le circuit fermé

- **Conformité Stripe** : Stripe considère les F-Stars comme des biens numériques non remboursables
- **Prévention du blanchiment** : Pas de sortie d'argent non tracée
- **Simplicité réglementaire** : Pas de licence de transfert d'argent requise
- **Fidélisation** : Les gains restent dans l'écosystème

### 3.2 Solde A — F-Stars

Jetons numériques achetés via Stripe.

| Propriété | Valeur |
|---|---|
| Usage | Transferts P2P, paiements marchands, dons |
| Achat | 1 F-Star = 10 Ar (via Stripe) |
| Remboursable | Non — définitif à l'achat |

### 3.3 Solde B — Gains (F-Credits)

Ariary reçus via transferts P2P, consommables uniquement sur la plateforme.

| Propriété | Valeur |
|---|---|
| Usage | Paiement marchand, bons d'achat |
| Origine | Conversion Solde A → Solde B via transfert P2P |
| Sortie | Impossible — consommation interne uniquement |

### 3.4 Tableau des mouvements

| Opération | Solde A | Solde B | Frais |
|---|---|---|---|
| Achat CB (Stripe) | +stars | 0 | 0 |
| Transfert P2P (envoyeur) | -stars | 0 | 0 |
| Transfert P2P (receveur) | 0 | +stars × taux | 0 |
| Paiement Marchand (Solde A) | -stars | 0 | 0 |
| Paiement Marchand (Solde B) | 0 | -montant | 0 |
| Réception Marchand | 0 | +montant | 1,5 % |
| Bon d'Achat (Voucher) | 0 | -montant | 0 |

---

## 4. Identity Layer et KYC

### 4.1 Principe cryptographique

Chaque wallet est associé à une **paire de clés Ed25519** générée hors-ligne côté client. La clé privée ne quitte jamais le navigateur.

```
CLIENT (React)                     SERVEUR (Rust)
  Génère keypair Ed25519
  Garde PRIVATE_KEY (local)
  Envoie PUBLIC_KEY ──────────────►  Stockée dans profiles.wallet_public_key
                                     (KYC pending → wallet inactif)
```

### 4.2 Processus KYC

```
PENDING ──► DOCUMENTS ──► VERIFIED ──► SIGNED (autorité)
                              │
                          SUSPENDED (si fraude)
```

1. **Génération wallet** : Paire Ed25519 dans le navigateur, hors-ligne
2. **Inscription** : `POST /api/v1/profiles`, `kyc_status = 'pending'`
3. **Soumission KYC** : Envoi des documents d'identité
4. **Vérification admin** : Validation manuelle
5. **Signature d'autorité** : Le serveur signe le payload avec la clé maître Ed25519

### 4.3 Niveaux d'accès

| Niveau | Données | Accès |
|---|---|---|
| Public | first_name, last_name, wallet_public_key, authority_signature | Tout le monde |
| Protégé | email, téléphone (AES-256-GCM) | Utilisateur + autorisation |
| Privé | Documents KYC, historique complet | Admin uniquement |

---

## 5. Sécurité et Garanties

### 5.1 Anti-rejeu (Nonce)

Tout transfert P2P inclut un **nonce UUID** + **timestamp Unix**. Rejet si :
- Nonce déjà utilisé (PK violation → 409)
- Timestamp > 5 min d'écart avec le serveur

### 5.2 Anti-race condition (double couche)

1. **Pessimiste (Rust)** : `SELECT ... FOR UPDATE` verrouille la ligne balance
2. **Contractuel (SQL)** : `CHECK (solde_a >= 0)` et `CHECK (solde_b >= 0)`

### 5.3 Chiffrement KYC

AES-256-GCM avec rotation de clé (table `encryption_keys`).

### 5.4 Matrice de sécurité

| Problème | Solution |
|---|---|
| KYC non vérifié | Guard 401 sur toute route |
| Double-dépense | FOR UPDATE + CHECK SQL |
| Rejeu P2P | Nonce + timestamp + Ed25519 |
| JWT falsifié | Validation HS256 |
| Données KYC | AES-256-GCM + versioning |
| Webhook Stripe | Validation HMAC |
| Rate limiting | Tower middleware |
| CORS | Restreint au frontend |

---

## 6. Cash-In via Stripe

### 6.1 Flux d'achat

```
1. Frontend → POST /api/v1/transactions/buy-cb
   Body: { profile_id, stars, euro, stripe_payment_intent_id }
2. Backend valide le PaymentIntent Stripe (montant, statut)
3. Si valide : solde_a crédité, transaction 'achat' créée
4. Stripe envoie un webhook POST → /api/v1/stripe/webhook
5. Backend valide la signature HMAC (stripe-signature header)
```

### 6.2 Validation webhook

```rust
// 1. Extraire le header stripe-signature
// 2. Vérifier HMAC avec stripe_webhook_secret
// 3. Si event.type == "payment_intent.succeeded"
//    → Marquer transaction 'completed' si pas déjà fait
```

---

## 7. Frais et Économie

| Opération | Frais | Justification |
|---|---|---|
| Achat F-Stars | 0 % | Coût absorbé par la marge sur le taux |
| Transfert P2P | 0 % | Gratuit pour l'adoption |
| Paiement Marchand | 1,5 % | Prélevé sur le marchand |
| Bon d'Achat | 0 % | Promotion de l'écosystème |

Taux de change par défaut : **1 F-Star = 10 Ariary**.

---

## 8. Stack Technologique

| Technologie | Rôle |
|---|---|
| React 19 + TypeScript | Frontend |
| TanStack Router/Query | Routing + état serveur |
| Tailwind CSS v4 + shadcn/ui | UI |
| Vite 7 + Bun | Build / Runtime |
| Rust | Backend |
| Axum 0.7 | Framework HTTP |
| SQLx 0.8 | PostgreSQL |
| ed25519-dalek | Signatures |
| AES-256-GCM | Chiffrement |
| jsonwebtoken | JWT |
| Supabase | PostgreSQL + Auth |
| Stripe | Cash-in cartes bancaires |

---

## 9. Endpoints API

Base URL : `/api/v1`

### Profils & KYC
```
POST   /profiles                   → Inscription (pending)
POST   /profiles/:id/wallet        → Lier clé Ed25519
POST   /profiles/:id/kyc           → Documents
POST   /profiles/:id/kyc/verify    → [Admin] Vérifier
GET    /profiles                   → Liste paginée
```

### Balances & Transactions
```
GET    /balances/:id               → Soldes (KYC requis)
GET    /transactions/:id           → Détail
GET    /transactions/profile/:id   → Historique
```

### Cash-In
```
POST   /transactions/buy-cb        → Achat Stripe
POST   /stripe/webhook             → Notification Stripe
```

### Transferts & Paiements
```
POST   /transactions/transfer      → P2P (signé Ed25519)
POST   /transactions/pay-merchant  → Paiement marchand
POST   /transactions/redeem-voucher → Bon d'achat
```

### Admin
```
POST   /admin/exchange-rate        → Modifier taux
GET    /admin/pending-kyc          → KYC en attente
```

---

## 10. Considérations Légales

- **Vente de biens numériques non remboursables** (conforme Stripe)
- **KYC obligatoire** pour toute opération
- **Circuit fermé** : pas de sortie d'argent, pas de licence de transfert
- **Données PII chiffrées** AES-256-GCM avec rotation de clé
- **Auditabilité** : historique des transactions immuable dans PostgreSQL
- **Anti-blanchiment** : traçabilité complète, pas de cash-out externe

---

*Ce document est un whitepaper technique. Les spécifications peuvent évoluer au cours du développement.*
