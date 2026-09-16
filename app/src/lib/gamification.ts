export const XP_POR_QUESTAO = 10
export const XP_POR_ACERTO = 5
export const XP_POR_PECA = 15

const LEVELS = [
  { level: 1, title: 'Estagiário', minXp: 0 },
  { level: 2, title: 'Bacharel', minXp: 100 },
  { level: 3, title: 'Advogado Júnior', minXp: 300 },
  { level: 4, title: 'Pleno OAB', minXp: 700 },
  { level: 5, title: 'Ministro STF', minXp: 1500 },
]

export function calcXp(progress: { respostas: unknown[]; pecasRespostas?: { correta: boolean }[] }): number {
  const base = progress.respostas.length * XP_POR_QUESTAO
  const bonus = (progress.respostas as { correta?: boolean }[]).filter((r) => r.correta).length * XP_POR_ACERTO
  const pecas = (progress.pecasRespostas ?? []).filter((p) => p.correta).length * XP_POR_PECA
  return base + bonus + pecas
}

export function levelFromXp(xp: number) {
  let current = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.minXp) current = l
  }
  const next = LEVELS.find((l) => l.minXp > xp)
  return {
    ...current,
    xp,
    nextLevel: next?.level ?? null,
    nextTitle: next?.title ?? null,
    xpToNext: next ? next.minXp - xp : 0,
    progressPct: next ? Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100) : 100,
  }
}

export function passariaHoje(acertos: number, total: number): boolean {
  if (total < 20) return false
  const projetado = Math.round((acertos / total) * 80)
  return projetado >= 40
}
