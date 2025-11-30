# 🚀 Guia Completo - Criar Repositório no GitHub

Este guia mostra passo a passo como criar o repositório no GitHub e fazer o push inicial.

---

## 📋 Pré-requisitos

1. **Conta no GitHub** - Se não tem, crie em [github.com](https://github.com)
2. **Git instalado** - Verifique com: `git --version`
3. **GitHub CLI (opcional)** - Para criar repositório via linha de comando

---

## 🎯 Método 1: Via Interface Web (Recomendado para iniciantes)

### Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito → **"New repository"**
3. Preencha os dados:
   - **Repository name**: `hr-automation-suite` (ou o nome que preferir)
   - **Description**: `Sistema SaaS de Automação de RH com Agentes de IA Especializados`
   - **Visibility**: Escolha **Public** ou **Private**
   - ⚠️ **NÃO** marque "Initialize with README" (já temos um)
   - ⚠️ **NÃO** adicione .gitignore ou license (já temos)
4. Clique em **"Create repository"**

### Passo 2: Copiar URL do Repositório

Após criar, você verá uma página com instruções. **Copie a URL** do repositório, será algo como:
```
https://github.com/seu-usuario/hr-automation-suite.git
```

### Passo 3: Executar Comandos no Terminal

Execute os comandos abaixo na ordem (substitua `seu-usuario` e `hr-automation-suite` pelos seus valores):

```bash
# 1. Navegar para o diretório do projeto
cd "/home/tylaig/Repositorios/Saas Rh"

# 2. Inicializar repositório Git (se ainda não foi feito)
git init

# 3. Adicionar todos os arquivos
git add .

# 4. Fazer commit inicial
git commit -m "Initial commit: HR Automation Suite MVP

- Sistema completo de automação de RH com agentes de IA
- 8 agentes implementados (MVP)
- Autenticação completa
- Sistema de templates e histórico
- Exportação PDF/DOCX
- Analytics básico
- Docker Compose configurado
- Instalador automático"

# 5. Renomear branch para main (se necessário)
git branch -M main

# 6. Adicionar remote do GitHub (SUBSTITUA pela sua URL)
git remote add origin https://github.com/SEU-USUARIO/hr-automation-suite.git

# 7. Verificar remote adicionado
git remote -v

# 8. Fazer push inicial
git push -u origin main
```

**Se pedir autenticação:**
- **Username**: Seu usuário do GitHub
- **Password**: Use um **Personal Access Token** (não sua senha)
  - Como criar: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
  - Permissões: `repo` (todas)

---

## 🎯 Método 2: Via GitHub CLI (Mais Rápido)

Se você tem o GitHub CLI instalado:

```bash
# 1. Fazer login no GitHub CLI
gh auth login

# 2. Navegar para o diretório
cd "/home/tylaig/Repositorios/Saas Rh"

# 3. Inicializar Git (se necessário)
git init
git add .
git commit -m "Initial commit: HR Automation Suite MVP"

# 4. Criar repositório e fazer push (tudo em um comando!)
gh repo create hr-automation-suite --public --source=. --remote=origin --push
```

**Opções:**
- `--public` = Repositório público (use `--private` para privado)
- `--source=.` = Usa o diretório atual
- `--remote=origin` = Adiciona como origin
- `--push` = Faz push automaticamente

---

## 🔧 Comandos Adicionais Úteis

### Verificar Status
```bash
git status
```

### Ver Histórico de Commits
```bash
git log --oneline
```

### Ver Remotes Configurados
```bash
git remote -v
```

### Alterar URL do Remote
```bash
git remote set-url origin https://github.com/SEU-USUARIO/OUTRO-REPO.git
```

### Adicionar Arquivos Específicos
```bash
git add arquivo.txt
git add pasta/
```

### Fazer Commit com Mensagem
```bash
git commit -m "Sua mensagem aqui"
```

### Fazer Push
```bash
git push
# ou
git push origin main
```

### Fazer Pull (atualizar do GitHub)
```bash
git pull origin main
```

---

## ⚠️ Solução de Problemas

### Erro: "fatal: not a git repository"
```bash
# Inicialize o repositório
git init
```

### Erro: "remote origin already exists"
```bash
# Remova o remote existente
git remote remove origin

# Adicione novamente
git remote add origin https://github.com/SEU-USUARIO/hr-automation-suite.git
```

### Erro: "Authentication failed"
- Use **Personal Access Token** em vez de senha
- Crie em: GitHub → Settings → Developer settings → Personal access tokens

### Erro: "Permission denied"
- Verifique se você tem permissão no repositório
- Verifique se a URL está correta

### Erro: "Updates were rejected"
```bash
# Se alguém fez push antes, faça pull primeiro
git pull origin main --rebase

# Depois faça push
git push origin main
```

---

## 📝 Checklist Antes do Push

- [ ] Verificar se `.env.local` está no `.gitignore` (não commitar credenciais!)
- [ ] Verificar se `node_modules/` está no `.gitignore`
- [ ] Verificar se `.next/` está no `.gitignore`
- [ ] Atualizar URLs no README.md (substituir `seu-usuario` pelo seu usuário)
- [ ] Verificar se não há dados sensíveis no código
- [ ] README.md está completo e atualizado
- [ ] LICENSE está presente
- [ ] CONTRIBUTING.md está presente (opcional mas recomendado)

---

## 🎨 Após Criar o Repositório

### Adicionar Descrição e Tópicos

1. Vá para a página do repositório no GitHub
2. Clique em **⚙️ Settings** (ou edite diretamente na página)
3. Adicione:
   - **Description**: "Sistema SaaS de Automação de RH com Agentes de IA"
   - **Topics**: `nextjs`, `typescript`, `ai`, `hr`, `automation`, `saas`, `prisma`, `postgresql`

### Adicionar Badges (Opcional)

Você pode adicionar badges no README para mostrar status:
- Build status
- License
- Version
- etc.

### Configurar GitHub Pages (Opcional)

Para hospedar documentação:
1. Settings → Pages
2. Source: `main` branch → `/docs` folder
3. Salve

---

## 🚀 Próximos Passos

Após criar o repositório:

1. ✅ **Clone em outro lugar** (teste):
   ```bash
   git clone https://github.com/SEU-USUARIO/hr-automation-suite.git
   ```

2. ✅ **Adicione colaboradores** (se necessário):
   - Settings → Collaborators → Add people

3. ✅ **Configure GitHub Actions** (CI/CD):
   - Crie `.github/workflows/ci.yml` para testes automáticos

4. ✅ **Adicione Issues templates**:
   - Crie `.github/ISSUE_TEMPLATE/` para padronizar issues

5. ✅ **Adicione Pull Request template**:
   - Crie `.github/pull_request_template.md`

---

## 📚 Recursos Úteis

- [GitHub Docs](https://docs.github.com/)
- [Git Handbook](https://guides.github.com/introduction/git-handbook/)
- [GitHub CLI Docs](https://cli.github.com/manual/)

---

**🎉 Pronto! Seu repositório está no GitHub!**

