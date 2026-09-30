# VSL SimulaOrdem — HeyGen

Roteiro para avatar + voz no **HeyGen** e embed no site (`/` e `/planos`).

---

## Plano HeyGen: 3 vídeos × 1 minuto (use este)

**Não precisa de 10 minutos para lançar.** Muita landing converte bem com **VSL de 3 minutos** (PAS enxuto). Use os **3 créditos** assim:

| Vídeo HeyGen | Papel PAS | Depois |
|--------------|-----------|--------|
| **1/3** | Gancho + Problema | export MP4 |
| **2/3** | Solução (SimulaOrdem) | export MP4 |
| **3/3** | Oferta + CTA | export MP4 |

**Montagem (grátis):** CapCut, DaVinci ou iMovie → juntar na ordem 1→2→3 → export **um** MP4 de ~3 min → YouTube não listado → `VITE_VSL_EMBED_URL`.

**Dica:** gere **prévia** antes de gastar crédito; texto já está no limite de ~1 min por bloco (~130 palavras).

### Vídeo 1/3 — Problema (~55–60 s) · cole no HeyGen

Você estuda para a OAB, mas se a prova fosse amanhã: você **passaria hoje**? Se você não sabe, o problema não é falta de vontade — é falta de **prova simulada de verdade**: oitenta questões, **cinco horas**, cronômetro, cansaço, igual FGV. Sem isso você não sabe se está acima dos quarenta acertos, qual matéria derruba sua nota, ou se erra por conteúdo ou tempo. Na véspera vira ansiedade: revisa tudo no escuro. Reprovar de novo custa meses, dinheiro e energia. O que falta é **sistema**: simular, medir, corrigir.

### Vídeo 2/3 — Solução (~55–60 s)

**SimulaOrdem** é a plataforma web para treinar como na prova real. Simulado completo no tempo FGV, **Termômetro OAB** — você vê se passaria hoje — desempenho por matéria, **Professor IA** explicando cada erro, revisão e cronograma no plano Pro. Mais de mil cento e vinte questões oficiais, progresso na nuvem. Comece **grátis**, sem cartão: flashcards e simulados com limite. No **Pro**, simulados ilimitados e IA sem teto. Prova em noventa dias? **Reta Final**: três meses com melhor custo.

### Vídeo 3/3 — Oferta + CTA (~55–60 s)

**Oferta de lançamento:** Pro de quarenta e nove noventa por **vinte e quatro noventa por mês**. Reta Final de cento e dezenove setenta por **cinquenta e nove noventa** em três meses. Quem assina leva o **Kit Aprovador** — três PDFs no e-mail. PIX, cartão ou boleto via Asaas; cancela o Pro quando quiser. Acesse **simulaordem.com.br**, crie conta grátis, faça um simulado. Se fizer sentido, em **Planos** assine Pro. **Simule hoje. Meça hoje.** Te vejo dentro.

---

## Quer VSL longa (8–12 min)?

| Caminho | Custo |
|---------|--------|
| **Upgrade HeyGen** (Creator) | paga, gera tudo em avatar |
| **Híbrido (recomendado barato)** | 3 min HeyGen (acima) + **5–8 min screencast** do site com sua voz (QuickTime / OBS) colado no CapCut |
| **Sem avatar** | só screencast + narração — funciona igual na landing |

O site aceita **qualquer duração** no YouTube embed; 3 min já ativa a seção de vídeo.

---

## Versão longa PAS (~10 min) — se tiver créditos/plano maior

Cole **uma cena por vez** no HeyGen. Pausas: `[PAUSA 2s]`.

## Antes de gerar no HeyGen

| Item | Recomendação |
|------|----------------|
| **Orientação** | **Paisagem (16:9)** para embed na landing — o print que você mandou está em **Retrato**; use retrato só se for cortar Reels depois. |
| **Posição** | Parte superior do corpo |
| **Estilo** | Realista |
| **Avatar / cenário** | Trocar “tech podcast” por algo mais OAB: *“Estúdio clean, fundo verde-água suave ou home office, host profissional 28–35 anos, camisa social, fone opcional, luz natural”* |
| **Voz** | PT-BR, tom calmo e assertivo (professor/coach, não vendedor gritado) |

**Fluxo:** HeyGen → exportar MP4 → subir no **YouTube (não listado)** ou Vimeo → copiar link → Coolify `VITE_VSL_EMBED_URL` → rebuild **web**.

```env
VITE_VSL_EMBED_URL=https://www.youtube.com/watch?v=SEU_ID
# ou embed direto; retrato HeyGen:
VITE_VSL_ASPECT=portrait
```

---

### Cena 1 — Gancho (0:00–0:50) · ~120 palavras

Você estuda horas por semana para a OAB… mas, se a prova fosse **amanhã**, você saberia dizer com honestidade: **“eu passaria hoje”**?

Se a resposta é “não sei”, “acho que sim” ou “depende do dia” — você não está sozinho. A maioria estuda por PDF, videoaula solta e listas de questões… **sem simulado no tempo real da FGV**.

Eu vou te mostrar, nos próximos minutos, um caminho prático: simular a prova de verdade, medir sua nota e corrigir o que mais derruba — com o **SimulaOrdem**.

---

### Cena 2 — Problema P (0:50–2:30) · ~200 palavras

O **problema** não é falta de vontade. É falta de **feedback igual prova**.

Você lê código, assiste aula, faz flashcard… mas raramente senta **cinco horas**, responde **oitenta questões**, com cronômetro, cansaço mental e pressão — igual ao dia D.

Sem isso, você não sabe:

