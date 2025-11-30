# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o HR Automation Suite! Este documento fornece diretrizes para contribuir com o projeto.

---

## 📋 Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Depois clone seu fork
git clone https://github.com/seu-usuario/hr-automation-suite.git
cd hr-automation-suite
```

### 2. Criar uma Branch

```bash
# Crie uma branch para sua feature/correção
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 3. Fazer Mudanças

- Siga os padrões de código existentes
- Adicione testes quando apropriado
- Mantenha a documentação atualizada
- Commite mensagens descritivas

### 4. Testar Localmente

```bash
# Instale dependências
npm install

# Configure o ambiente
cp ENV_TEMPLATE.md .env.local
# Edite .env.local com suas credenciais

# Suba os containers
docker-compose up -d

# Configure o banco
npm run db:push
npm run db:seed

# Execute testes
npm run test

# Inicie o servidor
npm run dev
```

### 5. Commit

```bash
# Use mensagens descritivas
git commit -m "Add: nova funcionalidade de exportação"
git commit -m "Fix: corrige bug no cálculo de tokens"
git commit -m "Update: melhora performance do dashboard"
```

**Padrões de mensagem:**
- `Add:` - Nova feature
- `Fix:` - Correção de bug
- `Update:` - Atualização/melhoria
- `Remove:` - Remoção de código
- `Docs:` - Documentação
- `Refactor:` - Refatoração

### 6. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nome-da-feature

# Abra um Pull Request no GitHub
```

---

## 📝 Padrões de Código

### TypeScript

- Use TypeScript para todo o código
- Evite `any` - use tipos específicos
- Use interfaces para objetos complexos
- Documente funções complexas com JSDoc

### React/Next.js

- Use componentes funcionais com hooks
- Prefira `"use client"` apenas quando necessário
- Use Server Components quando possível
- Mantenha componentes pequenos e focados

### Estilização

- Use Tailwind CSS para estilos
- Siga o design system do shadcn/ui
- Mantenha consistência visual
- Suporte dark mode

### Estrutura de Arquivos

```
src/
├── app/              # Rotas Next.js
├── components/        # Componentes React
│   ├── ui/           # Componentes base (shadcn/ui)
│   ├── shared/       # Componentes compartilhados
│   └── [feature]/    # Componentes específicos
├── lib/              # Utilitários
└── types/            # TypeScript types
```

---

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Com cobertura
npm run test -- --coverage
```

### Escrever Testes

- Teste funcionalidades críticas
- Mantenha testes simples e focados
- Use mocks para dependências externas
- Teste casos de sucesso e erro

---

## 📚 Documentação

### Atualizar Documentação

- Atualize o README se necessário
- Documente novas features
- Adicione exemplos de uso
- Mantenha os snapshots atualizados

### Comentários no Código

```typescript
/**
 * Executa um agente de IA com os inputs fornecidos
 * @param agentSlug - Slug do agente a ser executado
 * @param inputs - Objeto com os inputs do agente
 * @returns Resultado da execução com output e métricas
 */
export async function executeAgent(
  agentSlug: string,
  inputs: Record<string, string>
): Promise<ExecutionResult> {
  // ...
}
```

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifique se o bug já foi reportado
2. Teste na versão mais recente
3. Colete informações relevantes

### Como Reportar

Use o template de issue e inclua:

- **Descrição clara** do problema
- **Passos para reproduzir**
- **Comportamento esperado**
- **Comportamento atual**
- **Screenshots** (se aplicável)
- **Ambiente** (OS, Node.js, etc.)

---

## 💡 Sugerir Features

### Antes de Sugerir

1. Verifique se já existe uma issue similar
2. Considere se a feature se alinha com o projeto
3. Pense na implementação

### Como Sugerir

Use o template de feature request e inclua:

- **Descrição** da feature
- **Problema que resolve**
- **Solução proposta**
- **Alternativas consideradas**
- **Contexto adicional**

---

## 🔍 Revisão de Código

### Checklist para PRs

- [ ] Código segue os padrões do projeto
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Sem warnings do linter
- [ ] Commits descritivos
- [ ] Branch atualizada com main

### Processo de Revisão

1. Mantenedores revisarão seu PR
2. Pode haver sugestões de mudanças
3. Faça as alterações solicitadas
4. Após aprovação, o PR será mergeado

---

## 🎯 Áreas que Precisam de Contribuição

### Prioridade Alta

- [ ] Adicionar os 26 agentes restantes
- [ ] Melhorar testes (cobertura atual baixa)
- [ ] Otimizações de performance
- [ ] Melhorias de acessibilidade

### Prioridade Média

- [ ] Novos componentes UI
- [ ] Integrações com ferramentas externas
- [ ] Melhorias na documentação
- [ ] Tradução para outros idiomas

### Prioridade Baixa

- [ ] Temas customizados
- [ ] Plugins/extensões
- [ ] Exemplos de uso
- [ ] Tutoriais em vídeo

---

## 📞 Dúvidas?

Se tiver dúvidas sobre como contribuir:

- Abra uma [Discussion](https://github.com/seu-usuario/hr-automation-suite/discussions)
- Entre em contato com os mantenedores
- Consulte a documentação existente

---

## 🙏 Obrigado!

Sua contribuição é muito valorizada! Cada PR, issue reportada ou sugestão ajuda a melhorar o projeto.

---

<p align="center">
  Feito com ❤️ pela comunidade
</p>

