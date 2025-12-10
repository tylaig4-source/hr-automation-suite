# 🔍 Como Verificar Logs do Servidor para Debug

## 🚨 Problema: Erros 500 nas APIs

As rotas `/api/notifications` e `/api/company/usage` estão retornando erro 500.

## 📋 Passos para Diagnosticar

### 1. Conectar ao Servidor

```bash
ssh usuario@ip-do-servidor
# ou
ssh -i ~/.ssh/sua-chave.pem usuario@ip-do-servidor
```

### 2. Ver Logs do PM2 (Se usar PM2)

```bash
# Ver todos os logs
pm2 logs hr-automation-suite --lines 100

# Ver apenas erros
pm2 logs hr-automation-suite --err --lines 50

# Ver logs em tempo real
pm2 logs hr-automation-suite --lines 0
```

### 3. Ver Logs do Systemd (Se usar systemd)

```bash
# Ver logs recentes
sudo journalctl -u hr-automation-suite -n 100

# Ver logs em tempo real
sudo journalctl -u hr-automation-suite -f

# Ver apenas erros
sudo journalctl -u hr-automation-suite -p err -n 50
```

### 4. Ver Logs do Docker (Se usar Docker)

```bash
# Ver logs do container
docker-compose logs app --tail 100

# Ver logs em tempo real
docker-compose logs -f app

# Ver apenas erros
docker-compose logs app 2>&1 | grep -i error
```

## 🔍 O Que Procurar nos Logs

Procure por estas mensagens:

```
Erro ao buscar notificações:
Erro ao buscar uso:
Stack trace:
PrismaClient
Cannot find module
```

## 🛠️ Comandos Rápidos de Diagnóstico

```bash
# 1. Verificar se aplicação está rodando
pm2 list
# ou
sudo systemctl status hr-automation-suite
# ou
docker-compose ps

# 2. Verificar última atualização do código
cd ~/hr-automation-suite
git log --oneline -5

# 3. Verificar se Prisma está atualizado
npx prisma generate

# 4. Testar conexão com banco
npx prisma db pull

# 5. Ver variáveis de ambiente
cat .env | grep -E "(DATABASE_URL|NEXTAUTH)"
```

## 🔄 Aplicar Correções

Se os logs mostrarem que o código não foi atualizado:

```bash
# 1. Ir para diretório
cd ~/hr-automation-suite

# 2. Atualizar código
git fetch origin
git checkout feat/stripe-checkout-and-token-tracking
git pull origin feat/stripe-checkout-and-token-tracking

# 3. Instalar dependências
npm install

# 4. Gerar Prisma Client
npx prisma generate

# 5. Build
npm run build

# 6. Reiniciar
pm2 restart hr-automation-suite
# ou
sudo systemctl restart hr-automation-suite
# ou
docker-compose restart
```

## 📊 Testar Após Deploy

```bash
# Testar endpoint de notificações
curl -X GET https://iapararh.meusuper.app/api/notifications \
  -H "Cookie: seu-cookie-aqui" \
  -v

# Testar endpoint de usage
curl -X GET https://iapararh.meusuper.app/api/company/usage \
  -H "Cookie: seu-cookie-aqui" \
  -v
```

## 🎯 Próximos Passos

1. **Conecte ao servidor** e execute os comandos acima
2. **Copie os logs de erro** e me envie
3. **Aplique as correções** se o código não estiver atualizado
4. **Teste novamente** e verifique se os erros pararam

