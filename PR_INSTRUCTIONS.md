# 🚀 Instruções para Criar Pull Request

## ✅ Status Atual

- ✅ Branch criada: `feat/migrate-to-stripe`
- ✅ Commits realizados
- ⏳ Push pendente (requer autenticação)

## 📋 Próximos Passos

### 1. Fazer Push da Branch

```bash
# Se usar HTTPS (pode pedir credenciais)
git push -u origin feat/migrate-to-stripe

# Se usar SSH
git remote set-url origin git@github.com:tylaig4-source/hr-automation-suite.git
git push -u origin feat/migrate-to-stripe
```

### 2. Criar Pull Request no GitHub

Após o push, você pode criar a PR de duas formas:

#### Opção A: Via GitHub Web Interface

1. Acesse: https://github.com/tylaig4-source/hr-automation-suite
2. Você verá um banner sugerindo criar uma PR da branch `feat/migrate-to-stripe`
3. Clique em "Compare & pull request"
4. Use o título e descrição abaixo

#### Opção B: Via GitHub CLI

```bash
gh pr create --title "feat: Migrate from Asaas to Stripe payment integration" --body "$(cat PR_DESCRIPTION.md)"
```

## 📝 Título da PR

```
feat: Migrate from Asaas to Stripe payment integration
```

## 📄 Descrição da PR

```markdown
## 🎯 Objetivo

Migrar completamente a integração de pagamentos do Asaas para o Stripe, incluindo suporte a PIX (recentemente disponibilizado) e cartão de crédito.

## ✨ Principais Mudanças

### 🔄 Integração Stripe
- ✅ Biblioteca Stripe completa com suporte a PIX e cartão
- ✅ API routes para customers, subscriptions e webhooks
- ✅ Handlers de webhook para eventos de pagamento
- ✅ Suporte a PIX (QR Code e Copia e Cola)
- ✅ Suporte a assinaturas recorrentes com cartão

### 📊 Admin
- ✅ Nova página `/admin/payments` para gerenciar pagamentos
- ✅ Estatísticas de pagamentos (total, recebidos, pendentes, receita)
- ✅ Filtros e busca de pagamentos
- ✅ Detalhes completos de cada pagamento
- ✅ Atualização das configurações admin para Stripe

### 🗄️ Database
- ✅ Schema atualizado: `asaas*` → `stripe*` fields
- ✅ Migração de campos:
  - `asaasCustomerId` → `stripeCustomerId`
  - `asaasSubscriptionId` → `stripeSubscriptionId`
  - `asaasPaymentId` → `stripePaymentIntentId` + `stripeChargeId`

### 🧹 Limpeza
- ✅ Removidos todos os arquivos do Asaas
- ✅ Removidas todas as referências ao Asaas
- ✅ Atualizado checkout modal para usar Stripe

### 📚 Documentação
- ✅ README.md atualizado com informações do Stripe
- ✅ ENV_TEMPLATE.md atualizado com variáveis do Stripe
- ✅ Instruções de configuração atualizadas

## 🔧 Variáveis de Ambiente

### Removidas (Asaas)
- `ASAAS_API_KEY`
- `ASAAS_ENVIRONMENT`
- `ASAAS_WEBHOOK_TOKEN`

### Adicionadas (Stripe)
- `STRIPE_SECRET_KEY` (obrigatório)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (obrigatório)
- `STRIPE_WEBHOOK_SECRET` (obrigatório para webhooks)

## 📦 Dependências

- ✅ Adicionado: `stripe` (npm package)

## ⚠️ Breaking Changes

1. **Schema do Banco de Dados**: Campos `asaas*` foram removidos e substituídos por `stripe*`
   - ⚠️ Requer `npx prisma db push --accept-data-loss` ou migração manual
   
2. **Variáveis de Ambiente**: Todas as variáveis `ASAAS_*` devem ser substituídas por `STRIPE_*`

3. **API Routes**: Todas as rotas `/api/asaas/*` foram removidas e substituídas por `/api/stripe/*`

## 🧪 Como Testar

1. Configure as variáveis de ambiente do Stripe
2. Execute `npx prisma db push` para atualizar o schema
3. Configure webhook no Stripe Dashboard:
   - URL: `https://seu-dominio.com/api/stripe/webhook`
   - Eventos: `payment_intent.*`, `invoice.*`, `customer.subscription.*`
4. Teste criação de customer
5. Teste criação de subscription
6. Teste pagamento com PIX
7. Teste pagamento com cartão
8. Verifique webhooks no admin

## 📸 Screenshots

- [ ] Adicionar screenshot da página de pagamentos
- [ ] Adicionar screenshot das configurações Stripe

## ✅ Checklist

- [x] Código testado localmente
- [x] Schema do banco atualizado
- [x] Documentação atualizada
- [x] Variáveis de ambiente documentadas
- [x] Breaking changes documentados
- [ ] Testes de integração realizados
- [ ] Webhook configurado e testado

## 🔗 Links Úteis

- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe API Keys](https://dashboard.stripe.com/apikeys)
- [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
- [Stripe PIX Documentation](https://docs.stripe.com/payments/pix)
```

## 📊 Estatísticas da PR

- **Arquivos modificados**: 34
- **Linhas adicionadas**: +2,243
- **Linhas removidas**: -1,360
- **Novos arquivos**: 11
- **Arquivos removidos**: 6

## 🎯 Labels Sugeridas

- `feature`
- `breaking-change`
- `payment`
- `stripe`

## 👥 Reviewers

Sugerir revisão para:
- Equipe de backend
- Equipe de pagamentos
- DevOps (para variáveis de ambiente)

