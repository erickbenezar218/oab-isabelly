# Editar VSL — Rafael falando + tela do SimulaOrdem

Guia para montar **um vídeo curto (~50 s)**: export HeyGen (Rafael) + **gravações de tela** do site/app.

---

## Antes de gravar tela

1. **Conta demo** em produção (`simulaordem.com.br`) — ideal **Pro** (ou grátis com simulado já feito) para termômetro e desempenho com dados.  
2. Navegador **Chrome**, janela **1920×1080**, zoom **100%**, barra de favoritos limpa.  
3. **Modo claro** (site já é claro). Desliga notificações do Mac.  
4. Ferramenta: **QuickTime** (Arquivo → Nova gravação de tela) ou **OBS**.  
5. Grave **clipes separados** (5–8 s cada) — edita no CapCut; mais fácil que gravar tudo de uma vez.

### URLs para capturar

| Tela | URL |
|------|-----|
| Landing | `https://simulaordem.com.br/` |
| Planos / preço | `https://simulaordem.com.br/planos` |
| Dashboard + termômetro | `https://simulaordem.com.br/app` |
| Flashcards | `https://simulaordem.com.br/app/flashcards` |
| Simulado | `https://simulaordem.com.br/app/simulado` |
| Desempenho | `https://simulaordem.com.br/app/desempenho` |
| Cronograma (Pro) | `https://simulaordem.com.br/app/cronograma` |
| Revisão (Pro) | `https://simulaordem.com.br/app/revisao` |
| 2ª fase — peças | `https://simulaordem.com.br/app/pecas` |
| Tutor IA | Abrir questão errada no simulado/flashcard → painel explicação/chat |

Se o termômetro no `/app` estiver vazio, use a seção **termômetro na landing** (`/#termometro`) só para o vídeo.

---

## Roteiro falado × o que mostrar na tela

Roteiro (HeyGen): ver `VSL-HEYGEN-CENAS-CURTAS.md`.

| ~Tempo | Fala (trecho) | Tela (prioridade) |
|--------|----------------|-------------------|
| 0–5 s | “Estudar OAB sozinho cansa…” | **Rafael tela cheia** ou landing hero |
| 5–10 s | “…termômetro passaria hoje” | **`/app`** termômetro subindo **ou** landing `#termometro` |
| 10–14 s | “…desempenho por matéria” | **`/app/desempenho`** gráfico/lista matérias |
| 14–17 s | “…flashcards, simulados FGV” | **`/app/flashcards`** → corte **`/app/simulado`** (timer/questão) |
| 17–22 s | “…professor de IA” | Questão + **painel tutor/explicação** (scroll suave) |
| 22–25 s | “…peças da segunda fase” | **`/app/pecas`** |
| 25–32 s | “No Pro… chat, revisão, cronograma, trilha” | **`/app/revisao`** → **`/app/cronograma`** (2 cortes rápidos) |
| 32–36 s | “…mil questões na nuvem” | Dashboard ou simulado (badge progresso) |
| 36–40 s | “Testa grátis, sem cartão…” | **`/planos`** card **Grátis** |
| 40–46 s | “…Kit PDF… 24,90…” | **`/planos`** cards **Pro** + preço **de/por** |
| 46–50 s | “simulaordem.com.br… hoje” | Landing CTA **Começar grátis** ou digitar URL na barra |

Ajuste cortes ao **áudio real** do HeyGen (importa o MP4 primeiro no CapCut, marca a timeline, encaixa telas).

---

## Montagem no CapCut (ou similar)

1. **Faixa 1:** vídeo HeyGen (áudio principal).  
2. **Faixa 2:** clipes de tela, **sem áudio** do sistema.  
3. **Layout sugerido (50 s):**
   - **0–5 s:** Rafael grande (100%).  
   - **5–40 s:** tela **80–100%** + Rafael **PiP** canto inferior direito (~25% largura, borda arredondada).  
   - **40–50 s:** **`/planos`** tela cheia + texto na tela: `Grátis · Pro R$ 24,90` + URL.

4. **Legendas** PT-BR (automáticas + revisar “Simula Ordem”, “OAB”).  
5. Música de fundo **muito baixa** ou nenhuma.  
6. Export **1080p 30fps** → YouTube **não listado**.

---

## Checklist pós-edição

- [ ] Termômetro legível no celular (preview vertical crop se for Reels depois).  
- [ ] Preços iguais ao site (`/planos`).  
- [ ] Nenhuma dado pessoal real na conta demo (nome/e-mail genérico).  
- [ ] `VITE_VSL_EMBED_URL` no Coolify + redeploy **web**.  
- [ ] Testar embed em `/` e `/planos`.

---

## Variantes

| Uso | Dica |
|-----|------|
| **Landing embed** | Paisagem 16:9, PiP como acima. |
| **Reels/TikTok** | Export 9:16: tela central + Rafael em cima; ou só tela + legenda nos primeiros 2 s. |
| **Só screencast** | Mute avatar; narração HeyGen em faixa de áudio — mesmo roteiro. |
