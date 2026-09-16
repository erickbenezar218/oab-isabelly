import type { ReactNode } from 'react'

function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

type Block =
  | { kind: 'intro'; lines: string[] }
  | { kind: 'section'; title: string; lines: string[] }
  | { kind: 'hr' }

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []
  let current: { kind: 'intro' | 'section'; title?: string; lines: string[] } = { kind: 'intro', lines: [] }

  const flush = () => {
    if (current.lines.some((l) => l.trim())) {
      if (current.kind === 'section' && current.title) {
        blocks.push({ kind: 'section', title: current.title, lines: [...current.lines] })
      } else {
        blocks.push({ kind: 'intro', lines: [...current.lines] })
      }
    }
  }

  for (const raw of content.split('\n')) {
    const line = raw.trimEnd()
    if (line.trim() === '---') {
      flush()
      blocks.push({ kind: 'hr' })
      current = { kind: 'intro', lines: [] }
      continue
    }
    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) {
      flush()
      current = { kind: 'section', title: h3[1].trim(), lines: [] }
      continue
    }
    current.lines.push(line)
  }
  flush()
  return blocks
}

function renderLines(lines: string[]) {
  const nodes: ReactNode[] = []
  let listItems: string[] = []
  let ordered = false

  const flushList = () => {
    if (!listItems.length) return
    const Tag = ordered ? 'ol' : 'ul'
    nodes.push(
      <Tag
        key={`list-${nodes.length}`}
        className={`my-2 space-y-1.5 pl-1 ${ordered ? 'list-decimal' : 'list-disc'} ml-4 marker:text-brand-500`}
      >
        {listItems.map((item, i) => (
          <li key={i} className="pl-0.5 leading-relaxed text-ink/90">
            {parseInline(item)}
          </li>
        ))}
      </Tag>,
    )
    listItems = []
    ordered = false
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      continue
    }
    const bullet = trimmed.match(/^[*\-•]\s+(.+)$/)
    if (bullet) {
      listItems.push(bullet[1])
      continue
    }
    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/)
    if (numbered) {
      if (listItems.length && !ordered) flushList()
      ordered = true
      listItems.push(numbered[1])
      continue
    }
    flushList()
    nodes.push(
      <p key={`p-${nodes.length}`} className="my-2 leading-relaxed text-ink/90">
        {parseInline(trimmed)}
      </p>,
    )
  }
  flushList()
  return nodes
}

function sectionTone(title: string) {
  const t = title.toLowerCase()
  if (t.includes('dica') || t.includes('revisão')) return 'tip'
  if (t.includes('gabarito') || t.includes('corret')) return 'success'
  if (t.includes('errad') || t.includes('errou')) return 'error'
  return 'default'
}

const toneStyles = {
  default: 'border-slate-200 bg-white',
  tip: 'border-amber-200 bg-amber-50/80',
  success: 'border-green-200 bg-green-50/60',
  error: 'border-red-200 bg-red-50/50',
} as const

const toneTitle = {
  default: 'text-brand-700',
  tip: 'text-amber-900',
  success: 'text-green-800',
  error: 'text-red-800',
} as const

export default function TutorMarkdown({ content }: { content: string }) {
  const blocks = parseBlocks(content)

  return (
    <div className="tutor-markdown space-y-3">
      {blocks.map((block, i) => {
        if (block.kind === 'hr') {
          return <hr key={i} className="border-slate-200" />
        }
        if (block.kind === 'intro') {
          return (
            <div key={i} className="rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-3">
              {renderLines(block.lines)}
            </div>
          )
        }
        const tone = sectionTone(block.title)
        return (
          <section
            key={i}
            className={`rounded-xl border px-4 py-3 ${toneStyles[tone]}`}
          >
            <h3 className={`mb-1 text-sm font-bold ${toneTitle[tone]}`}>{block.title}</h3>
            <div className="text-sm">{renderLines(block.lines)}</div>
          </section>
        )
      })}
    </div>
  )
}
