# E-mail transacional — SimulaOrdem

## O que envia

| Evento | E-mail |
|--------|--------|
| Cadastro (e-mail/senha ou Google) | Boas-vindas + dados de acesso |
| Login (e-mail/senha) | Código 2FA de 6 dígitos (10 min) |
| Assinatura Pro confirmada | Acesso Pro liberado (via `activateProPlan`) |
| Lembrete diário de estudo (opt-in) | “Hora de estudar!” — cron às 8h (Brasília) |

Login com **Google** não pede 2FA (Google já autentica).

## Lembrete diário de estudo

Usuários com **Conta → Estudo → Lembretes** ativado recebem um e-mail por dia.

- Cron **interno** na API (a cada minuto verifica se é 8h em `America/Sao_Paulo`)
- Um e-mail por usuário por dia (campo `study_reminder_last_sent` no Postgres)
- Template alinhado ao `design.json` (teal, card branco, CTA)

```env
STUDY_REMINDER_CRON_ENABLED=true
STUDY_REMINDER_HOUR=8
STUDY_REMINDER_TZ=America/Sao_Paulo
```

**Cron externo (opcional, Coolify):** se preferir disparo manual/agendado:

```env
CRON_SECRET=uma-string-longa-secreta
```

```bash
curl -X POST https://simulaordem.com.br/api/internal/cron/study-reminders \
  -H "Authorization: Bearer $CRON_SECRET"
```

Desativar cron interno: `STUDY_REMINDER_CRON_ENABLED=false` e use só o endpoint acima.

## Configuração

### Opção A — Hostinger (atual)

hPanel → **E-mails** → **Conecte apps e dispositivos** → copie IMAP/SMTP.

```env
APP_URL=https://simulaordem.com.br
EMAIL_FROM=SimulaOrdem <suporte@simulaordem.com.br>
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=suporte@simulaordem.com.br
SMTP_PASS=<senha-da-caixa>
EMAIL_2FA_ENABLED=true
```

Caixas sugeridas no hPanel:

| Endereço | Uso |
|----------|-----|
| `suporte@` | Envio transacional (app) + atendimento manual |
| `privacidade@` | Alias → `suporte@` (LGPD) |

Ative **DKIM personalizado** no hPanel para melhor entrega.

### Opção B — Resend

1. Crie conta em [resend.com](https://resend.com)
2. Adicione domínio `simulaordem.com.br` e configure DNS (SPF/DKIM)
3. Gere API key

```env
RESEND_API_KEY=re_xxxx
EMAIL_FROM=SimulaOrdem <noreply@simulaordem.com.br>
APP_URL=https://simulaordem.com.br
```

### Opção C — Zoho SMTP

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=noreply@simulaordem.com.br
SMTP_PASS=senha-do-app
EMAIL_FROM=SimulaOrdem <noreply@simulaordem.com.br>
APP_URL=https://simulaordem.com.br
```

## 2FA por e-mail

Ativo automaticamente quando e-mail está configurado.

- Login → senha OK → código no e-mail → tela de verificação → JWT
- Desativar: `EMAIL_2FA_ENABLED=false`
- Sem e-mail configurado (dev local): login direto, sem 2FA

## Validar

```bash
curl -s http://localhost:8080/api/health
# { "email": true, "email2fa": true, ... }
```

## Assinatura Pro (futuro Asaas)

Quando o pagamento confirmar, chame `activateProPlan(userId, expiresAt)` em `api/src/subscriptions.ts` — envia e-mail de acesso Pro automaticamente.
