# 🔐 Configuração de Autenticação Git

## Opção 1: SSH (Recomendado - Mais Seguro)

### Passo 1: Gerar chave SSH (se não tiver)

```bash
ssh-keygen -t ed25519 -C "tylaig@gmail.com"
# Pressione Enter para aceitar o local padrão
# Digite uma senha (opcional, mas recomendado)
```

### Passo 2: Adicionar chave SSH ao ssh-agent

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Passo 3: Copiar chave pública

```bash
cat ~/.ssh/id_ed25519.pub
# Copie a saída completa
```

### Passo 4: Adicionar chave no GitHub

1. Acesse: https://github.com/settings/keys
2. Clique em "New SSH key"
3. Cole a chave pública
4. Salve

### Passo 5: Alterar remote para SSH

```bash
cd "/home/tylaig/Repositorios/Saas Rh"
git remote set-url origin git@github.com:tylaig4-source/hr-automation-suite.git
```

### Passo 6: Testar conexão

```bash
ssh -T git@github.com
```

### Passo 7: Fazer push

```bash
git push -u origin feat/migrate-to-stripe
```

---

## Opção 2: Personal Access Token (HTTPS)

### Passo 1: Criar Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome: "HR Automation Suite"
4. Selecione escopos:
   - ✅ `repo` (acesso completo aos repositórios)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você só verá uma vez!)

### Passo 2: Configurar Git Credential Helper

```bash
git config --global credential.helper store
```

### Passo 3: Fazer push (vai pedir credenciais)

```bash
cd "/home/tylaig/Repositorios/Saas Rh"
git push -u origin feat/migrate-to-stripe
```

Quando pedir:
- **Username**: `tylaig4-source` (ou seu username do GitHub)
- **Password**: Cole o Personal Access Token (não sua senha!)

---

## Opção 3: GitHub CLI (Mais Fácil)

### Passo 1: Instalar GitHub CLI

```bash
# Ubuntu/Debian
sudo apt install gh

# Ou via snap
sudo snap install gh
```

### Passo 2: Fazer login

```bash
gh auth login
# Escolha: GitHub.com
# Escolha: HTTPS
# Escolha: Login with a web browser
# Siga as instruções
```

### Passo 3: Fazer push

```bash
cd "/home/tylaig/Repositorios/Saas Rh"
git push -u origin feat/migrate-to-stripe
```

---

## 🚀 Recomendação

**Use a Opção 1 (SSH)** - É mais segura e não expira como tokens.

Se já tiver chave SSH configurada, apenas execute:

```bash
cd "/home/tylaig/Repositorios/Saas Rh"
git remote set-url origin git@github.com:tylaig4-source/hr-automation-suite.git
git push -u origin feat/migrate-to-stripe
```

