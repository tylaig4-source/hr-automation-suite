# 🔄 Atualizar Aplicação na VPS

Guia rápido para atualizar a aplicação após fazer `git pull` na VPS.

## ⚠️ Importante

**PM2 NÃO atualiza automaticamente!** Após `git pull`, você precisa:

1. ✅ Instalar novas dependências (se houver)
2. ✅ Executar migrações do banco (se houver)
3. ✅ Fazer rebuild da aplicação
4. ✅ Reiniciar o PM2

---

## 📝 Passo a Passo Completo

### 1. Fazer Pull das Atualizações

```bash
cd /var/www/hr-automation-suite
git pull origin feat/migrate-to-stripe
# ou
git pull origin main
```

### 2. Instalar Novas Dependências (se houver)

```bash
npm install
```

**Quando fazer:**
- Se o `package.json` ou `package-lock.json` mudou
- Se aparecerem erros de módulos não encontrados

### 3. Executar Migrações do Banco (se houver)

```bash
npm run db:push
# ou
npx prisma migrate deploy
```

**Quando fazer:**
- Se o `prisma/schema.prisma` mudou
- Se houver novas tabelas ou campos

### 4. Fazer Rebuild da Aplicação

```bash
npm run build
```

**⚠️ OBRIGATÓRIO:** Sempre fazer rebuild após mudanças no código!

### 5. Reiniciar PM2

```bash
pm2 restart hr-automation-suite
```

**Ou se preferir parar e iniciar:**

```bash
pm2 stop hr-automation-suite
pm2 start hr-automation-suite
```

### 6. Verificar se Está Funcionando

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs hr-automation-suite --lines 50

# Testar aplicação
curl http://localhost:3000
```

---

## 🚀 Script de Atualização Rápida

Crie um script para automatizar o processo:

```bash
nano /var/www/hr-automation-suite/update.sh
```

Cole este conteúdo:

```bash
#!/bin/bash

echo "🔄 Atualizando aplicação..."

cd /var/www/hr-automation-suite

# 1. Pull
echo "📥 Fazendo pull..."
git pull origin feat/migrate-to-stripe

# 2. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 3. Migrações (se necessário)
echo "🗄️ Executando migrações..."
npm run db:push

# 4. Build
echo "🏗️ Fazendo build..."
npm run build

# 5. Reiniciar PM2
echo "🔄 Reiniciando PM2..."
pm2 restart hr-automation-suite

# 6. Verificar
echo "✅ Verificando status..."
pm2 status

echo "✨ Atualização concluída!"
```

Tornar executável:

```bash
chmod +x /var/www/hr-automation-suite/update.sh
```

**Usar:**

```bash
/var/www/hr-automation-suite/update.sh
```

---

## 📋 Comandos Resumidos

```bash
cd /var/www/hr-automation-suite
git pull origin feat/migrate-to-stripe
npm install
npm run db:push
npm run build
pm2 restart hr-automation-suite
pm2 logs hr-automation-suite --lines 50
```

---

## 🐛 Troubleshooting

### Build falha

```bash
# Limpar cache
rm -rf .next node_modules

# Reinstalar
npm install

# Tentar build novamente
npm run build
```

### PM2 não reinicia

```bash
# Ver se está rodando
pm2 status

# Se não estiver, iniciar
pm2 start ecosystem.config.js

# Ver logs de erro
pm2 logs hr-automation-suite --err
```

### Erro de migração

```bash
# Verificar se banco está rodando
docker ps | grep postgres

# Verificar variável DATABASE_URL
cat .env.local | grep DATABASE_URL

# Tentar migração novamente
npm run db:push
```

### Aplicação não responde

```bash
# Verificar logs
pm2 logs hr-automation-suite --lines 100

# Verificar porta
sudo netstat -tulpn | grep 3000

# Reiniciar completamente
pm2 delete hr-automation-suite
pm2 start ecosystem.config.js
```

---

## 💡 Dicas

1. **Sempre verificar logs após atualização:**
   ```bash
   pm2 logs hr-automation-suite --lines 50
   ```

2. **Fazer backup antes de atualizar (opcional):**
   ```bash
   # Backup do código
   cp -r /var/www/hr-automation-suite /var/www/hr-automation-suite.backup
   
   # Backup do banco (se necessário)
   docker exec postgres-hr pg_dump -U postgres hr_suite > backup.sql
   ```

3. **Atualizar em horário de baixo tráfego** (se possível)

4. **Testar localmente antes** de atualizar em produção

---

## ⚡ Atualização Rápida (Sem Migrações)

Se você tem certeza que não há mudanças no banco:

```bash
cd /var/www/hr-automation-suite
git pull
npm run build
pm2 restart hr-automation-suite
```

---

## 🔄 PM2 Auto-Restart

O PM2 pode ser configurado para reiniciar automaticamente em caso de erro, mas **NÃO reinicia automaticamente após mudanças no código**. Você sempre precisa fazer rebuild e restart manualmente após `git pull`.

Para configurar auto-restart em caso de erro (já está no `ecosystem.config.js`):

```javascript
autorestart: true,  // Reinicia se a aplicação crashar
```

Mas isso **não** detecta mudanças no código - apenas reinicia se houver erro.

