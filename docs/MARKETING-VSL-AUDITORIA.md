# Briefing — time de IA (marketing) · Auditoria VSL SimulaOrdem

**Objetivo:** validar se os 3 roteiros HeyGen **vendem de verdade** o produto que está em produção (`simulaordem.com.br`), sem promessa falsa (CDC/CONAR) e sem **sub-vender** diferenciais que existem no app.

**Escopo:** web only · planos Grátis / Pro / Reta Final · Asaas · Kit PDF pós-Pro.

---

## 1. Prompt para colar no agente de marketing

```
Você é analista de conversão + compliance (CDC) para edtech jurídica no Brasil.

Produto: SimulaOrdem — prep OAB 1ª fase (2ª fase parcial), web, assinatura Pro.

Leia:
- Seção 2 (verdade do produto)
- Seção 3 (roteiros VSL atuais)
- Seção 4 (auditoria claim a claim)

Entregue:
1) Nota 0–10: “Este VSL vende o produto real?” + justificativa em 5 linhas.
2) Tabela: Afirmação no roteiro | Fato (✅/⚠️/❌) | Risco legal/comercial | Copy sugerida (1 frase).
3) O que FALTA no VSL para converter (máx. 5 bullets) — só features que EXISTEM no produto.
4) Versão revisada do Vídeo 2/3 (máx. 840 caracteres, parágrafo contínuo, PT-BR natural).
5) Checklist go/no-go antes de subir anúncio pago.

Não invente feature. Se não está na seção 2, não pode prometer.
```

---

## 2. Verdade do produto (fonte: código + `/planos` · set/2026)

### Proposta central (o que somos)

Plataforma **web** de preparação OAB (**1ª + 2ª fase**): **termômetro**, desempenho por matéria, flashcards, simulados (completo/express/oficial), **professor IA** (chat no Pro), revisão, cronograma e Kit PDF. Simulado de 5h é **parte** do método — **não** é o único argumento de venda.

### Banco e formato

| Item | Fato |
|------|------|
| Questões | **1.120** no banco (`banco_oab.json`) — copy “mais de mil” ✅ |
| Simulado completo | **80 questões**, **5 horas** (cronômetro) ✅ |
| Simulado express | **40 questões** / ~1h — existe ✅ |
| Meta aprovação 1ª fase | **40 acertos** (padrão OAB) ✅ |

### Plano Grátis (sem cartão)

| Recurso | Limite real (`FREE_LIMITS`) |
|---------|----------------------------|
| Flashcards | **20/dia** |
| Simulado completo | **1/mês** |
| Simulado express | **1/mês** |
| Explicações IA (tutor) | **5/dia** |
| Revisão inteligente de erros (fila Pro) | **❌ Pro** |
| Cronograma / trilha do dia | **❌ Pro** |
| Desempenho completo por matéria | **❌ Pro** (grátis mais básico) |
| Chat com professor IA por questão | **❌ Pro** |
| Termômetro OAB | **✅** (com dados de simulado/estudo) |
| 2ª fase (peças) | **✅** após marcar aprovação 1ª fase |
| Progresso na nuvem | **✅** logado |

### Plano Pro (R$ 24,90/mês promo · cobrança Asaas)

| Recurso | Fato |
|---------|------|
| Simulados completos + express + oficial | **Ilimitados** |
| IA explicações | **Ilimitadas** (com uso server-side) |
| Chat tutor por questão | **✅ Pro** |
| Revisão de erros | **✅ Pro** |
| Cronograma | **✅ Pro** |
| Histórico simulados | **Completo** |

### Reta Final (R$ 59,90 / 3 meses promo)

| Recurso | Fato |
|---------|------|
| Conteúdo | **Mesmo Pro**, acesso **~90 dias** (cobrança única) |

### Pós-compra Pro

| Item | Fato |
|------|------|
| Kit Aprovador (3 PDFs) | **E-mail** com anexo + `/kit-oab` logado Pro ✅ |
| WhatsApp comercial | **Fora do escopo** (não prometer) |

### Pagamento / conta

- Asaas: **Pix, cartão, boleto** ✅  
- Cancelar assinatura Pro na **Conta** ✅  
- Garantia / arrependimento: ver **Termos** (CDC 7 dias — operacional via suporte)

---

## 3. Roteiros VSL atuais (HeyGen · ~3 min total)

### Vídeo 1/3 — Problema

Vou te fazer uma pergunta direta: se a prova da OAB fosse amanhã, você saberia dizer se passaria? Muita gente trava aqui, e não é porque estuda pouco — é porque estuda sem medir. Você lê, assiste aula, faz questão solta, mas quase nunca encara cinco horas seguidas, oitenta questões, cronômetro ligado, do jeito que a FGV cobra. Sem esse teste, você não sabe se está nos quarenta acertos, qual matéria puxa a nota para baixo, nem se o problema é conteúdo ou tempo. Quando chega a véspera, vira ansiedade e revisão no escuro. Reprovar de novo custa meses e dinheiro. Por isso quem leva a sério segue um ciclo: simular, ver a nota, corrigir o erro e repetir.

