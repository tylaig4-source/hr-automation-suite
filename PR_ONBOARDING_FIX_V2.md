# 🔧 Correção: Modal de Onboarding não aparecendo ao criar conta (v2)

## 📋 Resumo

Esta PR corrige definitivamente o problema onde o modal de seleção de plano não estava aparecendo quando um novo usuário criava uma conta, implementando verificações mais robustas e garantindo renderização imediata.

## 🐛 Problema Identificado

Quando um usuário criava uma conta:
1. A empresa era criada sem plano ativo (`isTrialing: false`, `credits: 0`, `maxUsers: 0`, `maxExecutions: 0`)
2. O usuário era redirecionado para o dashboard
3. O modal de seleção de plano **não aparecia**, deixando o usuário sem acesso

**Causas raiz identificadas:**
- `companyId` pode não estar na sessão imediatamente após o registro
- Verificação de `hasActivePlan` não considerava empresas recém-criadas sem limites configurados
- Modal tinha delay na renderização devido a verificação no cliente

## ✅ Solução Implementada

### 1. Busca Robusta do `companyId`
- **Antes**: Dependia apenas do `companyId` da sessão
- **Depois**: Se não estiver na sessão, busca no banco pelo `userId`
- Garante que a empresa seja encontrada mesmo se houver problema na sessão

### 2. Verificação Completa de Plano Ativo
- **Antes**: Verificava apenas `isTrialing` e `subscription.status`
- **Depois**: Verifica também se há limites configurados:
  - `maxUsers > 0` OU
  - `maxExecutions > 0` OU
  - `credits > 0`
- Se a empresa foi criada com tudo zerado, `hasActivePlan` será `false` corretamente

### 3. Renderização Imediata do Modal
- **Antes**: Modal iniciava como `false` e esperava verificação no cliente
- **Depois**: Modal inicia como `true` e aparece imediatamente quando montado
- Reduz delay visual e garante que o usuário veja o modal

### 4. Lógica de Exibição Melhorada
- Verifica `!finalCompanyId || !companyInfo.hasActivePlan`
- Mostra o modal quando não há empresa OU quando não há plano ativo
- Cobre todos os casos edge

## 🔧 Mudanças Técnicas

### Arquivos Modificados

#### `src/app/(dashboard)/page.tsx`
- Adicionada busca de `companyId` no banco se não estiver na sessão
- Verificação de `hasActivePlan` agora inclui limites configurados
- Variável `finalCompanyId` para garantir que sempre temos o ID correto
- Lógica de `shouldShowPlanSelection` mais robusta

#### `src/components/dashboard/plan-selection-wrapper.tsx`
- Modal inicia como `true` em vez de `false`
- Removida verificação redundante no cliente
- Garantia de renderização imediata quando montado

## 🎯 Comportamento Esperado

1. ✅ Usuário cria conta → empresa criada sem plano ativo
2. ✅ Usuário é redirecionado para dashboard
3. ✅ Sistema busca `companyId` (sessão ou banco)
4. ✅ Verifica se tem plano ativo (trial, subscription ou limites)
5. ✅ Modal de seleção de plano aparece **imediatamente**
6. ✅ Modal não pode ser fechado até selecionar um plano
7. ✅ Fundo com blur impede interação com o resto da página

## 🧪 Testes

- ✅ Build passou sem erros
- ✅ Linter sem erros
- ✅ Validação de tipos TypeScript OK
- ✅ Correção de tipos (`hasConfiguredLimits` agora retorna boolean)
- ✅ Modal configurado para não poder ser fechado

## 📝 Notas Técnicas

- A verificação de limites configurados garante que empresas recém-criadas (com tudo zerado) sejam identificadas como sem plano ativo
- A busca de `companyId` no banco cobre casos onde a sessão não foi atualizada imediatamente após o registro
- O modal inicia como `true` para evitar qualquer delay visual
- Todas as verificações são feitas no servidor, garantindo consistência

## 🔍 Casos Cobertos

- ✅ Usuário novo sem `companyId` na sessão
- ✅ Usuário com `companyId` mas sem plano ativo
- ✅ Empresa recém-criada com todos os limites zerados
- ✅ Empresa com trial expirado
- ✅ Empresa com subscription cancelada/expirada

