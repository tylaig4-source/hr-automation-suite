# 🔐 Guia de Autenticação GitHub

## ⚠️ IMPORTANTE

O GitHub **não aceita mais senha normal** para autenticação via Git! Você precisa usar um **Personal Access Token**.

---

## 🚀 Método 1: Usar Token na URL (Mais Fácil)

### Passo 1: Criar Personal Access Token

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Preencha:
   - **Note**: `hr-automation-suite`
   - **Expiration**: Escolha um prazo (ex: 90 dias)
   - **Select scopes**: Marque **`repo`** (todas as permissões)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você não verá novamente!)

### Passo 2: Usar Token no Push

```bash
# Substitua SEU-TOKEN pelo token que você copiou
git push https://SEU-TOKEN@github.com/tylaig4-source/hr-automation-suite.git main
```

**OU** configure na URL do remote:

```bash
# Remover remote atual
git remote remove origin

# Adicionar com token na URL (SUBSTITUA SEU-TOKEN)
git remote add origin https://SEU-TOKEN@github.com/tylaig4-source/hr-automation-suite.git

# Fazer push
git push -u origin main
```

---

## 🚀 Método 2: Usar Token quando Pedir (Interativo)

### Passo 1: Criar Token (mesmo processo acima)

### Passo 2: Fazer Push

```bash
# Limpar credenciais antigas
git credential-cache exit

# Fazer push (vai pedir credenciais)
git push -u origin main
```

**Quando pedir:**
- **Username**: `tylaig4-source` (seu usuário)
- **Password**: **COLE O TOKEN** (não sua senha!)

---

## 🚀 Método 3: Usar Script Automático

```bash
# Execute o script que criamos
./push-to-github.sh
```

O script vai guiar você passo a passo.

---

## 🔧 Configurar Credenciais Permanentemente

### Opção A: Salvar Token no Git Credential Helper

```bash
# Configurar para salvar credenciais
git config --global credential.helper store

# Fazer push (vai pedir uma vez e salvar)
git push -u origin main
# Username: tylaig4-source
# Password: SEU-TOKEN
```

### Opção B: Usar GitHub CLI (Recomendado)

```bash
# Instalar GitHub CLI (se não tiver)
# Linux: sudo apt install gh
# Ou: https://cli.github.com/

# Fazer login
gh auth login

# Fazer push (não precisa de token)
git push -u origin main
```

---

## 🐛 Solução de Problemas

### Erro: "Permission denied (403)"

**Causa**: Token inválido ou sem permissões

**Solução**:
1. Verifique se o token tem permissão `repo`
2. Crie um novo token
3. Use o novo token

### Erro: "Authentication failed"

**Causa**: Usando senha em vez de token

**Solução**: Use Personal Access Token, não sua senha do GitHub

### Erro: "Repository not found"

**Causa**: Repositório não existe ou você não tem acesso

**Solução**:
1. Verifique se o repositório existe: https://github.com/tylaig4-source/hr-automation-suite
2. Verifique se você tem permissão de escrita

### Limpar Credenciais Salvas

```bash
# Limpar cache de credenciais
git credential-cache exit

# Remover credenciais salvas
rm ~/.git-credentials

# Ou editar manualmente
nano ~/.git-credentials
```

---

## 📝 Resumo Rápido

1. **Criar token**: https://github.com/settings/tokens
2. **Permissões**: Marque `repo` (todas)
3. **Copiar token**: Salve em local seguro
4. **Usar token**: Como senha quando pedir, ou na URL

---

## ✅ Comandos Finais

```bash
# Verificar remote
git remote -v

# Fazer push (vai pedir credenciais)
git push -u origin main
# Username: tylaig4-source
# Password: [COLE SEU TOKEN AQUI]
```

---

**🎉 Depois do push bem-sucedido, seu código estará no GitHub!**

