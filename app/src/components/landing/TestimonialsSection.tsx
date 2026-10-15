const PLACEHOLDER_QUOTES = [
  {
    name: 'Mariana R.',
    detail: '3ª tentativa, SP',
    text: 'O termômetro me mostrou que eu já estava no ritmo da aprovação. Parei de estudar no escuro.',
  },
  {
    name: 'Felipe A.',
    detail: 'Concurseiro, RJ',
    text: 'Simulado de 5 horas igual FGV. Na véspera eu sabia exatamente quais matérias revisar.',
  },
  {
    name: 'Juliana M.',
    detail: 'Recém-formada, MG',
    text: 'Professor IA nas questões que eu errava economizou horas relendo PDF genérico.',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="bg-surface-900 px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-balance font-display text-[2rem] font-medium leading-[1.1] tracking-[-0.01em] text-ink md:text-[2.75rem]">
            Menos ansiedade, mais clareza na reta final
          </h2>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {PLACEHOLDER_QUOTES.map((q) => (
            <blockquote key={q.name} className="flex h-full flex-col border-l-2 border-brand-400 pl-5">
              <p className="flex-1 font-display text-xl leading-snug text-ink">&ldquo;{q.text}&rdquo;</p>
              <footer className="mt-5">
                <p className="text-sm font-semibold text-ink">{q.name}</p>
                <p className="text-xs text-muted">{q.detail}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        <p className="mt-12 text-sm text-muted">
          Estuda com o SimulaOrdem? Envie seu depoimento para{' '}
          <a href="mailto:suporte@simulaordem.com.br" className="font-medium text-brand-600 underline-offset-4 hover:underline">
            suporte@simulaordem.com.br
          </a>
        </p>
      </div>
    </section>
  )
}
