# Ativar Pro manualmente (dev / demo / gravação VSL)

**Uso:** sua conta de teste, screencast, validar app — **não** use em clientes reais (use pagamento Asaas).

O app considera **Pro** quando `users.plan = 'pro'` e `plan_expires_at` é **null** ou **data no futuro**.

---

## 1. Achar seu e-mail no banco

```sql
SELECT id, email, plan, plan_expires_at FROM users WHERE email = 'seu@email.com';
```

---

## 2. Ativar Pro (1 ano)

```sql
UPDATE users
SET
  plan = 'pro',
  plan_expires_at = NOW() + INTERVAL '1 year',
  updated_at = NOW()
WHERE email = 'seu@email.com';
```

Pro “sem vencimento” (só ambiente local):

```sql
UPDATE users
SET plan = 'pro', plan_expires_at = NULL, updated_at = NOW()
WHERE email = 'seu@email.com';
```

---

## 3. Voltar para grátis

```sql
UPDATE users
SET plan = 'free', plan_expires_at = NULL, updated_at = NOW()
WHERE email = 'seu@email.com';
```

---

## Como rodar o SQL

### Local (Docker Compose na raiz do repo)

```bash
cd "/Users/erickbenezar/Documents/Prova OAB"
docker compose exec db psql -U simulaordem -d simulaordem -c \
  "UPDATE users SET plan = 'pro', plan_expires_at = NOW() + INTERVAL '1 year', updated_at = NOW() WHERE email = 'SEU_EMAIL';"
```

### Produção (Coolify)

No terminal do container **db** você cai no **shell** (`/ #`), **não** no SQL. Primeiro entre no `psql`:

```bash
psql -U simulaordem -d simulaordem
```

O prompt muda para `simulaordem=#`. **Aí** cole o `UPDATE` (termina com `;`).

**One-liner** (cola tudo numa linha no shell `/ #`):

```bash
psql -U simulaordem -d simulaordem -c "UPDATE users SET plan = 'pro', plan_expires_at = NOW() + INTERVAL '1 year', updated_at = NOW() WHERE email = 'SEU_EMAIL';"
```

Se pedir senha, use a variável `POSTGRES_PASSWORD` do Coolify:

```bash
PGPASSWORD='sua_senha' psql -U simulaordem -d simulaordem -c "UPDATE users SET plan = 'pro', plan_expires_at = NOW() + INTERVAL '1 year', updated_at = NOW() WHERE email = 'SEU_EMAIL';"
```

---

## Depois do UPDATE

1. No site: **F5** ou sair e entrar de novo (token JWT ainda vale; limites vêm do banco a cada request).  
2. Abra **`/app`** → cronograma, revisão, simulado ilimitado devem liberar.  
3. **Kit PDF por e-mail** **não** dispara no SQL manual — só no webhook de pagamento. Para testar kit, use conta que pagou ou abra `/kit-oab` logado.

---

## Conta “cheia” para gravar vídeo (simulados, termômetro, badges)

O histórico fica em **`user_progress.data`** (JSON). Dá para popular pelo script (IDs reais do `banco_oab.json`):

### Local (Docker)

```bash
cd "/Users/erickbenezar/Documents/Prova OAB/api"
npm run demo:seed -- seu@email.com
```

Ou com compose na raiz:

```bash
docker compose exec api sh -c 'cd /app && node scripts/seed-demo-progress.mjs seu@email.com'
```

(só funciona se o container tiver o script montado — em dev com volume; em produção use `--print-sql` ou `DATABASE_URL`.)

### Coolify (só terminal do **db**)

Na sua máquina, gere o SQL (não precisa de banco):

```bash
cd api && node scripts/seed-demo-progress.mjs --print-sql seu@email.com > /tmp/demo.sql
```

Abra `/tmp/demo.sql`, copie tudo, cole no `psql` do container **db**.

O script define também **Pro**, data da prova, onboarding concluído, ~5 simulados (último ~44/80 → termômetro “Aprovado!”), flashcards, revisão e peças da 2ª fase.

Depois: **F5** no site. O kit PDF **não** é reenviado — use `/kit-oab` logado.

---

## Reta Final (90 dias)

Mesmo efeito Pro no app; só muda a data:

```sql
UPDATE users
SET plan = 'pro', plan_expires_at = NOW() + INTERVAL '90 days', updated_at = NOW()
WHERE email = 'seu@email.com';
```
