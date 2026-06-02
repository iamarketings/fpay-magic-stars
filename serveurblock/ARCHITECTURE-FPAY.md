# Plan d'Architecture : FPay Rust Ledger (Serveurblock) — Version v5 (Circuit Fermé)

## Contexte

Le projet FPay possède un frontend React complet avec un système de double solde (F-Stars / Gains) et un Identity Layer basé sur Ed25519. Tout est actuellement mocké en mémoire dans un React Context. Le backend Rust (`serveurblock/`) est à créer de zéro. La base de données sera **Supabase** (PostgreSQL managé).

### Le Modèle Économique Fermé (100% Conforme Stripe)

- **Cash-In (Stripe)** : Achat de packs F-Stars via Stripe (vente de biens numériques non remboursables)
- **Mouvement P2P** : Transfert libre entre utilisateurs par signature Ed25519 (Solde A → Solde B)
- **Sortie (Redemption)** : Aucun argent ne sort du système. Le Solde B est consommé uniquement par :
  1. **Paiement Marchand** : Transfert vers un commerçant de la plateforme
  2. **Bons d'Achat (Vouchers)** : Destruction de Gains pour générer un code unique utilisable chez des partenaires

---

## Architecture Générale

```
Frontend (React/Vite) ←→ Rust Backend (Axum) ←→ Supabase PostgreSQL
                                ↓
              +--------------------------------------+
              |  Ed25519 Crypto (ed25519-dalek)      |
              |  Identity Signing & Verification      |
              |  AES-256-GCM (Master Key Encryption)  |
              |  JWT Validation (jsonwebtoken)        |
              +--------------------------------------+
```

- **Supabase** : PostgreSQL, Auth (JWT), pg_cron
- **Rust (Axum)** : API REST, logique métier, signatures Ed25519, validations
- **Stripe** : Cash-in par carte bancaire (PaymentIntent + webhooks HMAC)
- **Frontend React** : Conserve TanStack Router/Query, mais appelle l'API REST

---

## 1. Stack Technique Rust

```toml
[package]
name = "serveurblock"
version = "0.1.0"
edition = "2021"

[dependencies]
# Web Framework & Async Runtime
axum = { version = "0.7", features = ["macros"] }
tokio = { version = "1.0", features = ["full"] }
tower-http = { version = "0.5", features = ["cors", "trace", "limit"] }

# Database (Supabase PostgreSQL)
sqlx = { version = "0.8", features = ["runtime-tokio", "postgres", "chrono", "uuid", "macros"] }

# Cryptography & Security
ed25519-dalek = "2.1"
jsonwebtoken = "9.3"          # Validation JWT Supabase Auth
aes-gcm = "0.10"               # Chiffrement données KYC

# Error handling
thiserror = "2.0"
anyhow = "1.0"

# Validation
validator = { version = "0.18", features = ["derive"] }

# Serialization & Utilities
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
uuid = { version = "1.0", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
hex = "0.4"
rand = "0.8"
dotenvy = "0.15"
tracing = "0.1"
tracing-subscriber = "0.3"
```

---

## 2. Arborescence Rust

```
serveurblock/
├── Cargo.toml
├── .env.example
├── migrations/
│   ├── 001_init_fpay_ledger.sql
│   └── 002_create_indexes.sql
└── src/
    ├── main.rs
    ├── config.rs
    ├── error.rs
    ├── models/
    │   ├── mod.rs
    │   ├── profile.rs
    │   ├── balance.rs
    │   ├── transaction.rs
    │   ├── nonce.rs
    │   └── exchange_rate.rs
    ├── handlers/
    │   ├── mod.rs
    │   ├── profiles.rs
    │   ├── balances.rs
    │   ├── transactions.rs
    │   └── admin.rs
    ├── services/
    │   ├── mod.rs
    │   ├── balance.rs
    │   ├── identity.rs
    │   ├── stripe.rs
    │   └── rates.rs
    └── middleware/
        ├── mod.rs
        ├── auth.rs
        └── rate_limit.rs
```