- se está **acima ou abaixo** dos 40 acertos;
- quais **matérias** puxam sua média para baixo;
- se o erro é **conteúdo** ou **gestão de tempo**.

Resultado: na véspera, ansiedade. Você revisa “tudo” ou revisa “o que dá” — no escuro.

E cursinho caro nem sempre resolve, porque muita gente continua **sem simulado completo** com análise do que errou, questão por questão.

---

### Cena 3 — Agitação A (2:30–4:15) · ~200 palavras

Vamos **agitar** com a verdade que ninguém gosta de ouvir: **reprovar de novo** não é só “faltou uma matéria”.

É mais seis meses de espera. É honorários adiados. É ver colega formando e você ainda preso no ciclo. É burnout — estudar cada vez mais horas, com cada vez **menos clareza**.

E tem o detalhe cruel: na OAB, **quem passa** não é quem “sabe direito tudo”. É quem **executa** no dia: leitura rápida, chute técnico, gestão de tempo, e matérias certas na reta final.

Se você continuar no modo “estudo genérico”, você aposta no sorteio emocional — não em **número**.

O que falta não é mais PDF. É **sistema**: simular → medir → corrigir → repetir.

---

### Cena 4 — Solução S — apresentação (4:15–5:45) · ~180 palavras

**SimulaOrdem** é uma plataforma web feita para a **1ª fase** da OAB — e preparação da **2ª fase** quando você avança.

O coração do produto é simples:

1. **Simulado realista** — oitenta questões, cinco horas, ritmo FGV.  
2. **Termômetro OAB** — você enxerga se, **hoje**, estaria na faixa de aprovação.  
3. **Desempenho por matéria** — onde investir tempo nas próximas semanas.  
4. **Professor IA** — explica o erro na hora, como um professor no seu ombro.  
5. **Revisão de erros e cronograma** no plano Pro — para quem quer rotina, não caos.

Mais de **mil cento e vinte questões** oficiais. Progresso na nuvem. Você testa **grátis**, sem cartão, antes de decidir.

---

### Cena 5 — Solução — grátis vs Pro (5:45–7:00) · ~160 palavras

No **plano grátis**, você prova o método: flashcards, simulados com limite mensal, algumas explicações IA por dia — o suficiente para **sentir** se combina com você.

No **Pro**, você treina como quem vai passar: **simulados ilimitados**, express e oficial, **IA ilimitada**, chat por questão, revisão inteligente, cronograma e trilha do dia.

Não é promessa mágica de aprovação. É **treino mensurável** — a mesma lógica de quem performa em prova de massa.

Se a sua prova está a **noventa dias**, existe ainda o plano **Reta Final**: três meses de Pro com melhor custo — foco total até a data.

---

### Cena 6 — Prova social + bônus (7:00–8:15) · ~150 palavras

Quem assina o Pro recebe o **Kit Aprovador OAB**: três guias em PDF — roteiro estratégico, mapa de assuntos prioritários e artigos de alta recorrência — **no e-mail**, assim que o pagamento confirma.

Também dá para abrir os guias online, logado, e salvar de novo em PDF quando quiser.

Pagamento seguro via **Asaas**: PIX, cartão ou boleto. Você cancela o Pro mensal quando quiser, sem multa — direto na sua conta.

E você está protegido pelo **CDC**: sete dias para avaliar; se não fizer sentido, fale com o suporte.

---

### Cena 7 — Oferta (8:15–9:15) · ~140 palavras

Estamos na **oferta de lançamento**:

- **Pro**: de quarenta e nove reais e noventa por **vinte e quatro reais e noventa centavos por mês**.  
- **Reta Final**: de cento e dezenove reais e setenta por **cinquenta e nove reais e noventa centavos** — três meses completos.

Esse preço é agressivo de propósito: queremos **primeiros alunos** usando simulado de verdade e nos mandando feedback — inclusive depoimentos reais para quem vem depois.

Quando a oferta encerrar, o valor sobe para a referência cheia. Quem entra agora, entra no preço promocional enquanto mantiver a assinatura ativa conforme regras do plano.

---

### Cena 8 — CTA final (9:15–10:30) · ~150 palavras

Seu próximo passo é objetivo:

1. Acesse **simulaordem.com.br**.  
2. Crie conta **grátis** — leva dois minutos.  
3. Faça **um simulado** ou abra o termômetro.  
4. Se fizer sentido, em **Planos**, escolha **Pro** ou **Reta Final** e pague no checkout.

Não espere a véspera para descobrir sua nota. **Simule hoje. Meça hoje. Corrija amanhã.**

Clica em **Ver planos** ou **Começar grátis** — e nos vemos do outro lado, com método — não com ansiedade.

Eu te vejo dentro do SimulaOrdem. Bons estudos — e boa prova.

---

## B-roll (opcional, fora do HeyGen)

Intercale no editor (CapCut / DaVinci) **gravação de tela** do site:

- Dashboard + termômetro  
- Simulado com timer  
- Gabarito com Professor IA  
- Página `/planos` com preço de/por  

Isso aumenta credibilidade; avatar sozinho também funciona para v1.

---

## Checklist pós-export

- [ ] YouTube não listado + título: *Como saber se você passaria na OAB hoje | SimulaOrdem*  
- [ ] Coolify → build arg `VITE_VSL_EMBED_URL`  
- [ ] Se vídeo vertical HeyGen: `VITE_VSL_ASPECT=portrait`  
- [ ] Redeploy **web**  
- [ ] Testar `/` e `/planos` — seção só aparece **com** a variável setada  
