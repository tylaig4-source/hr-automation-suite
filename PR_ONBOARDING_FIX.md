# 🔧 Correção: Modal de Onboarding não aparecendo ao criar conta

## 📋 Resumo

Esta PR corrige o problema onde o modal de seleção de plano não estava aparecendo quando um novo usuário criava uma conta.

## 🐛 Problema Identificado

Quando um usuário criava uma conta:
1. A empresa era criada sem plano ativo (`isTrialing: false`, `credits: 0`, etc.)
2. O usuário era redirecionado para o dashboard
3. O modal de seleção de plano **não aparecia**, deixando o usuário sem acesso

## ✅ Solução Implementada

### 1. Simplificação do `PlanSelectionWrapper`
- **Antes**: Fazia verificação adicional no cliente via API, causando delays e possíveis condições de corrida
- **Depois**: Mostra o modal imediatamente quando o componente é renderizado, já que o servidor só renderiza quando não há plano ativo

### 2. Ajuste na lógica de exibição
- **Antes**: Verificava apenas `!companyInfo.hasActivePlan`
- **Depois**: Verifica também se não há `companyId`, garantindo que o modal apareça mesmo em casos edge

## 🔧 Mudanças Técnicas

### Arquivos Modificados

#### `src/components/dashboard/plan-selection-wrapper.tsx`
- Removida verificação redundante no cliente via `fetch("/api/company/usage")`
- Simplificada para mostrar o modal imediatamente quando montado
- Adicionado `mounted` state para evitar hydration mismatch

#### `src/app/(dashboard)/page.tsx`
- Ajustada condição de renderização: `(!companyId || !companyInfo.hasActivePlan)`
- Garante que o modal apareça mesmo quando não há `companyId` na sessão

## 🎯 Comportamento Esperado

1. ✅ Usuário cria conta → empresa criada sem plano ativo
2. ✅ Usuário é redirecionado para dashboard
3. ✅ Modal de seleção de plano aparece **imediatamente**
4. ✅ Modal não pode ser fechado até selecionar um plano (já implementado)
5. ✅ Fundo com blur impede interação com o resto da página

## 🧪 Testes

- ✅ Build passou sem erros
- ✅ Linter sem erros
- ✅ Validação de tipos TypeScript OK
- ✅ Modal configurado para não poder ser fechado (`onOpenChange={() => {}}`, `onInteractOutside` e `onEscapeKeyDown` bloqueados)

## 📝 Notas

- O modal já estava configurado corretamente para não poder ser fechado
- A correção foca em garantir que o modal seja exibido quando necessário
- A lógica do servidor já estava correta, o problema era na renderização do componente cliente