---

## 3. Schéma Base de Données

### `migrations/001_init_fpay_ledger.sql`

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════
-- 1. PROFILES
-- ═══════════════════════════════
CREATE TABLE profiles (
    id                  UUID PRIMARY KEY, -- Match exact du sub JWT Supabase Auth
    role                TEXT NOT NULL CHECK (role IN ('user', 'creator', 'merchant', 'admin')),
    name                TEXT NOT NULL,
    email               TEXT UNIQUE NOT NULL,
    phone               TEXT,
    avatar_initials     TEXT NOT NULL,
    wallet_public_key   TEXT UNIQUE,
    kyc_status          TEXT NOT NULL DEFAULT 'pending'
                        CHECK (kyc_status IN ('pending', 'verified', 'suspended')),
    first_name          TEXT,
    last_name           TEXT,
    kyc_verified_at     TIMESTAMPTZ,
    encrypted_email     BYTEA,
    encrypted_phone     BYTEA,
    encryption_key_version INTEGER NOT NULL DEFAULT 1,
    authority_signature TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════
-- 2. BALANCES (table séparée)
-- ═══════════════════════════════
CREATE TABLE balances (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id  UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    solde_a     BIGINT NOT NULL DEFAULT 0,
    solde_b     BIGINT NOT NULL DEFAULT 0,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE balances ADD CONSTRAINT chk_solde_a_positive CHECK (solde_a >= 0);
ALTER TABLE balances ADD CONSTRAINT chk_solde_b_positive CHECK (solde_b >= 0);

-- ═══════════════════════════════
-- 3. NONCES (Anti-Rejeu)
-- ═══════════════════════════════
CREATE TABLE nonces (
    nonce       TEXT PRIMARY KEY,
    profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════
-- 4. TRANSACTIONS
-- ═══════════════════════════════
CREATE TABLE transactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tx_type       TEXT NOT NULL CHECK (tx_type IN (
                    'achat', 'transfert', 'payement_marchand', 'voucher'
                  )),
    description   TEXT NOT NULL,
    amount_a      BIGINT NOT NULL DEFAULT 0,
    amount_b      BIGINT NOT NULL DEFAULT 0,
    sender_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
    recipient_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
    fees          BIGINT NOT NULL DEFAULT 0,
    status        TEXT NOT NULL DEFAULT 'completed'
                  CHECK (status IN ('completed', 'pending', 'failed')),
    reference     TEXT,
    nonce         TEXT UNIQUE REFERENCES nonces(nonce) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════
-- 5. EXCHANGE RATES
-- ═══════════════════════════════
CREATE TABLE exchange_rates (
    id           SERIAL PRIMARY KEY,
    rate         NUMERIC(10,4) NOT NULL,
    effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO exchange_rates (rate) VALUES (10.0000);

-- ═══════════════════════════════
-- 6. ENCRYPTION KEYS (rotation)
-- ═══════════════════════════════
CREATE TABLE encryption_keys (
    version     INTEGER PRIMARY KEY,
    master_key  BYTEA NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    retired_at  TIMESTAMPTZ
);
```

### `migrations/002_create_indexes.sql`

```sql
CREATE INDEX idx_nonces_expires_at ON nonces(expires_at);
CREATE INDEX idx_transactions_profile_id ON transactions(profile_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_nonce ON transactions(nonce);
CREATE INDEX idx_balances_profile_id ON balances(profile_id);
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status) WHERE kyc_status = 'pending';

-- pg_cron : nettoyage horaire des nonces expirés
SELECT cron.schedule('cleanup-nonces', '0 * * * *',
  $$DELETE FROM nonces WHERE expires_at < NOW()$$);
```

---

## 4. AppState (config.rs)

```rust
use sqlx::PgPool;
use aes_gcm::Aes256Gcm;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub jwt_secret: String,
    pub master_cipher: Aes256Gcm,
    pub master_signing_key: [u8; 32],
    pub encryption_key_version: i32,
    pub stripe_secret_key: String,
    pub stripe_webhook_secret: String,
    pub cors_origin: String,
}
```

---

## 5. Modèles Rust

### `models/mod.rs`

```rust
pub mod profile;
pub mod balance;
pub mod transaction;
pub mod nonce;
pub mod exchange_rate;

pub use profile::Profile;
pub use balance::Balance;
pub use transaction::Transaction;
pub use nonce::Nonce;
pub use exchange_rate::ExchangeRate;
```

### `models/profile.rs`

```rust
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
pub struct Profile {
    pub id: Uuid,
    pub role: String,
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub avatar_initials: String,
    pub wallet_public_key: Option<String>,
    pub kyc_status: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub kyc_verified_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing)]
    pub encrypted_email: Option<Vec<u8>>,
    #[serde(skip_serializing)]
    pub encrypted_phone: Option<Vec<u8>>,
    pub encryption_key_version: i32,
    pub authority_signature: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
```

### `models/balance.rs`

```rust
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
pub struct Balance {
    pub id: Uuid,
    pub profile_id: Uuid,
    pub solde_a: i64,
    pub solde_b: i64,
}
```

### `models/transaction.rs`

```rust
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
pub struct Transaction {
    pub id: Uuid,
    pub profile_id: Uuid,
    pub tx_type: String,
    pub description: String,
    pub amount_a: i64,
    pub amount_b: i64,
    pub sender_id: Option<Uuid>,
    pub recipient_id: Option<Uuid>,
    pub fees: i64,
    pub status: String,
    pub reference: Option<String>,
    pub nonce: Option<String>,
    pub created_at: DateTime<Utc>,
}
```

### `models/nonce.rs`

```rust
use serde::{Serialize, Deserialize};
use sqlx::FromRow;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, FromRow, Serialize, Deserialize, Clone)]
pub struct Nonce {
    pub nonce: String,
    pub profile_id: Uuid,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}
