# 🔒 Sistema de Segurança de Assinaturas e Validação em Tempo Real

## 📋 Resumo

Este PR implementa um sistema completo de segurança para assinaturas, incluindo validação em tempo real com Stripe, bloqueio automático quando pagamentos falham, avisos de pagamento e verificação periódica de assinaturas expiradas. Também inclui melhorias no onboarding com seleção obrigatória de plano.

## ✨ Principais Funcionalidades

### 1. 🔒 Validação de Assinaturas em Tempo Real
- ✅ **Validação com Stripe**: Verifica status real da assinatura diretamente com Stripe antes de permitir acesso
- ✅ **Prevenção de Manipulação**: Impede que status de assinatura sejam alterados manualmente no banco de dados
- ✅ **Middleware de Segurança**: `validateSubscriptionAccess()` valida assinatura em rotas críticas
- ✅ **Configurável**: Taxa de validação ajustável via `SUBSCRIPTION_VALIDATION_RATE` (0.0 a 1.0)

### 2. ⚠️ Sistema de Bloqueio Automático
- ✅ **Bloqueio por Status**: Bloqueia acesso quando assinatura está `OVERDUE`, `CANCELED`, `EXPIRED` ou `PENDING`
- ✅ **Integração em Rotas Críticas**: Bloqueio implementado em:
  - Execução de agentes (`/api/execute/[agentSlug]`)
  - Verificação de permissões (`canExecuteAgents`)
- ✅ **Mensagens Claras**: Mensagens de erro específicas para cada status

### 3. 🔔 Sistema de Avisos de Pagamento
- ✅ **Componente PaymentAlert**: Exibe alertas visuais baseados no status da assinatura
- ✅ **Avisos Contextuais**:
  - 🟡 **Amarelo**: Pagamento próximo (7 dias antes do vencimento)
  - 🔴 **Vermelho**: Pagamento em atraso (`OVERDUE`)
  - 🔴 **Vermelho**: Assinatura cancelada/expirada
  - 🟡 **Amarelo**: Pagamento pendente (`PENDING`)
- ✅ **Notificações Automáticas**: Cria notificações quando pagamento falha ou assinatura expira

### 4. 🔄 Verificação Periódica de Assinaturas
- ✅ **Função de Verificação**: `checkAndUpdateExpiredSubscriptions()` verifica assinaturas expiradas
- ✅ **API Admin**: `/api/admin/subscriptions/check-expired` para verificação manual ou via cron
- ✅ **Validação em Lote**: `/api/admin/subscriptions/validate` valida todas as assinaturas ACTIVE
- ✅ **Sincronização com Stripe**: Atualiza status no banco baseado no status real do Stripe

### 5. 🎯 Onboarding com Seleção de Plano
- ✅ **Registro sem Plano Ativo**: Novas contas são criadas sem plano ativo
- ✅ **Modal de Seleção de Plano**: Usuário deve escolher plano no primeiro acesso
- ✅ **Ativação de Trial**: API `/api/company/activate-trial` para ativar trial quando escolhido
- ✅ **Bloqueio até Escolha**: Dashboard bloqueado até usuário escolher um plano

### 6. 📚 Melhorias no Webhook do Stripe
- ✅ **Notificações Automáticas**: Cria notificações quando pagamento falha
- ✅ **Mapeamento de Status**: Mapeia corretamente status do Stripe (`past_due`, `unpaid`, `canceled`, etc.)
- ✅ **Atualização Automática**: Atualiza status no banco quando webhook recebe eventos

## 🔧 Mudanças Técnicas

### Novos Arquivos

#### Bibliotecas
- `src/lib/subscription-security.ts`: Middleware de segurança para validação de assinaturas
- `src/lib/subscription-utils.ts`: Funções utilitárias para verificação e validação

#### API Routes
- `src/app/api/company/activate-trial/route.ts`: API para ativar trial após escolha
- `src/app/api/admin/subscriptions/check-expired/route.ts`: API para verificar assinaturas expiradas
- `src/app/api/admin/subscriptions/validate/route.ts`: API para validar todas as assinaturas ACTIVE

#### Componentes
- `src/components/dashboard/payment-alert.tsx`: Componente de alerta de pagamento
- `src/components/dashboard/plan-selection-wrapper.tsx`: Wrapper para modal de seleção
- `src/components/onboarding/plan-selection-modal.tsx`: Modal de seleção de plano

#### Documentação
- `docs/SUBSCRIPTION_EXPIRATION_CHECK.md`: Guia completo de verificação de assinaturas

### Arquivos Modificados

