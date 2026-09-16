# Cloudflare + Coolify — DNS e HTTPS

Domínio: **simulaordem.com.br**

## Ordem recomendada

1. Deploy no Coolify (docker-compose)
2. Adicionar domínio no Coolify → copiar IP do servidor
3. DNS no Cloudflare
4. SSL automático no Coolify (Let's Encrypt)
5. (Opcional) Ativar proxy Cloudflare

---

## 1. Coolify — domínio

No serviço **web** (porta 8080):

- **Domains** → adicionar:
  - `simulaordem.com.br`
  - `www.simulaordem.com.br`
- Marque **Generate SSL** / Let's Encrypt (padrão)
- Anote o **IP público** do servidor Coolify

---

## 2. Cloudflare — DNS

Painel Cloudflare → **DNS → Records**

| Tipo | Nome | Conteúdo | Proxy | TTL |
|------|------|----------|-------|-----|
| **A** | `@` | `IP_DO_COOLIFY` | **DNS only** (nuvem cinza) | Auto |
| **A** ou **CNAME** | `www` | `IP_DO_COOLIFY` ou `simulaordem.com.br` | **DNS only** | Auto |

**Importante na 1ª vez:** deixe a nuvem **cinza** (DNS only) até o certificado Let's Encrypt ser emitido. Com proxy laranja ativo, o Let's Encrypt pode falhar.

---

## 3. HTTPS automático (Coolify)

Com DNS apontando pro IP (propagação 5–30 min):

1. Coolify detecta o domínio e pede certificado **Let's Encrypt**
2. Status fica verde / HTTPS ativo
3. Teste: `https://simulaordem.com.br/api/health`

Se falhar:

- Confirme que `@` aponta pro IP certo (`dig simulaordem.com.br`)
- Nuvem cinza no Cloudflare
- Portas **80** e **443** abertas no firewall do VPS
- Logs do Coolify → SSL / Traefik

---

## 4. Depois do SSL — proxy Cloudflare (opcional)

Quando `https://simulaordem.com.br` abrir com cadeado verde:

1. Cloudflare → **SSL/TLS** → modo **Full (strict)**
2. Ative proxy (nuvem **laranja**) nos registros A de `@` e `www`

Se der erro 526/525, volte para **Full** ou deixe DNS only.

---

## 5. E-mail Hostinger + Cloudflare

O e-mail usa **MX da Hostinger**, não o Cloudflare. Não apague registros MX existentes.

Se Hostinger pediu CNAME `autodiscover` / `autoconfig`, mantenha — não conflitam com o site.

---

## 6. Checklist pós-deploy

```bash
curl -s https://simulaordem.com.br/api/health
```

Esperado:

```json
{
  "ok": true,
  "email": true,
  "email2fa": true,
  "asaas": true,
  "asaasSandbox": true,
  "gemini": true
}
```

(`gemini` e `google` só `true` quando você preencher as chaves.)

---

## 7. Webhook Asaas

URL já configurada:

`https://simulaordem.com.br/api/billing/webhook`

Só funciona **depois** do HTTPS estar no ar.
