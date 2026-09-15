import { Link } from 'react-router-dom'

export default function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-900 px-4 py-8">
      <div className="legal-content mx-auto max-w-2xl">
        <Link to="/login" className="text-sm text-brand-300 underline">
          ← Voltar
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">{title}</h1>
        <div className="mt-6 space-y-6 text-sm leading-relaxed text-purple-100/90">{children}</div>
      </div>
    </div>
  )
}
