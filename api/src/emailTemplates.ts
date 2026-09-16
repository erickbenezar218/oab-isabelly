import { appUrl } from './email.js'

/** Tokens alinhados a app/design.json */
const C = {
  primary: '#1C3F3A',
  primaryHover: '#0F2A27',
  accent: '#3C8F92',
  page: '#F8FAFB',
  card: '#FFFFFF',
  muted: '#F1F5F9',
  heading: '#0F172A',
  body: '#475569',
  caption: '#64748B',
  light: '#94A3B8',
  border: '#E2E8F0',
  success: '#16A34A',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  warningBg: '#FEFCE8',
  warningBorder: '#FDE68A',
} as const

function logoUrl() {
  return `${appUrl()}/logo.svg`
}

function btn(href: string, label: string, variant: 'primary' | 'secondary' = 'primary', newTab = false) {
  const bg = variant === 'primary' ? C.primary : C.card
  const color = variant === 'primary' ? '#FFFFFF' : C.primary
  const border = variant === 'primary' ? 'none' : `1px solid ${C.border}`
  const target = newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
  return `<a href="${href}"${target} style="display:inline-block;margin-top:20px;padding:12px 28px;background:${bg};color:${color};border:${border};border-radius:12px;font-size:14px;font-weight:600;text-decoration:none">${label}</a>`
}

function infoBox(content: string, tone: 'neutral' | 'success' = 'neutral') {
  const bg = tone === 'success' ? C.successBg : C.muted
  const border = tone === 'success' ? C.successBorder : C.border
  return `<div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:16px 18px;margin:16px 0">${content}</div>`
}

export type EmailLayoutOptions = {
  preheader?: string
  title: string
  bodyHtml: string
  cta?: { href: string; label: string }
  secondaryCta?: { href: string; label: string }
}

