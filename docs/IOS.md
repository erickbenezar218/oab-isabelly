# App iOS nativo (Capacitor)

O SimulaOrdem roda como **app iOS nativo** (Capacitor) com a mesma API e progresso da web.

## Diferenças do app vs site

| Recurso | Web | App iOS |
|---------|-----|---------|
| Abertura | Landing page | **Login direto** |
| Histórico / progresso | Nuvem (mesma conta) | **Mesma conta, mesma API** |
| Google login | Botão GSI web | **Login nativo Google** |
| Esqueci senha | Funciona in-app | **Funciona in-app** (sem abrir Safari) |
| Lembrete estudo | E-mail 8h | **E-mail + notificação local 8h** |
| Pagamento Pro | Asaas (PIX/cartão/boleto) | **Asaas in-app + volta automática** |
| Ícone | PWA | **Logo SimulaOrdem** |

## Pagamento no iPhone (Asaas, sem Apple IAP)

1. Planos → Checkout → **Ir para pagamento**
2. Abre o **Asaas dentro do app** (browser nativo)
3. Paga com PIX, cartão ou boleto
4. Asaas redireciona → app abre em **Pagamento recebido**
5. Plano **Pro** atualiza na mesma conta (web + iOS)

**Deploy necessário:** API (`returnTo=app`) + **web** (`/payment/return`) + rebuild iOS (`@capacitor/browser` + deep link).

## Build e instalar no iPhone

```bash
# 1. Configure .env na raiz (ver abaixo)
# 2. Build + sync iOS
bash scripts/build-ios.sh

# 3. Abrir Xcode
cd app && npm run cap:open
```

No Xcode: Team → seu iPhone → **▶ Run**.

## Variáveis `.env` para iOS

```env
# API (obrigatório — app nativo usa URL absoluta)
VITE_IOS_API_URL=https://simulaordem.com.br/api

# Google — Web Client ID (backend valida este token)
GOOGLE_CLIENT_ID=266921366485-xxxx.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=266921366485-xxxx.apps.googleusercontent.com

# Google — iOS Client ID (OBRIGATÓRIO para botão Google no app)
# Crie em Google Cloud → Credenciais → OAuth → iOS
# Bundle ID: com.simulaordem.app
VITE_GOOGLE_IOS_CLIENT_ID=266921366485-yyyy.apps.googleusercontent.com
```

### Criar Client ID iOS no Google Cloud

1. [Google Cloud Console](https://console.cloud.google.com/) → Credenciais
2. **Criar credenciais → ID do cliente OAuth → iOS**
3. Nome: `SimulaOrdem iOS`
4. **ID do pacote:** `com.simulaordem.app`
5. Copie o Client ID para `VITE_GOOGLE_IOS_CLIENT_ID` no `.env`
6. Rode `bash scripts/build-ios.sh` de novo (atualiza URL scheme no Info.plist)

## Primeira instalação no iPhone

1. Cabo USB + **Confiar** no Mac
2. **Modo de Desenvolvedor** (Ajustes → Privacidade)
3. Xcode → Signing → Personal Team
4. Após instalar: **Ajustes → Geral → VPN e gerenciamento → Confiar** no desenvolvedor
5. Notificações: ao abrir o app, aceite permissão para lembretes às 8h

## Atualizar app após mudanças no código

```bash
bash scripts/build-ios.sh
# Xcode → Cmd+R
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `bash scripts/build-ios.sh` | Build produção + sync iOS + patch plist |
| `cd app && npm run cap:open` | Abre Xcode |
| `cd app && npm run ios:prepare` | Alias do build-ios |

## App Store (futuro)

Requer Apple Developer Program (US$ 99/ano) + push APNs server-side para notificações remotas sem abrir o app.

Hoje: **notificações locais** agendadas no dispositivo + **e-mail** via API.
