# 🐛 Debug de Erros 500 nas APIs

## Erros Identificados

1. `/api/notifications` - 500 Internal Server Error
2. `/api/company/usage` - 500 Internal Server Error

## 🔍 Como Verificar os Logs no Servidor

### 1. Ver Logs do PM2

```bash
# Ver logs em tempo real
pm2 logs hr-automation-suite --lines 100

# Ver apenas erros
pm2 logs hr-automation-suite --err --lines 50
```

### 2. Ver Logs do Systemd

```bash
# Ver logs do serviço
sudo journalctl -u hr-automation-suite -n 100 -f

# Ver apenas erros
sudo journalctl -u hr-automation-suite -p err -n 50
```

### 3. Ver Logs do Docker

```bash
# Ver logs do container
docker-compose logs -f app

# Ver apenas erros
docker-compose logs app 2>&1 | grep -i error
```

## 🔧 Comandos de Diagnóstico

### Verificar se Prisma está funcionando

```bash
# No servidor, execute:
cd ~/hr-automation-suite
npx prisma db pull
npx prisma generate
```

### Testar conexão com banco

```bash
# Verificar variável de ambiente
echo $DATABASE_URL

# Testar conexão
npx prisma db execute --stdin <<< "SELECT 1"
```

### Verificar se tabelas existem

```bash
# Conectar ao banco e verificar tabelas
npx prisma studio
# Ou via SQL direto
psql $DATABASE_URL -c "\dt"
```

## 🛠️ Correções Aplicadas

### 1. `/api/notifications`
- ✅ Adicionado `export const dynamic = 'force-dynamic'`
- ✅ Validação de `session.user.id`
- ✅ Tratamento de erros melhorado
- ✅ Retorno seguro de arrays vazios

### 2. `/api/company/usage`
- ✅ Validação de `session.user.id`
- ✅ Proteção contra divisão por zero
- ✅ Validação de valores NaN
- ✅ Retorno seguro quando não há empresa
- ✅ Tratamento de valores null/undefined

## 📝 Checklist de Verificação

Execute no servidor:

```bash
# 1. Verificar se código foi atualizado
cd ~/hr-automation-suite
git log --oneline -5

# 2. Verificar se build foi feito
ls -la .next

# 3. Verificar logs de erro
pm2 logs hr-automation-suite --err --lines 20

# 4. Testar endpoint manualmente
curl -H "Cookie: $(cat cookie.txt)" https://iapararh.meusuper.app/api/notifications
```

## 🚨 Se Erro Persistir

### Verificar Erro Específico

1. **Acesse os logs do servidor** e procure por:
   - `Erro ao buscar notificações:`
   - `Erro ao buscar uso:`
   - `Stack trace:`

2. **Verifique se Prisma Client está atualizado:**
   ```bash
   npx prisma generate
   ```

3. **Verifique se banco está acessível:**
   ```bash
   npx prisma db pull
   ```

4. **Verifique variáveis de ambiente:**
   ```bash
   cat .env | grep DATABASE_URL
   ```

## 🔄 Deploy das Correções

```bash
# 1. Atualizar código
git pull origin main

# 2. Instalar dependências
npm install

# 3. Gerar Prisma Client
npx prisma generate

# 4. Build
npm run build

# 5. Reiniciar
pm2 restart hr-automation-suite
```

## 📊 Monitoramento

Após deploy, monitore os logs:

```bash
# Monitorar em tempo real
pm2 logs hr-automation-suite --lines 0

# Verificar se erros pararam
pm2 logs hr-automation-suite --err | tail -20
```