```

### `models/exchange_rate.rs`

```rust
use serde::Serialize;
use sqlx::FromRow;
use chrono::{DateTime, Utc};

#[derive(Debug, FromRow, Serialize, Clone)]
pub struct ExchangeRate {
    pub id: i32,
    pub rate: rust_decimal::Decimal,
    pub effective_at: DateTime<Utc>,
}
```

---

## 6. Gestion des Erreurs (error.rs)

```rust
use axum::http::StatusCode;
use axum::response::{IntoResponse, Json};
use serde_json::json;

#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error("Non trouvé : {0}")]
    NotFound(String),

    #[error("Solde insuffisant")]
    InsufficientBalance,

    #[error("Nonce déjà utilisé")]
    NonceReplay,

    #[error("Signature invalide")]
    InvalidSignature,

    #[error("Requête invalide : {0}")]
    Validation(String),

    #[error("Non autorisé")]
    Unauthorized,

    #[error("Erreur interne")]
    Internal,
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match &self {
            AppError::NotFound(m) => (StatusCode::NOT_FOUND, m.clone()),
            AppError::InsufficientBalance => (StatusCode::CONFLICT, "Solde insuffisant".into()),
            AppError::NonceReplay => (StatusCode::CONFLICT, "Transaction déjà traitée".into()),
            AppError::InvalidSignature => (StatusCode::BAD_REQUEST, "Signature invalide".into()),
            AppError::Validation(m) => (StatusCode::BAD_REQUEST, m.clone()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Non autorisé".into()),
            AppError::Internal => (StatusCode::INTERNAL_SERVER_ERROR, "Erreur interne".into()),
        };
        (status, Json(json!({"error": message}))).into_response()
    }
}
```

---

## 7. Gestion des Balances (Double Solde)

### Règle absolue : KYC verified requis pour TOUTE opération

Aucune opération transactionnelle n'est autorisée si `kyc_status != 'verified'`.
Le P2P exige en plus que **l'émetteur ET le destinataire** soient tous deux vérifiés.

### Règles métier (circuit fermé)

| Opération | Solde A (F-Stars) | Solde B (Gains) | Frais |
|---|---|---|---|
| Achat CB (Stripe) | +stars | 0 | 0 |
| Transfert P2P (envoyeur) | -stars | 0 | 0 |
| Transfert P2P (receveur) | 0 | +stars × rate | 0 |
| Paiement Marchand (Solde A) | -stars | 0 | 0 |
| Paiement Marchand (Solde B) | 0 | -amount | 0 |
| Réception Marchand | 0 | +amount-fee | 1.5% |
| Bon d'Achat (Voucher) | 0 | -amount | 0 |

### Protection anti-race condition (double couche)

1. **Pessimiste (Rust)** : Chaque opération de débit/crédit ouvre une transaction SQL avec `SELECT ... FOR UPDATE` sur la ligne de balance
2. **Contractuel (PostgreSQL)** : Les contraintes `chk_solde_a_positive` et `chk_solde_b_positive` empêchent tout solde négatif

```rust
pub async fn transfer_p2p(
    state: &AppState,
    sender_id: Uuid,
    recipient_id: Uuid,
    stars: i64,
    rate: i64,
) -> Result<(), AppError> {
    let mut tx = state.db.begin().await.map_err(|_| AppError::Internal)?;

    let sender_balance = sqlx::query_as::<_, Balance>(
        "SELECT * FROM balances WHERE profile_id = $1 FOR UPDATE"
    )
    .bind(sender_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|_| AppError::NotFound("Profil non trouvé".into()))?;

    if sender_balance.solde_a < stars {
        return Err(AppError::InsufficientBalance);
    }

    sqlx::query("UPDATE balances SET solde_a = solde_a - $1 WHERE profile_id = $2")
        .bind(stars).bind(sender_id)
        .execute(&mut *tx).await?;

    sqlx::query("UPDATE balances SET solde_b = solde_b + $1 WHERE profile_id = $2")
        .bind(stars * rate).bind(recipient_id)
        .execute(&mut *tx).await?;

    tx.commit().await?;
    Ok(())
}
```

---

## 8. Endpoints API REST

Base URL: `/api/v1`

### Profils & KYC
```
GET    /api/v1/profiles                        → Liste paginée (JWT, limit 50)
GET    /api/v1/profiles/:id                    → Profil individuel
POST   /api/v1/profiles                        → Création (inscription, statut pending)
PATCH  /api/v1/profiles/:id                    → Mise à jour
POST   /api/v1/profiles/:id/kyc               → Soumettre documents KYC
POST   /api/v1/profiles/:id/kyc/verify        → [Admin] Vérifier KYC
POST   /api/v1/profiles/:id/wallet            → Associer clé Ed25519
```

### Balances & Transactions
```
GET    /api/v1/balances/:profile_id            → Solde A + B (KYC requis)
GET    /api/v1/transactions/:profile_id        → Historique (20/page, KYC requis)
GET    /api/v1/transactions/:id                → Détail (KYC requis)
```

### Cash-In (Stripe)
```
POST   /api/v1/transactions/buy-cb             (KYC verified requis)
  Body: { profile_id, stars, euro, stripe_payment_intent_id }
  → Crédite solde_a après validation Stripe

