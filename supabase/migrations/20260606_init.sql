-- Migration initiale FPay / Magic Stars
-- Crée les tables de base : profiles, wallets, transactions, kyc_documents, system_config

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('USER', 'CREATOR', 'MERCHANT', 'ADMIN');
CREATE TYPE kyc_status AS ENUM ('PENDING', 'VERIFIED', 'SUSPENDED');
CREATE TYPE tx_type AS ENUM ('ACHAT', 'TRANSFERT', 'RECOMPENSE', 'PAIEMENT');
CREATE TYPE tx_status AS ENUM ('COMPLETED', 'PENDING', 'FAILED');
CREATE TYPE system_status AS ENUM ('OPERATIONAL', 'MAINTENANCE');

-- ============================================================
-- 2. PROFILES (utilisateurs)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  kyc_status kyc_status NOT NULL DEFAULT 'PENDING',
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  public_key TEXT UNIQUE,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  encrypted_private_key TEXT, -- chiffré, jamais exposé au client
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur peut lire et modifier son propre profil
CREATE POLICY "profiles_self_select" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les admins voient tout
CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- ============================================================
-- 3. WALLETS (soldes)
-- ============================================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance_a BIGINT NOT NULL DEFAULT 0, -- F-Stars (Solde A)
  balance_b BIGINT NOT NULL DEFAULT 0, -- Gains en Ariary (Solde B)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_self_select" ON wallets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "wallets_admin_all" ON wallets
  FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- ============================================================
-- 4. TRANSACTIONS (ledger)
-- ============================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type tx_type NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  amount BIGINT NOT NULL CHECK (amount > 0),
  fee BIGINT NOT NULL DEFAULT 0 CHECK (fee >= 0),
  status tx_status NOT NULL DEFAULT 'PENDING',
  signature TEXT, -- signature Ed25519
  reference TEXT, -- référence externe (Stripe, Mobile Money)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Un utilisateur voit ses transactions (envoyées OU reçues)
CREATE POLICY "transactions_self_select" ON transactions
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "transactions_admin_select" ON transactions
  FOR SELECT TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- 5. KYC DOCUMENTS
-- ============================================================
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level INT NOT NULL CHECK (level IN (1, 2)),
  document_type TEXT NOT NULL, -- 'PASSPORT', 'ID_CARD', 'SELFIE', etc.
  storage_path TEXT NOT NULL, -- chemin Supabase Storage
  status kyc_status NOT NULL DEFAULT 'PENDING',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kyc_documents_self_select" ON kyc_documents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "kyc_documents_insert" ON kyc_documents
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. SYSTEM CONFIG
-- ============================================================
CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Accessible en lecture à tous les utilisateurs authentifiés
CREATE POLICY "system_config_select" ON system_config
  FOR SELECT TO authenticated
  USING (TRUE);

-- Modification réservée aux admins
CREATE POLICY "system_config_admin_update" ON system_config
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' = 'ADMIN')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

CREATE POLICY "system_config_admin_insert" ON system_config
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'ADMIN');

-- ============================================================
-- 7. SEED DATA (configuration initiale)
-- ============================================================
INSERT INTO system_config (key, value) VALUES
  ('conversion_rate', '{"rate": 10}'::JSONB),
  ('merchant_fee', '{"percent": 1.5}'::JSONB),
  ('transfer_limit', '{"max": 10000}'::JSONB),
  ('system_status', '{"status": "OPERATIONAL"}'::JSONB),
  ('kyc_required', '{"required": true}'::JSONB);

-- ============================================================
-- 8. INDEXES
-- ============================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_public_key ON profiles(public_key);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_recipient ON transactions(recipient_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_kyc_documents_user ON kyc_documents(user_id);
