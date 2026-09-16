import { fireAndForgetEmail } from './email.js'
import {
  renderLoginOtpEmail,
  renderPasswordResetEmail,
  renderProAccessEmail,
  renderStudyReminderEmail,
  renderWelcomeEmail,
} from './emailTemplates.js'
import { sendEmail } from './email.js'

export function sendWelcomeEmail(params: { to: string; name: string; planLabel?: string; passwordHint?: string }) {
  const { html, text } = renderWelcomeEmail({
    name: params.name,
    email: params.to,
    planLabel: params.planLabel ?? 'Grátis',
    passwordHint: params.passwordHint,
  })

  fireAndForgetEmail({
    to: params.to,
    subject: 'Bem-vindo ao SimulaOrdem — sua conta está pronta',
    html,
    text,
  })
}

export function sendProAccessEmail(params: { to: string; name: string; expiresAt?: Date | null; passwordHint?: string }) {
  const { html, text } = renderProAccessEmail({
    name: params.name,
    email: params.to,
    expiresAt: params.expiresAt,
    passwordHint: params.passwordHint,
  })

  fireAndForgetEmail({
    to: params.to,
    subject: 'SimulaOrdem Pro — acesso liberado',
    html,
    text,
  })
}

export function sendPasswordResetEmail(params: { to: string; name: string; resetUrl: string }) {
  const { html, text } = renderPasswordResetEmail({
    name: params.name,
    resetUrl: params.resetUrl,
  })

  fireAndForgetEmail({
    to: params.to,
    subject: 'Redefinir senha — SimulaOrdem',
    html,
    text,
  })
}

export async function sendStudyReminderEmail(params: { to: string; name: string; hourLabel: string }) {
  const { html, text } = renderStudyReminderEmail({
    name: params.name,
    hourLabel: params.hourLabel,
  })

  await sendEmail({
    to: params.to,
    subject: 'Hora de estudar! — SimulaOrdem',
    html,
    text,
  })
}

export function sendLoginOtpEmail(params: { to: string; name: string; code: string }) {
  const { html, text } = renderLoginOtpEmail({
    name: params.name,
    code: params.code,
  })

  fireAndForgetEmail({
    to: params.to,
    subject: `${params.code} — código de login SimulaOrdem`,
    html,
    text,
  })
}
