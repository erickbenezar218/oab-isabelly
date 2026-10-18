# SimulaOrdem ⚖️

Plataforma SaaS de preparação para a OAB (1ª e 2ª fase) — simulados reais, flashcards, peças processuais, cronograma e tutor IA.

**Repositório:** https://github.com/erickbenezar218/oab-isabelly

## Planos

| Plano | Preço | Inclui |
|-------|-------|--------|
| Grátis | R$ 0 | Flashcards, peças 2ª fase, 1 simulado/mês |
| Pro | R$ 24,90/mês | Simulados ∞, cronograma, tutor IA, histórico completo |
| Reta Final | R$ 59,90 / 3 meses | Tudo do Pro |

Pagamento via **Asaas** (integração fase 2).

**Tutor IA (Pro):** explica erros e chat por questão via Gemini API (`GEMINI_API_KEY` no `.env`).

## Stack

- **Frontend:** React + Vite + PWA + Tailwind
- **API:** Fastify + PostgreSQL + JWT
- **Deploy:** Docker Compose (Coolify)

## Desenvolvimento local

```bash
# Subir Postgres + API + Web
cp .env.example .env
docker compose up --build

# Ou separado:
cd api && npm install && npm run dev   # :3001
cd app && npm install && npm run dev   # :5173 (proxy /api)
```

- App: http://localhost:8080 (Docker) ou http://localhost:5173 (dev)
- API health: http://localhost:3001/health

## Variáveis de ambiente

Ver `.env.example`. No Coolify, configure `JWT_SECRET`, `POSTGRES_PASSWORD`, `CORS_ORIGIN` e `GEMINI_API_KEY`.

**Deploy Coolify:** guia completo em [docs/COOLIFY.md](docs/COOLIFY.md).

**Google Login:** passo a passo em [docs/GOOGLE_OAUTH.md](docs/GOOGLE_OAUTH.md).

**E-mail + 2FA:** boas-vindas e código de login em [docs/EMAIL.md](docs/EMAIL.md).

**Meta Pixel (anúncios):** ver seção abaixo.

**Testar Gemini:** crie `.env` na raiz e rode `cd api && npm run test:gemini`.

## Meta Pixel (anúncios Instagram/Facebook)

O site só carrega o Meta Pixel se `VITE_META_PIXEL_ID` estiver definido **no build** e o visitante clicar em **Aceitar** no aviso de cookies (LGPD — padrão é não rastrear). No app iOS (Capacitor) o pixel nunca carrega.

**Onde pegar o ID:** [Meta Events Manager](https://business.facebook.com/events_manager2) → Fontes de dados → seu Pixel/Conjunto de dados → *Configurações* → copie o **ID do conjunto de dados** (só números, ex. `123456789012345`).

**Onde colar:**
- Produção: Coolify → variáveis de build → `VITE_META_PIXEL_ID=<id>` e faça redeploy (o valor entra no JS no build).
- `web-dist/` local: `.env` da raiz + `./scripts/build-web.sh`.
- Dev (`npm run dev` em `app/`): crie `app/.env.local` com `VITE_META_PIXEL_ID=<id>` (ignorado pelo git).

**Eventos enviados** (código em `app/src/lib/metaPixel.ts`):

| Evento | Quando |
| --- | --- |
| `PageView` | Toda troca de rota do SPA |
| `Lead` | Clique em "Começar grátis" / "Criar conta grátis" (landing e /planos, só deslogado) |
| `CompleteRegistration` | Conta criada (e-mail ou Google — a API devolve `isNewUser`) |
| `InitiateCheckout` | Checkout Asaas gerado em /planos/checkout (valor em BRL) |
| `Purchase` | /planos/sucesso, uma vez por checkout iniciado (valor em BRL, `eventID` para deduplicação) |

**Testar:** Events Manager → *Testar eventos*, ou DevTools → Network filtrando `facebook.com/tr`. Extensão "Meta Pixel Helper" também ajuda.

**Atribuição:** `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` e `fbclid` da URL de entrada ficam em `localStorage` (`simulaordem-attribution`) e são enviados no cadastro (`attribution`). **A API ainda ignora esse campo** — para cruzar campanha × assinante pago é preciso gravá-lo no Postgres (pendente).

## Estrutura

```
├── app/           # Frontend React
├── api/           # Backend Fastify + Postgres
├── banco_oab.json # 1120 questões
├── docker-compose.yml
└── Dockerfile
```

## Operador

R E BENEZAR DE SOUZA LTDA — CNPJ 37.409.487/0001-70  
Suporte: suporte@simulaordem.com.br (Zoho Mail)
