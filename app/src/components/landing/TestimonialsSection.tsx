import { Reveal } from './motion'

const PLACEHOLDER_QUOTES = [
  {
    name: 'Mariana R.',
    detail: '3ª tentativa · SP',
    text: 'O termômetro me mostrou que eu já estava no ritmo da aprovação — parei de estudar no escuro.',
  },
  {
    name: 'Felipe A.',
    detail: 'Concurseiro · RJ',
    text: 'Simulado de 5 horas igual FGV. Na véspera eu sabia exatamente quais matérias revisar.',
  },
  {
    name: 'Juliana M.',
    detail: 'Recém-formada · MG',
    text: 'Professor IA nas questões que eu errava economizou horas relendo PDF genérico.',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="bg-white px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-400">Quem estuda com método</p>
          <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">Menos ansiedade, mais clareza na reta final</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Simulados no tempo real da prova, revisão de erros e IA explicando o que você errou — tudo num só lugar.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLACEHOLDER_QUOTES.map((q, i) => (
            <Reveal key={q.name} delay={i * 90}>
              <blockquote className="card flex h-full flex-col rounded-2xl p-6">
                <p className="flex-1 text-sm leading-relaxed text-ink">&ldquo;{q.text}&rdquo;</p>
                <footer className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-ink">{q.name}</p>
                  <p className="text-xs text-muted">{q.detail}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-8 text-center text-sm text-muted">
          Envie seu depoimento:{' '}
          <a href="mailto:suporte@simulaordem.com.br" className="font-medium text-brand-600 hover:underline">
            suporte@simulaordem.com.br
          </a>
        </p>
      </div>
    </section>
  )
}