#### Core
- `src/app/api/auth/register/route.ts`: Cria empresas sem plano ativo
- `src/app/api/execute/[agentSlug]/route.ts`: Adiciona validação de assinatura antes de executar
- `src/lib/trial-settings.ts`: Integra validação de assinatura em `canExecuteAgents`
- `src/app/api/stripe/webhook/route.ts`: Melhora tratamento de eventos e cria notificações
- `src/app/api/company/usage/route.ts`: Adiciona `hasActivePlan` e `subscription` na resposta
- `src/app/(dashboard)/page.tsx`: Integra `PaymentAlert` e `PlanSelectionWrapper`

#### Configuração
- `docs/ENV_TEMPLATE.md`: Adiciona `SUBSCRIPTION_VALIDATION_RATE`
- `README.md`: Adiciona seção sobre segurança de assinaturas e referências aos novos docs

## 🧪 Como Testar

### 1. Testar Validação em Tempo Real
```bash
# 1. Criar uma conta e assinar um plano
# 2. Tentar executar um agente
# 3. O sistema deve validar com Stripe antes de permitir
```

### 2. Testar Bloqueio por Status
```bash
# 1. Ter uma assinatura ACTIVE
# 2. Simular pagamento falho no Stripe (ou marcar como OVERDUE manualmente)
# 3. Tentar executar agente - deve bloquear
```

### 3. Testar Avisos de Pagamento
```bash
# 1. Ter uma assinatura com status diferente de ACTIVE
# 2. Acessar dashboard
# 3. Verificar que alerta aparece no topo
```

### 4. Testar Verificação Periódica
```bash
# Como admin, chamar:
curl -X POST http://localhost:3000/api/admin/subscriptions/check-expired \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"
```

### 5. Testar Onboarding
```bash
# 1. Criar nova conta
# 2. Fazer login
# 3. Verificar que modal de seleção de plano aparece
# 4. Escolher plano (trial ou pago)
# 5. Verificar que acesso é liberado
```

## ⚙️ Configuração

### Variável de Ambiente

Adicione ao `.env.local`:

```env
# Taxa de validação de assinaturas com Stripe (0.0 a 1.0)
# 1.0 = sempre validar (máxima segurança, mais lento)
# 0.1 = validar 10% das vezes (mais rápido, menos seguro)
# Padrão: 1.0 (sempre validar)
SUBSCRIPTION_VALIDATION_RATE=1.0
```

### Cron Job (Recomendado)

Configure um cron job para verificar assinaturas expiradas diariamente:

```bash
# Executar diariamente às 2h da manhã
0 2 * * * curl -X POST https://seu-dominio.com/api/admin/subscriptions/check-expired
```

## 📊 Impacto

### Segurança
- ✅ **Prevenção de Fraudes**: Validação em tempo real impede manipulação de assinaturas
- ✅ **Bloqueio Imediato**: Acesso bloqueado assim que pagamento falha
- ✅ **Auditoria**: Todas as validações são logadas

### Experiência do Usuário
- ✅ **Avisos Claros**: Usuário sempre sabe o status da assinatura
- ✅ **Onboarding Melhorado**: Fluxo mais claro para novos usuários
- ✅ **Notificações**: Usuário é avisado quando há problemas

### Performance
- ⚠️ **Validação com Stripe**: Pode adicionar latência (configurável via `SUBSCRIPTION_VALIDATION_RATE`)
- ✅ **Cache**: Validação pode ser reduzida para X% das requisições

## ✅ Checklist

- [x] Código testado localmente
- [x] Build executado com sucesso
- [x] Validação em tempo real implementada
- [x] Sistema de bloqueio funcionando
- [x] Avisos de pagamento exibidos corretamente
- [x] Verificação periódica implementada
- [x] Onboarding com seleção de plano funcionando
- [x] Webhook do Stripe melhorado
- [x] Documentação atualizada
- [x] README atualizado
- [x] Sem erros de lint
- [x] Sem erros de TypeScript

## 🔗 Issues Relacionadas

- Sistema de segurança de assinaturas
- Bloqueio quando pagamento falha
- Validação em tempo real com Stripe
- Onboarding com seleção de plano obrigatória
- Verificação periódica de assinaturas expiradas

## 📝 Commits Incluídos

- `fc577ac`: feat: Implementar bloqueio de acesso e avisos para pagamentos de recorrência
- `c429b1c`: feat: Adicionar sistema de validação de assinaturas em tempo real e atualizar README

---

**Branch:** `feature/subscription-security-and-validation`  
**Base:** `main`  
**Commits:** 2 commits


