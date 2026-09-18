CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulado_usage (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, year_month)
);

CREATE TABLE IF NOT EXISTS tutor_threads (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questao_id TEXT NOT NULL,
  explanation TEXT,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, questao_id)
);

CREATE TABLE IF NOT EXISTS question_explanations (
  questao_id TEXT PRIMARY KEY,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tutor_threads_user ON tutor_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_login_challenges_user ON login_challenges(user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_hash ON password_reset_tokens(token_hash);

ALTER TABLE users ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;

-- Perfil de estudo (data da prova, onboarding, tour)
ALTER TABLE users ADD COLUMN IF NOT EXISTS exam_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS area_2fase TEXT DEFAULT 'Trabalhista';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_tour_done BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_2fa_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_goal_override INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS study_reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ALTER COLUMN study_reminder_enabled SET DEFAULT TRUE;
UPDATE users SET study_reminder_enabled = TRUE WHERE study_reminder_enabled IS NOT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS study_reminder_last_sent DATE;

CREATE TABLE IF NOT EXISTS user_billing (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  plan_product TEXT NOT NULL CHECK (plan_product IN ('pro', 'reta')),
  asaas_subscription_id TEXT,
  subscription_cancelled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_billing ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS asaas_billing_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asaas_processed_payments (
  payment_id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_product TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_asaas_customer ON users(asaas_customer_id);
