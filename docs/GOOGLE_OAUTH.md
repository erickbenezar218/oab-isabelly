# Google OAuth — SimulaOrdem

Login com Google já está implementado no app. Falta criar o **OAuth Client ID** no Google Cloud e colocar a variável no `.env` / Coolify.

## 1. Google Cloud Console

1. Abra [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto (pode ser o mesmo do Gemini: `414015153757`)
3. **APIs e serviços → Tela de consentimento OAuth**
   - Tipo: **Externo** (ou Interno se for só contas Workspace)
   - Nome do app: **SimulaOrdem**
   - E-mail de suporte: `suporte@simulaordem.com.br`
   - Domínio do app: `simulaordem.com.br`
   - Política de privacidade: `https://simulaordem.com.br/privacidade`
   - Termos: `https://simulaordem.com.br/termos`
   - Escopos: deixe só os padrão (`email`, `profile`, `openid`)
   - Usuários de teste: adicione seu e-mail enquanto o app estiver em **Teste**

4. **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**
   - Tipo: **Aplicativo da Web**
   - Nome: `SimulaOrdem Web`

### Origens JavaScript autorizadas

```
https://simulaordem.com.br
https://www.simulaordem.com.br
http://localhost:5173
http://localhost:8080
```

> Para Sign in with Google (GSI), **origens JavaScript** são obrigatórias. Redirect URI não é usado neste fluxo.

5. Copie o **Client ID** (formato `123456789-xxxx.apps.googleusercontent.com`)

## 2. Variáveis de ambiente

No `.env` local ou no Coolify:

```env
# Backend — valida o ID token
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com

# Frontend — build time (mesmo valor)
VITE_GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
```

**Importante:** `VITE_GOOGLE_CLIENT_ID` entra no bundle do React. Isso é normal — Client ID é público. O segredo fica no Google (origens autorizadas).

## 3. Deploy no Coolify

| Serviço | Variável | Quando |
|---------|----------|--------|
| `api` | `GOOGLE_CLIENT_ID` | Runtime |
| `web` | `VITE_GOOGLE_CLIENT_ID` | **Build** (build arg) |

O `docker-compose.yml` já repassa `VITE_GOOGLE_CLIENT_ID` no build do `web`. Após alterar, **rebuild do serviço web** (não basta restart).

## 4. Validar

```bash
# API configurada?
curl -s http://localhost:8080/api/health
# → { "ok": true, "google": true, "gemini": true, ... }

# Frontend
# Abra /login → botão Google aparece → login → redireciona para /app
```

## 5. Publicar app (sair do modo Teste)

Enquanto a tela de consentimento estiver em **Teste**, só usuários listados como "Test users" conseguem logar.

Para produção:
1. Tela de consentimento → **Publicar app**
2. Se pedir verificação (escopos sensíveis), envie domínio + política de privacidade
3. Para `email` + `profile` + `openid`, geralmente publica sem verificação longa

## 6. Comportamento no SimulaOrdem

- Conta nova via Google → cria usuário `free` + progresso vazio
- E-mail já cadastrado com senha → vincula `google_id` na conta existente
- Próximo login pode ser Google ou e-mail/senha
- Token JWT próprio (30 dias), igual login normal

## Troubleshooting

| Erro | Causa provável |
|------|----------------|
| Botão Google não aparece | `VITE_GOOGLE_CLIENT_ID` vazio no build |
| `origin_mismatch` | Domínio não está nas origens JavaScript |
| `503 token inválido` | `GOOGLE_CLIENT_ID` da API ≠ do frontend |
| `403 access_denied` | App em Teste e e-mail não está nos test users |
| Login funciona local, não em prod | Rebuild do `web` com `VITE_GOOGLE_CLIENT_ID` |