POST   /api/v1/stripe/webhook                  → Webhook Stripe (HMAC vérifié)
```

### Transferts & Paiements
```
POST   /api/v1/transactions/transfer           (émetteur + destinataire KYC verified)
  Body: { sender_id, recipient_key, stars, signature, nonce, timestamp }

POST   /api/v1/transactions/pay-merchant       (KYC verified requis)
  Body: { buyer_id, merchant_id, source, amount_ar }

POST   /api/v1/transactions/redeem-voucher     (KYC verified requis)
  Body: { profile_id, amount_ar }
  → Réponse : { voucher_code, amount }
```

### Admin
```
POST   /api/v1/admin/exchange-rate            → Body: { rate }
GET    /api/v1/admin/pending-kyc              → KYC en attente
```

### Utilitaires
```
GET    /api/v1/exchange-rate
GET    /health
```

---

## 9. Sécurité & Conformité

| Problème | Solution | Où |
|---|---|---|
| KYC non vérifié | Guard systématique : 401 si kyc_status != 'verified' | middleware/auth.rs |
| Race condition | Table balances séparée + FOR UPDATE + CHECK | services/balance.rs |
| Attaque par rejeu | Nonce + timestamp (>5min = rejet) + signature Ed25519 | services/identity.rs |
| JWT falsifié | Validation HS256 avec jsonwebtoken | middleware/auth.rs |
| Données KYC exposées | Chiffrement AES-256-GCM + versioning | services/identity.rs |
| Webhook Stripe | Validation HMAC (stripe-signature) | services/stripe.rs |
| Rotation clé maître | Table encryption_keys + key_version | SQL + services/identity.rs |
| Rate limiting | Tower middleware + pagination obligatoire | middleware/rate_limit.rs |
| Énumération wallets | JWT requis + pagination max 50 | handlers/profiles.rs |
| Nonces orphelines | pg_cron toute les heures | migration SQL |
| CORS | Restreint à l'URL frontend | config.rs |

---

## 10. Ordre d'Implémentation

### Phase 1 : Setup & Modèles
1. `cargo init serveurblock`
2. Configurer Supabase (projet, base, Auth)
3. Créer les migrations SQL
4. Modèles Rust (profile, balance, transaction, nonce, exchange_rate)
5. `config.rs` (AppState), `error.rs`, `main.rs` (Axum, CORS, state)

### Phase 2 : Core API
1. CRUD profils
2. Middleware JWT + rate limiting + KYC guard
3. Double solde avec FOR UPDATE (transfer, pay-merchant, redeem-voucher)
4. Identity Layer Ed25519 (signature et vérification)
5. Exchange rate cache + endpoint

### Phase 3 : Stripe & Cash-In
1. Webhook Stripe (HMAC)
2. Endpoint buy-cb

### Phase 4 : KYC & Admin
1. Soumission/vérification KYC
2. Signature d'autorité
3. Rotation de clé maître

### Phase 5 : Frontend → Backend
1. Remplacer le Context mocké par des appels API
2. Supabase Auth côté frontend
3. Déploiement (VPS/Railway/Fly.io)

---

## 11. Fichiers Frontend à Modifier

| Fichier | Modification |
|---|---|
| `src/hooks/use-fpay.tsx` | Remplacer le mock par des appels API REST + supprimer retraits |
| `src/lib/api/` | Créer les fonctions API |
| `src/lib/config.server.ts` | Ajouter `VITE_API_URL` |
| `src/routes/__root.tsx` | Ajouter Supabase Auth provider |
| `src/router.tsx` | Guards d'authentification |
| `package.json` | Ajouter `@supabase/supabase-js` |

---

## 12. Vérification

1. `cargo run` → serveur sur `http://0.0.0.0:8080`
2. `GET /health` → `200 OK`
3. `POST /api/v1/profiles` → `201 Created`
4. `POST /api/v1/profiles/:id/wallet` → clé Ed25519 associée
5. `POST /api/v1/transactions/buy-cb` → solde_a crédité après webhook Stripe
6. `POST /api/v1/transactions/transfer` (signature + nonce) → solde_a débité, solde_b crédité
7. Re-jeu du même nonce → `409 Conflict`
8. Deux transferts simultanés → 1 seul passe (FOR UPDATE + CHECK)
9. `POST /api/v1/transactions/redeem-voucher` → voucher_code généré
10. `POST /api/v1/profiles/:id/kyc/verify` → authority_signature présente
11. `bun dev` → dashboard connecté à l'API
