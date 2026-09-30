/**
 * Popula progresso fictício (simulados, flashcards, revisão) para gravação de VSL/demo.
 *
 * Uso:
 *   node scripts/seed-demo-progress.mjs seu@email.com
 *   node scripts/seed-demo-progress.mjs --print-sql seu@email.com   # colar no psql (Coolify)
 *
 * Env: DATABASE_URL (default postgres local do compose)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const printSql = process.argv.includes('--print-sql')
const email = process.argv
  .slice(2)
  .find((a) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a))
  ?.trim()
  .toLowerCase()

if (!email) {
  console.error('Informe o e-mail: node scripts/seed-demo-progress.mjs [--print-sql] usuario@email.com')
  process.exit(1)
}

function loadBanco() {
  const candidates = [
    path.join(__dirname, 'banco_oab.json'),
    path.join(__dirname, '../../banco_oab.json'),
    path.join(__dirname, '../banco_oab.json'),
  ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'))
  }
  throw new Error('banco_oab.json não encontrado (rode na raiz do repo ou copie o arquivo).')
}

function pickExamPool(questoes, exameLabel) {
  const pool = questoes.filter((q) => q.exame === exameLabel).sort((a, b) => a.numero - b.numero)
  if (pool.length < 80) throw new Error(`Exame "${exameLabel}" com poucas questões (${pool.length}).`)
  return pool
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildSimulado({ exame, questoes, acertosAlvo, total, daysAgo, tempoUsadoSeg }) {
  const slice = questoes.slice(0, total)
  const wrongNeeded = total - acertosAlvo
  const wrongIdx = new Set(shuffle(slice.map((_, i) => i)).slice(0, wrongNeeded))
  const respostas = {}
  let acertos = 0
  for (let i = 0; i < slice.length; i++) {
    const q = slice[i]
    const correta = q.resposta_correta
    const erradas = ['A', 'B', 'C', 'D'].filter((l) => l !== correta)
    const sel = wrongIdx.has(i) ? erradas[i % erradas.length] : correta
    if (sel === correta) acertos++
    respostas[q.id] = sel
  }
  const finalizadoEm = Date.now() - daysAgo * 24 * 60 * 60 * 1000
  return {
    id: crypto.randomUUID(),
    exame,
    acertos,
    total,
    tempoUsadoSeg,
    finalizadoEm,
    respostas,
    questaoIds: slice.map((q) => q.id),
  }
}

function respostaFromQuestao(q, correta, modulo, timestamp) {
  const erradas = ['A', 'B', 'C', 'D'].filter((l) => l !== q.resposta_correta)
  const selecionada = correta ? q.resposta_correta : erradas[0]
  return {
    questaoId: q.id,
    selecionada,
    correta: selecionada === q.resposta_correta,
    modulo,
    timestamp,
    exame: q.exame,
    materia: q.materia,
  }
}

function buildDemoProgress(questoes) {
  const exame = '43º Exame'
  const pool80 = pickExamPool(questoes, exame)
  const poolExpress = shuffle(pool80).slice(0, 40)

  const simulados = [
    buildSimulado({ exame, questoes: pool80, acertosAlvo: 44, total: 80, daysAgo: 2, tempoUsadoSeg: 3 * 3600 + 1200 }),
    buildSimulado({ exame, questoes: pool80, acertosAlvo: 41, total: 80, daysAgo: 12, tempoUsadoSeg: 4 * 3600 }),
    buildSimulado({ exame, questoes: poolExpress, acertosAlvo: 29, total: 40, daysAgo: 18, tempoUsadoSeg: 3200 }),
    buildSimulado({ exame, questoes: pool80, acertosAlvo: 36, total: 80, daysAgo: 28, tempoUsadoSeg: Math.round(4.5 * 3600) }),
    buildSimulado({ exame, questoes: pool80, acertosAlvo: 32, total: 80, daysAgo: 40, tempoUsadoSeg: Math.round(4.2 * 3600) }),
  ]

  const respostas = []
  const seen = new Set()

  for (const sim of simulados) {
    for (const qid of sim.questaoIds) {
      const q = questoes.find((x) => x.id === qid)
      if (!q) continue
      const key = `${qid}-simulado`
      if (seen.has(key)) continue
      seen.add(key)
      const sel = sim.respostas[qid]
      respostas.push({
        questaoId: q.id,
        selecionada: sel,
        correta: sel === q.resposta_correta,
        modulo: 'simulado',
        timestamp: sim.finalizadoEm + 1000,
        exame: q.exame,
        materia: q.materia,
      })
    }
  }

  const flashPool = shuffle(questoes).slice(0, 180)
  const flashTarget = 95
  let flashOk = 0
  for (let d = 0; d < 25; d++) {
    const dayTs = Date.now() - d * 24 * 60 * 60 * 1000
    const perDay = d === 0 ? 18 : d < 7 ? 8 : 4
    for (let n = 0; n < perDay && respostas.length < flashTarget + simulados.length * 80; n++) {
      const q = flashPool[(d * 7 + n) % flashPool.length]
      const key = `${q.id}-flashcard-${d}-${n}`
      if (seen.has(key)) continue
      seen.add(key)
      const wantOk = flashOk < Math.floor(flashTarget * 0.74)
      const entry = respostaFromQuestao(q, wantOk, 'flashcard', dayTs - n * 60_000)
      if (entry.correta) flashOk++
      respostas.push(entry)
    }
  }

  const wrongIds = []
  for (const sim of simulados) {
    for (const qid of sim.questaoIds) {
      const sel = sim.respostas[qid]
      const q = questoes.find((x) => x.id === qid)
      if (q && sel !== q.resposta_correta) wrongIds.push(qid)
    }
  }
  const salvosRevisao = [...new Set(wrongIds)].slice(0, 14)

  const today = new Date().toISOString().slice(0, 10)

  return {
    respostas,
    salvosRevisao,
    customCards: [
      {
        id: crypto.randomUUID(),
        titulo: 'Prescrição intercorrente',
        conteudo: 'Execução fiscal — marco inicial e paralisação > 1 ano (STJ).',
        materia: 'Direito Tributário',
        criadoEm: Date.now() - 5 * 86400000,
      },
      {
        id: crypto.randomUUID(),
        titulo: 'Justa causa — gradação',
        conteudo: 'Revisar súmulas TST sobre advertência/suspensão antes da dispensa.',
        materia: 'Direito do Trabalho',
        criadoEm: Date.now() - 11 * 86400000,
      },
    ],
    flashcardStreak: 8,
    flashcardLastDate: today,
    simulados,
    pecasRespostas: [
      { casoId: 'peca-001', selecionada: 'Reclamação Trabalhista', correta: true, timestamp: Date.now() - 86400000 * 3 },
      { casoId: 'peca-003', selecionada: 'Petição Inicial', correta: true, timestamp: Date.now() - 86400000 * 6 },
      { casoId: 'peca-007', selecionada: 'Contestação', correta: false, timestamp: Date.now() - 86400000 * 9 },
    ],
  }
}

function userProfileSql() {
  const examDate = '2026-04-05'
  return `
UPDATE users SET
  plan = 'pro',
  plan_expires_at = NOW() + INTERVAL '1 year',
  exam_date = '${examDate}'::date,
  area_2fase = 'Trabalhista',
  onboarding_done = TRUE,
  welcome_tour_done = TRUE,
  daily_goal_override = 25,
  fase1_aprovada = FALSE,
  updated_at = NOW()
WHERE email = '${email.replace(/'/g, "''")}';`.trim()
}

async function main() {
  const banco = loadBanco()
  const data = buildDemoProgress(banco.questoes)

  if (printSql) {
    const json = JSON.stringify(data)
    console.log('-- Cole no psql (container db). Ajuste e-mail se necessário.\n')
    console.log(userProfileSql())
    console.log('')
    console.log(
      `UPDATE user_progress SET data = $json$${json}$json$::jsonb, updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}');`,
    )
    console.log('\n-- Conferir:')
    console.log(
      `SELECT (data->'simulados')::jsonb AS sims, jsonb_array_length(data->'respostas') AS respostas FROM user_progress WHERE user_id = (SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}');`,
    )
    return
  }

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://simulaordem:simulaordem@localhost:5432/simulaordem',
  })
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (!rows[0]) {
    console.error('Usuário não encontrado:', email)
    process.exit(1)
  }
  const userId = rows[0].id
  await pool.query(
    `UPDATE users SET
      plan = 'pro',
      plan_expires_at = NOW() + INTERVAL '1 year',
      exam_date = '2026-04-05'::date,
      area_2fase = 'Trabalhista',
      onboarding_done = TRUE,
      welcome_tour_done = TRUE,
      daily_goal_override = 25,
      updated_at = NOW()
     WHERE id = $1`,
    [userId],
  )
  await pool.query(
    `INSERT INTO user_progress (user_id, data, updated_at) VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [userId, data],
  )
  await pool.end()
  console.log('OK:', email)
  console.log('  simulados:', data.simulados.length, '| respostas:', data.respostas.length)
  console.log('  último simulado:', `${data.simulados[0].acertos}/${data.simulados[0].total}`)
  console.log('Recarregue o app (F5) ou saia e entre de novo.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
