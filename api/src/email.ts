type SendParams = {
  to: string
  subject: string
  html: string
  text: string
}

function fromAddress() {
  return process.env.EMAIL_FROM ?? 'SimulaOrdem <noreply@simulaordem.com.br>'
}

function appUrl() {
  return (process.env.APP_URL ?? 'https://simulaordem.com.br').replace(/\/$/, '')
}

export function isEmailConfigured(): boolean {
  if (process.env.RESEND_API_KEY?.trim()) return true
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim())
}

export function isEmail2faEnabled(): boolean {
  if (process.env.EMAIL_2FA_ENABLED === 'false') return false
  return isEmailConfigured()
}

export { appUrl }

async function sendViaResend(params: SendParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY!.trim()
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend ${res.status}: ${body}`)
  }
}

async function sendViaSmtp(params: SendParams): Promise<void> {
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  await transporter.sendMail({
    from: fromAddress(),
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  })
}

export async function sendEmail(params: SendParams): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('[email] não configurado — e-mail não enviado:', params.subject, '→', params.to)
    return
  }
  if (process.env.RESEND_API_KEY?.trim()) {
    await sendViaResend(params)
    return
  }
  await sendViaSmtp(params)
}

export function fireAndForgetEmail(params: SendParams): void {
  sendEmail(params).catch((err) => {
    console.error('[email] falha ao enviar:', params.subject, err)
  })
}
