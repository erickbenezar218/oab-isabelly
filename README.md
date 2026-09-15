# SimulaOrdem ⚖️

Plataforma SaaS de simulados para a 1ª fase da OAB — flashcards, simulado real (80q / 5h) e estatísticas.

**Repositório:** https://github.com/erickbenezar218/oab-isabelly

## Planos

| Plano | Preço | Inclui |
|-------|-------|--------|
| Grátis | R$ 0 | Flashcards ilimitados, 1 simulado/mês, último histórico |
| Pro | R$ 24,90/mês | Simulados ilimitados, histórico completo, revisão de erros |
| Reta Final | R$ 59,90 / 3 meses | Tudo do Pro |

Pagamento via **Asaas** (integração fase 2).

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

Ver `.env.example`. No Coolify, configure `JWT_SECRET`, `POSTGRES_PASSWORD` e `CORS_ORIGIN`.

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
