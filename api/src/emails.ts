import { appUrl, fireAndForgetEmail } from './email.js'

const brand = '#1C3F3A'

function layout(title: string, body: string) {
  const loginUrl = `${appUrl()}/login`
  return {
    html: `<!DOCTYPE html><html lang="pt-BR"><body style="margin:0;background:#F8FAFB;font-family:system-ui,sans-serif;color:#0f172a">
<div style="max-width:520px;margin:0 auto;padding:32px 16px">
  <div style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:32px">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:${brand}">SimulaOrdem</p>
    <h1 style="margin:0 0 16px;font-size:22px">${title}</h1>
    ${body}
    <p style="margin:24px 0 0;font-size:13px;color:#64748b">Acesse: <a href="${loginUrl}" style="color:${brand}">${loginUrl}</a></p>
  </div>
  <p style="margin:16px 0 0;text-align:center;font-size:11px;color:#94a3b8">R E BENEZAR DE SOUZA LTDA · suporte@simulaordem.com.br</p>
</div></body></html>`,
  }
}

export function sendWelcomeEmail(params: { to: string; name: string; planLabel?: string; passwordHint?: string }) {
  const plan = params.planLabel ?? 'Grátis'
  const passwordLine = params.passwordHint
    ? `<p style="margin:0 0 12px"><strong>Senha de acesso:</strong> ${params.passwordHint}</p>`
    : `<p style="margin:0 0 12px">Use a senha que você definiu no cadastro.</p>`

  const { html } = layout(
    `Bem-vindo(a), ${params.name}!`,
    `<p style="margin:0 0 16px;line-height:1.6">Sua conta no SimulaOrdem foi criada com sucesso.</p>
     <div style="background:#F8FAFB;border-radius:12px;padding:16px;margin:0 0 16px">
       <p style="margin:0 0 8px"><strong>E-mail:</strong> ${params.to}</p>
       ${passwordLine}
       <p style="margin:0"><strong>Plano:</strong> ${plan}</p>
     </div>
     <p style="margin:0;line-height:1.6">Entre e comece a treinar com simulados, flashcards e revisão de erros.</p>`,
  )

  fireAndForgetEmail({
    to: params.to,
    subject: 'Bem-vindo ao SimulaOrdem — seus dados de acesso',
    html,
    text: `Bem-vindo ao SimulaOrdem, ${params.name}!\n\nE-mail: ${params.to}\nPlano: ${plan}\n${params.passwordHint ? `Senha: ${params.passwordHint}\n` : 'Use a senha que você definiu no cadastro.\n'}\nAcesse: ${appUrl()}/login`,
  })
}

export function sendProAccessEmail(params: { to: string; name: string; expiresAt?: Date | null; passwordHint?: string }) {
  const expiry = params.expiresAt
    ? `<p style="margin:0"><strong>Válido até:</strong> ${params.expiresAt.toLocaleDateString('pt-BR')}</p>`
    : ''
  const passwordLine = params.passwordHint
    ? `<p style="margin:0 0 12px"><strong>Senha de acesso:</strong> ${params.passwordHint}</p>`
    : `<p style="margin:0 0 12px">Use a senha da sua conta ou entre com Google.</p>`

  const { html } = layout(
    'Seu plano Pro está ativo!',
    `<p style="margin:0 0 16px;line-height:1.6">Olá, ${params.name}! Sua assinatura foi confirmada.</p>
     <div style="background:#ecfdf5;border-radius:12px;padding:16px;margin:0 0 16px;border:1px solid #a7f3d0">
       <p style="margin:0 0 8px"><strong>E-mail:</strong> ${params.to}</p>
       ${passwordLine}
       <p style="margin:0 0 8px"><strong>Plano:</strong> Pro</p>
       ${expiry}
     </div>
     <p style="margin:0;line-height:1.6">Você agora tem simulados ilimitados, histórico completo, revisão de erros e tutor IA.</p>`,
  )

  fireAndForgetEmail({
    to: params.to,
    subject: 'SimulaOrdem Pro — acesso liberado',
    html,
    text: `Olá ${params.name}, seu plano Pro está ativo!\n\nE-mail: ${params.to}\nAcesse: ${appUrl()}/login`,
  })
}

export function sendLoginOtpEmail(params: { to: string; name: string; code: string }) {
  const { html } = layout(
    'Código de verificação',
    `<p style="margin:0 0 16px;line-height:1.6">Olá, ${params.name}. Use o código abaixo para concluir seu login:</p>
     <div style="text-align:center;margin:24px 0">
       <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:8px;color:${brand};background:#F8FAFB;padding:16px 24px;border-radius:12px">${params.code}</span>
     </div>
     <p style="margin:0;line-height:1.6;color:#64748b;font-size:14px">Válido por 10 minutos. Se você não tentou entrar, ignore este e-mail.</p>`,
  )

  fireAndForgetEmail({
    to: params.to,
    subject: `${params.code} — código de login SimulaOrdem`,
    html,
    text: `Seu código de login SimulaOrdem: ${params.code}\n\nVálido por 10 minutos.`,
  })
}