### Vídeo 2/3 — Solução (prioridade de auditoria)

Imagina o seguinte: você estuda pra OAB faz tempo, mas quase nunca sentou cinco horas seguidas com oitenta questões, igual no dia da prova. Por isso você fica no achismo, sem nota na cabeça. O Simula Ordem foi feito pra isso. Você simula no tempo da FGV, abre o termômetro e vê se passaria hoje e onde reforçar. Errou? Tem explicação na hora. No grátis são flashcards, um simulado completo por mês, simulado express e cinco explicações por dia. No Pro você tem simulado ilimitado, professor de IA com chat, revisão de erros, cronograma e Kit PDF no e-mail. Mais de mil questões oficiais, progresso na nuvem. Testa grátis, sem cartão. Se fizer sentido, assina o Pro. Prova em uns noventa dias? Reta Final, três meses, costuma compensar.

### Vídeo 3/3 — Oferta + CTA

Se você chegou até aqui, provavelmente quer treinar com método — então vou te contar como entrar. Estamos na oferta de lançamento: o plano Pro sai de quarenta e nove noventa por vinte e quatro noventa por mês, e a Reta Final, três meses, de cento e dezenove setenta por cinquenta e nove noventa. Quem assina o Pro recebe ainda o Kit Aprovador, três PDFs de estudo direto no e-mail. O pagamento é no Pix, cartão ou boleto, e você cancela o Pro quando quiser pela própria conta. O caminho é simples: acessa simulaordem.com.br, cria sua conta grátis, faz um simulado para sentir a plataforma e, se fizer sentido, escolhe Pro ou Reta em Planos. O objetivo é você saber hoje se passaria — não só na véspera. Te espero lá dentro.

---

## 4. Auditoria rápida (pré-análise humana/IA)

| # | Afirmação no VSL | Produto | Veredito | Nota |
|---|------------------|---------|----------|------|
| 1 | Simulado 5h / 80q / FGV | Sim | ✅ | Core — vende bem |
| 2 | Termômetro “passaria hoje” | Sim | ✅ | Diferencial — manter |
| 3 | “Errou? Explicação na hora” | Sim, **5/dia grátis** | ⚠️ | Grátis tem limite; Pro ilimitado — risco de expectativa |
| 4 | Revisão + cronograma + professor IA no Pro | Sim | ✅ | Correto no Pro |
| 5 | “Professor IA cada dúvida” | Pro: explicação + **chat** | ⚠️ | Chat Pro não citado — oportunidade |
| 6 | +1.000 questões oficiais | 1.120 | ✅ | OK |
| 7 | Progresso na nuvem | Sim | ✅ | OK |
| 8 | “Testar totalmente grátis” | Sim, **com limites** | ⚠️ | Dizer “com limite” (já parcialmente) — reforçar 1 sim/mês |
| 9 | Grátis: flashcards + simulado limitado | 20/dia + 1 completo/mês | ⚠️ | Preciso mas pouco específico |
| 10 | Pro libera simulado e explicação | Sim | ✅ | OK |
| 11 | Reta 3 meses | Sim | ✅ | OK |
| 12 | Kit PDF no Pro | Sim (vídeo 3) | ✅ | Bom no CTA, ausente no v2 |
| 13 | 2ª fase / peças | Sim | ❌ omitido | Sub-venda vs landing |
| 14 | Simulado express | Sim | ❌ omitido | Diferencial vs concorrentes |
| 15 | “Garante aprovação” | Não prometemos | ✅ | Não aparece — correto |

### O VSL vende o produto?

**Parcialmente (≈7/10):** acerta **dor + simulado + termômetro + Pro vs grátis + preço + kit**.  
**Fraco em:** limites do grátis (compliance), **chat Pro**, **2ª fase**, **express**, prova social real.

---

## 5. Sugestões de copy (sem aumentar muito o tamanho)

**Vídeo 2 — linha grátis mais honesta e ainda vendedora:**

> “… testa grátis, sem cartão: flashcards, um simulado por mês e algumas explicações por dia.”

**Vídeo 2 — fechar diferencial Pro em uma frase:**

> “… no Pro, simulado ilimitado, chat com o professor de IA e revisão dos erros.”

**Vídeo 3 — já forte; opcional:**

> mencionar cancelamento **sem multa** (já na Conta).

---

## 6. Go / no-go tráfego pago

| Critério | Status sugerido |
|----------|-----------------|
| Preços VSL = Asaas / site | Validar env produção |
| Limites grátis não omitidos em ads | ⚠️ ajustar copy |
| Depoimentos landing | Placeholders — **não escalar Meta** sem reais |
| Kit PDF testado pós-pagamento | Teste operacional |
| Termos/privacidade no ar | ✅ |

---

## 7. Arquivos relacionados

- Roteiros + HeyGen: `docs/VSL-HEYGEN.md`
- Preços vitrine: `app/src/lib/pricing.ts`
- Limites grátis: `api/src/freeLimits.ts`
- Planos UI: `app/src/pages/Planos.tsx`

**Última revisão doc:** alinhada ao commit `main` pós-Kit PDF Pro (set/2026).
