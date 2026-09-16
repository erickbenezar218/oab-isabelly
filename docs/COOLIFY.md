# Deploy SimulaOrdem no Coolify

## Serviços (docker-compose)

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| `web` | 80 (interno, roteado pelo proxy do Coolify) | Nginx + React PWA |
| `api` | 3001 (interno) | Fastify + Postgres |
| `db` | 5432 (interno) | PostgreSQL 16 |

**Importante:** o serviço `web` não publica mais porta fixa no host (removemos `ports: 8080:80` do `docker-compose.yml`). Isso evitava que o deploy falhasse com `port is already allocated` — como o Coolify sobe o container novo antes de derrubar o antigo (deploy sem downtime), dois containers não conseguiam ligar na mesma porta 8080 do host ao mesmo tempo. Agora o Coolify roteia direto pela rede interna `coolify` até a porta 80 do container.

No painel do Coolify, confira/ajuste em **web → Configuration → Ports** (ou Domains) para apontar para a porta **80** (não mais 8080).

## Variáveis obrigatórias (Coolify → Environment)

```env
# Segurança
POSTGRES_PASSWORD=<senha-forte-unica>
JWT_SECRET=<openssl rand -hex 32>

# Domínio
CORS_ORIGIN=https://simulaordem.com.br,https://www.simulaordem.com.br

# Google OAuth (login) — opcional
GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com

# Tutor IA (Pro) — obrigatório se quiser IA
GEMINI_API_KEY=<sua-chave>
GEMINI_MODEL=gemini-2.5-flash

```

**Nunca** commite `.env` no git. Configure só no painel do Coolify.

### Frontend (`VITE_*` no build)

Variáveis `VITE_*` **entram no JavaScript no momento do build** — não adianta só colocar no Coolify se o deploy não rebuildar o frontend.

O `Dockerfile` do serviço `web` faz **build multi-stage** (npm + vite) e recebe:

| Build arg | Variável Coolify |
|-----------|------------------|
| `VITE_API_URL` | `VITE_API_URL` (padrão `/api`) |
| `VITE_GOOGLE_CLIENT_ID` | `VITE_GOOGLE_CLIENT_ID` (= mesmo valor de `GOOGLE_CLIENT_ID`) |

**Obrigatório no Coolify:** `VITE_GOOGLE_CLIENT_ID` igual ao `GOOGLE_CLIENT_ID` para o botão Google aparecer.

Build local opcional (usa `.env` da raiz se existir):

```bash
./scripts/build-web.sh
```

### Variáveis Runtime (API)

| Variável | Runtime |
|----------|---------|
| `GOOGLE_CLIENT_ID`, `JWT_SECRET`, SMTP, Asaas, Gemini, Postgres… | ✅ |

**Asaas:** use `ASAAS_API_KEY_B64` (evita `$` quebrando o Docker Compose):

```bash
echo -n 'sua-chave-asaas' | base64
```

**E-mail:** `EMAIL_FROM="SimulaOrdem <suporte@simulaordem.com.br>"`

## Checklist pré-produção

### Infra
- [ ] Guia DNS/SSL: [docs/CLOUDFLARE.md](CLOUDFLARE.md)
- [ ] Domínio `simulaordem.com.br` + `www` apontando pro IP Coolify (Cloudflare nuvem **cinza** primeiro)
- [ ] HTTPS ativo (Let's Encrypt no Coolify — automático)
- [ ] Volume persistente no Postgres (`pgdata`)
- [ ] Backup automático do banco

### Segurança
- [ ] `JWT_SECRET` único e longo (32+ bytes hex)
- [ ] `POSTGRES_PASSWORD` forte
- [ ] `GEMINI_API_KEY` só no servidor (variável de ambiente)
- [ ] CORS restrito ao domínio real (não `*`)

### App
- [ ] `./scripts/build-web.sh` com `VITE_API_URL=/api` e commit de `web-dist/`
- [ ] Health: `GET /api/health` → `{ ok: true }`
- [ ] Testar login, simulado, sync progresso
- [ ] Testar tutor IA com usuário `plan=pro`

### Google OAuth
- [ ] Guia: [docs/GOOGLE_OAUTH.md](GOOGLE_OAUTH.md)
- [ ] OAuth consent screen + Client ID Web
- [ ] Origens JS: `simulaordem.com.br`, `www`, `localhost:5173`, `localhost:8080`
- [ ] `GOOGLE_CLIENT_ID` na API + `VITE_GOOGLE_CLIENT_ID` no **build** do web
- [ ] `GET /api/health` → `"google": true`
- [ ] Publicar app no Google (sair do modo Teste)

### E-mail transacional (Hostinger)
- [ ] Guia: [docs/EMAIL.md](EMAIL.md)
- [ ] hPanel: caixa `suporte@` + DKIM ativo + alias `privacidade@`
- [ ] Coolify API env:
  ```env
  APP_URL=https://simulaordem.com.br
  EMAIL_FROM=SimulaOrdem <suporte@simulaordem.com.br>
  SMTP_HOST=smtp.hostinger.com
  SMTP_PORT=465
  SMTP_USER=suporte@simulaordem.com.br
  SMTP_PASS=<senha>
  EMAIL_2FA_ENABLED=true
  ```
- [ ] Redeploy da API
- [ ] `GET /api/health` → `"email": true`, `"email2fa": true`
- [ ] Testar cadastro (boas-vindas) + login (código 2FA)

### Pagamentos Asaas
- [ ] Guia: [docs/ASAAS.md](ASAAS.md)
- [ ] Sandbox: `ASAAS_ENV=sandbox` + `ASAAS_API_KEY` (`$aact_hmlg_...`)
- [ ] Webhook: `https://simulaordem.com.br/api/billing/webhook` + `ASAAS_WEBHOOK_TOKEN`
- [ ] `GET /api/health` → `"asaas": true`
- [ ] Testar checkout Pro + confirmar pagamento no painel sandbox

### Fase 2 (não bloqueia go-live)
- [ ] Asaas produção (`ASAAS_ENV=production`)
- [ ] CNPJ exclusivo SimulaOrdem

## Testar tutor IA em produção

1. Usuário com plano Pro no banco:
   ```sql
   UPDATE users SET plan = 'pro' WHERE email = 'seu@email.com';
   ```
2. Errar questão no flashcard ou revisão de simulado
3. Clicar **Explicar meu erro**
4. Se falhar: logs da API (`GEMINI_API_KEY`, quota, modelo)

## Rotacionar chave Gemini

Se a chave vazar (chat, screenshot, commit):
1. Google AI Studio / Cloud Console → revogar chave
2. Criar nova chave
3. Atualizar `GEMINI_API_KEY` no Coolify
4. Redeploy só do serviço `api`
