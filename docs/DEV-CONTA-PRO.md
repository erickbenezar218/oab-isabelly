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

1. Painel Coolify → serviço **PostgreSQL** (ou **db**) → terminal / “Execute command”.  
2. Ou SSH no servidor e:

```bash
docker exec -it <container_postgres> psql -U simulaordem -d simulaordem
```

Cole o `UPDATE` com seu e-mail.

---

## Depois do UPDATE

1. No site: **F5** ou sair e entrar de novo (token JWT ainda vale; limites vêm do banco a cada request).  
2. Abra **`/app`** → cronograma, revisão, simulado ilimitado devem liberar.  
3. **Kit PDF por e-mail** **não** dispara no SQL manual — só no webhook de pagamento. Para testar kit, use conta que pagou ou abra `/kit-oab` logado.

---

## Reta Final (90 dias)

Mesmo efeito Pro no app; só muda a data:

```sql
UPDATE users
SET plan = 'pro', plan_expires_at = NOW() + INTERVAL '90 days', updated_at = NOW()
WHERE email = 'seu@email.com';
```
