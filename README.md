# OAB da Isabelly ⚖️

App PWA de estudos para a reta final da prova da OAB (06/09/2026).

## O que tem aqui

- **660 questões** de 8 exames (43º via markdown local + 7 extraídos do [Prova da Ordem](https://www.provadaordem.com.br))
- **Flashcards** estilo active recall (swipe / botões)
- **Simulado realista** — 80 questões, 5h, cronômetro por questão, calculadora de ritmo
- **Painel de desempenho** por matéria + cards customizados
- **PWA** instalável no celular
- Progresso salvo em **LocalStorage**

## Desenvolvimento local

```bash
# Instalar dependências do app
cd app && npm install && npm run dev

# Re-executar scraping (opcional)
pip install -r scripts/requirements.txt
playwright install chromium
python3 scripts/scrape_oab.py
cp banco_oab.json app/public/banco_oab.json
```

App em: http://localhost:5173

## Build & Docker

```bash
# Build de produção
cd app && npm run build

# Docker (na raiz do repo)
docker compose up --build -d
```

App em: http://localhost:8080

## Deploy (Vercel / Netlify)

- **Root directory:** `app`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- Copie `banco_oab.json` para `app/public/` antes do deploy (já incluído no repo)

## Estrutura

```
├── app/                 # React + Vite PWA
├── scripts/scrape_oab.py
├── banco_oab.json       # Banco consolidado
├── Dockerfile
└── docker-compose.yml
```

## Notas

- 39º Exame indisponível no site (em cadastramento) — não incluído
- 43º Exame extraído do markdown local (`questoes_oab_43_gabarito.md`)
- App personalizado para **Isabelly** — single-user, sem multi-tenant

Feito com 💜 para gabaritar essa OAB!
