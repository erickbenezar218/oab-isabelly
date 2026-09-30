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

O histórico fica em **`user_progress.data`** (JSON). Só altera o **e-mail que você informar**.

### Somente Coolify (sem Mac / sem clone)

1. No Coolify, abra o terminal do serviço **`api`** (Node) — **não** use o container **`db`** (lá não tem pasta `api` nem o script).
2. Cole **uma** das opções abaixo (troque o e-mail):

**Opção A — one-liner (baixa script + banco do GitHub e grava no Postgres):**

```sh
wget -qO- https://raw.githubusercontent.com/erickbenezar218/oab-isabelly/main/api/scripts/coolify-demo-seed.sh | sh -s -- erick.benezar@conectplusfibra.com.br
```

Se não tiver `wget`, use `curl`:

```sh
curl -fsSL https://raw.githubusercontent.com/erickbenezar218/oab-isabelly/main/api/scripts/coolify-demo-seed.sh | sh -s -- erick.benezar@conectplusfibra.com.br
```

**Opção B — passo a passo no terminal `api`:**

```sh
DIR=/tmp/seed && mkdir -p "$DIR" && cd "$DIR"
wget -q https://raw.githubusercontent.com/erickbenezar218/oab-isabelly/main/api/scripts/seed-demo-progress.mjs -O seed.mjs
wget -q https://raw.githubusercontent.com/erickbenezar218/oab-isabelly/main/banco_oab.json -O banco_oab.json
NODE_PATH=/app/node_modules node seed.mjs erick.benezar@conectplusfibra.com.br
rm -rf "$DIR"
```

Deve aparecer `OK:` + contagem de simulados/respostas. A API já tem `DATABASE_URL` apontando para o Postgres interno.

3. **F5** no site (ou logout/login). Kit PDF **não** dispara — abra `/kit-oab` logado.

**Erro `can't cd to api`:** você estava no container **db**; mude para o terminal do serviço **api**.

### Local (Docker no Mac)

```bash
cd "/Users/erickbenezar/Documents/Prova OAB/api"
npm run demo:seed -- seu@email.com
```

### Fallback: SQL no container **db**

Só se a opção `api` falhar: gere SQL em máquina com o repo (`node scripts/seed-demo-progress.mjs --print-sql ...`) e cole no `psql` do **db**.

---

## Reta Final (90 dias)

Mesmo efeito Pro no app; só muda a data:

```sql
UPDATE users
SET plan = 'pro', plan_expires_at = NOW() + INTERVAL '90 days', updated_at = NOW()
WHERE email = 'seu@email.com';
```
