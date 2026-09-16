# Pagamentos Asaas — SimulaOrdem

Integração com **Asaas Sandbox** para testes e **Produção** quando for ao ar de verdade.

## Planos

| Plano | Valor | Tipo Asaas |
|-------|-------|------------|
| Pro | R$ 24,90/mês | Assinatura mensal recorrente |
| Reta Final | R$ 59,90 | Cobrança única (90 dias Pro) |

## 1. Conta Sandbox

1. Acesse [sandbox.asaas.com](https://sandbox.asaas.com)
2. Crie conta / faça login
3. **Integrações → API → Gerar chave de API**
   - Chave começa com `$aact_hmlg_`

## 2. Variáveis no Coolify (serviço `api`)

```env
ASAAS_ENV=sandbox
# No Coolify/Docker Compose: use $$ no início (senão o $ vira variável)
ASAAS_API_KEY=$$aact_hmlg_sua_chave_aqui
ASAAS_WEBHOOK_TOKEN=escolha-uma-string-secreta-longa
ASAAS_PRO_VALUE=24.90
ASAAS_RETA_VALUE=59.90
APP_URL=https://simulaordem.com.br
```

Em produção:

```env
ASAAS_ENV=production
ASAAS_API_KEY=$aact_prod_...
```

## 3. Webhook

No painel Asaas → **Integrações → Webhooks → Adicionar**

| Campo | Valor |
|-------|-------|
| URL | `https://simulaordem.com.br/api/billing/webhook` |
| Token de autenticação | mesmo valor de `ASAAS_WEBHOOK_TOKEN` |
| Eventos | **Cobranças** → `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED` |

O Asaas envia o header `asaas-access-token` — a API valida contra `ASAAS_WEBHOOK_TOKEN`.

## 4. Fluxo do usuário

1. `/planos` → Assinar Pro ou Reta Final
2. `/planos/checkout?plan=pro` → informa CPF
3. Redireciona para fatura Asaas (cartão, PIX ou boleto)
4. Após pagamento → `/planos/sucesso`
5. Webhook ativa Pro + e-mail de confirmação

## 5. Testar no Sandbox

No Sandbox **não existe API** para confirmar pagamento. Após criar a cobrança:

1. Abra a cobrança no painel sandbox.asaas.com
2. Clique **Confirmar pagamento** ou **Receber pagamento**
3. O webhook dispara e o usuário vira Pro

CPF de teste válido (formato): use um CPF real ou gerador — o Asaas valida dígitos.

## 6. Validar integração

```bash
curl -s https://simulaordem.com.br/api/health
# "asaas": true, "asaasSandbox": true

curl -s https://simulaordem.com.br/api/billing/config
# { "enabled": true, "sandbox": true, "plans": { ... } }
```

## 7. Produção

- Troque `ASAAS_ENV=production` e chave `$aact_prod_`
- Recrie webhook na conta produção
- Homologue PIX/cartão com valores reais