export function renderEmailLayout(opts: EmailLayoutOptions): { html: string; textFooter: string } {
  const loginUrl = `${appUrl()}/login`
  const appLink = `${appUrl()}/app`
  const preheader = opts.preheader ?? opts.title
  const ctaBlock = opts.cta ? btn(opts.cta.href, opts.cta.label) : btn(appLink, 'Abrir o SimulaOrdem')
  const secondaryBlock = opts.secondaryCta
    ? btn(opts.secondaryCta.href, opts.secondaryCta.label, 'secondary')
    : ''

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${opts.title}</title>
  <!--[if mso]><style>body{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${C.page};font-family:'Plus Jakarta Sans',Inter,system-ui,-apple-system,sans-serif;color:${C.heading}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
          <tr>
            <td align="center" style="padding-bottom:24px">
              <img src="${logoUrl()}" alt="SimulaOrdem" width="160" height="40" style="display:block;height:auto;max-width:160px;border:0" />
            </td>
          </tr>
          <tr>
            <td style="background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:32px 28px;box-shadow:0 1px 3px rgba(15,23,42,0.06)">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${C.accent}">SimulaOrdem</p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:${C.heading}">${opts.title}</h1>
              <div style="font-size:15px;line-height:1.65;color:${C.body}">${opts.bodyHtml}</div>
              <div style="text-align:center">${ctaBlock}${secondaryBlock ? `<span style="display:inline-block;width:8px"></span>${secondaryBlock}` : ''}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;text-align:center">
              <p style="margin:0 0 6px;font-size:12px;color:${C.caption}">Preparação completa para a OAB — 1ª e 2ª fase</p>
              <p style="margin:0;font-size:11px;color:${C.light}">
                <a href="${loginUrl}" style="color:${C.accent};text-decoration:none">Entrar</a>
                &nbsp;·&nbsp;
                <a href="mailto:suporte@simulaordem.com.br" style="color:${C.accent};text-decoration:none">suporte@simulaordem.com.br</a>
              </p>
              <p style="margin:12px 0 0;font-size:10px;color:${C.light}">R E BENEZAR DE SOUZA LTDA</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return {
    html,
    textFooter: `\n\n—\nSimulaOrdem\n${appLink}\nSuporte: suporte@simulaordem.com.br`,
  }
}

export function renderWelcomeEmail(params: {
  name: string
  email: string
  planLabel: string
  passwordHint?: string
}) {
  const passwordLine = params.passwordHint
    ? `<p style="margin:0 0 8px"><strong style="color:${C.heading}">Senha de acesso:</strong> ${params.passwordHint}</p>`
    : `<p style="margin:0 0 8px">Use a senha que você definiu no cadastro ou continue com Google.</p>`

  const bodyHtml = `
    <p style="margin:0 0 16px">Olá, <strong style="color:${C.heading}">${params.name}</strong>! Sua conta foi criada com sucesso.</p>
    ${infoBox(`
      <p style="margin:0 0 8px"><strong style="color:${C.heading}">E-mail:</strong> ${params.email}</p>
      ${passwordLine}
      <p style="margin:0"><strong style="color:${C.heading}">Plano:</strong> ${params.planLabel}</p>
    `)}
    <p style="margin:0 0 12px">No app você encontra:</p>
    <ul style="margin:0;padding-left:20px;color:${C.body}">
      <li style="margin-bottom:6px"><strong>Flashcards</strong> — active recall rápido</li>
      <li style="margin-bottom:6px"><strong>Simulados</strong> — 80 questões no ritmo da prova</li>
      <li style="margin-bottom:6px"><strong>Revisão de erros</strong> — fila automática + tutor IA</li>
      <li><strong>2ª fase</strong> — treino de peças processuais</li>
    </ul>
    <p style="margin:16px 0 0">Ao entrar pela primeira vez, um tour rápido mostra cada módulo.</p>`

  const { html, textFooter } = renderEmailLayout({
    preheader: `Bem-vindo ao SimulaOrdem, ${params.name}!`,
    title: `Bem-vindo(a), ${params.name}!`,
    bodyHtml,
    cta: { href: `${appUrl()}/app`, label: 'Começar a estudar' },
    secondaryCta: { href: `${appUrl()}/planos`, label: 'Ver planos' },
  })

  return {
    html,
    text: `Bem-vindo ao SimulaOrdem, ${params.name}!\n\nE-mail: ${params.email}\nPlano: ${params.planLabel}\n${params.passwordHint ? `Senha: ${params.passwordHint}\n` : ''}Acesse: ${appUrl()}/app${textFooter}`,
  }
}

export function renderProAccessEmail(params: {
  name: string
  email: string
  expiresAt?: Date | null
  passwordHint?: string
}) {
  const expiry = params.expiresAt
    ? `<p style="margin:0"><strong style="color:${C.heading}">Válido até:</strong> ${params.expiresAt.toLocaleDateString('pt-BR')}</p>`
    : ''
  const passwordLine = params.passwordHint
    ? `<p style="margin:0 0 8px"><strong style="color:${C.heading}">Senha:</strong> ${params.passwordHint}</p>`
    : `<p style="margin:0 0 8px">Entre com sua senha ou Google.</p>`

  const bodyHtml = `
    <p style="margin:0 0 16px">Olá, <strong style="color:${C.heading}">${params.name}</strong>! Sua assinatura Pro foi confirmada.</p>
    ${infoBox(`
      <p style="margin:0 0 8px"><strong style="color:${C.heading}">E-mail:</strong> ${params.email}</p>
      ${passwordLine}
      <p style="margin:0 0 8px"><strong style="color:${C.heading}">Plano:</strong> Pro</p>
      ${expiry}
    `, 'success')}
    <p style="margin:0">Agora você tem:</p>
    <ul style="margin:8px 0 0;padding-left:20px">
      <li style="margin-bottom:6px">Simulados ilimitados</li>
      <li style="margin-bottom:6px">Cronograma e meta diária</li>
      <li style="margin-bottom:6px">Histórico completo + revisão de erros</li>
      <li>Tutor IA por questão</li>
    </ul>`

  const { html, textFooter } = renderEmailLayout({
    preheader: 'Seu plano Pro SimulaOrdem está ativo',
    title: 'Plano Pro ativado!',
    bodyHtml,
    cta: { href: `${appUrl()}/app`, label: 'Abrir o app' },
  })

  return {
    html,
    text: `Olá ${params.name}, seu plano Pro está ativo!\n\nE-mail: ${params.email}\nAcesse: ${appUrl()}/app${textFooter}`,
  }
}

export function renderPasswordResetEmail(params: { name: string; resetUrl: string }) {
  const bodyHtml = `
    <p style="margin:0 0 16px">Olá, <strong style="color:${C.heading}">${params.name}</strong>. Recebemos um pedido para redefinir a senha da sua conta SimulaOrdem.</p>
    <p style="margin:0 0 16px;font-size:14px;color:${C.body}">Clique no botão abaixo para criar uma nova senha. O link abre em uma nova aba e expira em <strong>1 hora</strong>.</p>
    ${btn(params.resetUrl, 'Redefinir minha senha', 'primary', true)}
    <p style="margin:20px 0 0;font-size:12px;color:${C.caption};word-break:break-all">Se o botão não funcionar, copie e cole este link no navegador:<br/><a href="${params.resetUrl}" style="color:${C.accent}">${params.resetUrl}</a></p>
    <p style="margin:16px 0 0;font-size:14px;color:${C.caption}">Se você não pediu isso, ignore este e-mail — sua senha continua a mesma.</p>`

  const { html, textFooter } = renderEmailLayout({
    preheader: 'Redefina sua senha do SimulaOrdem',
    title: 'Redefinir senha',
    bodyHtml,
  })

  return {
    html,
    text: `Olá ${params.name},\n\nRedefina sua senha: ${params.resetUrl}\n\nVálido por 1 hora. Se não foi você, ignore.${textFooter}`,
  }
}

export function renderLoginOtpEmail(params: { name: string; code: string }) {
  const bodyHtml = `
    <p style="margin:0 0 16px">Olá, <strong style="color:${C.heading}">${params.name}</strong>. Use o código abaixo para concluir seu login:</p>
    <div style="text-align:center;margin:24px 0">
      <span style="display:inline-block;font-size:32px;font-weight:700;letter-spacing:10px;color:${C.primary};background:${C.muted};padding:18px 28px;border-radius:12px;border:1px solid ${C.border}">${params.code}</span>
    </div>
    <p style="margin:0;font-size:14px;color:${C.caption}">Válido por 10 minutos. Se você não tentou entrar, ignore este e-mail.</p>`

  const { html, textFooter } = renderEmailLayout({
    preheader: `Código de login: ${params.code}`,
    title: 'Código de verificação',
    bodyHtml,
    cta: { href: `${appUrl()}/login`, label: 'Ir para o login' },
  })

  return {
    html,
    text: `Seu código de login SimulaOrdem: ${params.code}\n\nVálido por 10 minutos.${textFooter}`,
  }
}
