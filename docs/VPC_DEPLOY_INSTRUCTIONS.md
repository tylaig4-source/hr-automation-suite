# 🚀 Instruções para Atualizar na VPC

## 📋 Pré-requisitos

1. Acesso SSH ao servidor da VPC
2. Git configurado no servidor
3. Permissões para fazer deploy

## 🔄 Processo de Atualização

### 1. Conectar ao Servidor

```bash
# Conectar via SSH
ssh usuario@ip-do-servidor

# Ou se usar chave SSH
ssh -i ~/.ssh/sua-chave.pem usuario@ip-do-servidor
```

### 2. Navegar para o Diretório do Projeto

```bash
# Ajuste o caminho conforme sua configuração
cd /var/www/hr-automation-suite
# ou
cd /home/usuario/app
```

### 3. Verificar Status Atual

```bash
# Ver branch atual
git branch

# Ver status
git status

# Ver últimas mudanças
git log --oneline -5
```

### 4. Atualizar Código do Repositório

```bash
# Buscar todas as branches e atualizações
git fetch origin

# Mudar para branch main (ou master)
git checkout main

# Atualizar código local
git pull origin main
```

### 5. Instalar/Atualizar Dependências

```bash
# Instalar novas dependências (se houver)
npm install

# Ou se usar yarn
yarn install
```

### 6. Executar Migrações do Banco de Dados

```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar migrações (se houver)
npx prisma migrate deploy

# Ou se usar db push
npx prisma db push
```

### 7. Build da Aplicação

```bash
# Build de produção
npm run build

# Verificar se build foi bem-sucedido
echo $?
# Deve retornar 0 se sucesso
```

### 8. Reiniciar Serviços

#### Se usar PM2:

```bash
# Reiniciar aplicação
pm2 restart hr-automation-suite

# Ou se não souber o nome
pm2 list
pm2 restart all

# Ver logs
pm2 logs hr-automation-suite
```

#### Se usar systemd:

```bash
# Reiniciar serviço
sudo systemctl restart hr-automation-suite

# Ver status
sudo systemctl status hr-automation-suite

# Ver logs
sudo journalctl -u hr-automation-suite -f
```

#### Se usar Docker:

```bash
# Rebuild e restart
docker-compose down
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

### 9. Verificar Aplicação

```bash
# Verificar se aplicação está rodando
curl http://localhost:3000/api/health

# Ou acessar no navegador
# https://seu-dominio.com
```

## 🔧 Configurações Específicas desta PR

### 1. Variáveis de Ambiente

Verifique se as seguintes variáveis estão configuradas:

```bash
# Stripe (já deve estar configurado)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URL da aplicação (para redirects do Stripe)
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

### 2. Webhook do Stripe

Verifique se o webhook está configurado no Stripe Dashboard:
- URL: `https://seu-dominio.com/api/stripe/webhook`
- Eventos: `checkout.session.completed`, `payment_intent.*`, `invoice.*`, `customer.subscription.*`

### 3. Configurar Preços dos Modelos (Opcional)

1. Acesse `/admin/settings` no painel admin
2. Vá para "Preços dos Modelos de IA"
3. Os valores padrão já estão configurados com preços reais de 2024
4. Ajuste se necessário

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
```

### Erro: "Database connection failed"

```bash
# Verificar variável DATABASE_URL
echo $DATABASE_URL

# Testar conexão
npx prisma db pull
```

### Aplicação não inicia

```bash
# Ver logs detalhados
pm2 logs --lines 100
# ou
sudo journalctl -u hr-automation-suite -n 100

# Verificar portas
netstat -tulpn | grep 3000
```

### Build falha

```bash
# Limpar cache do Next.js
rm -rf .next
npm run build
```

## 📝 Checklist Pós-Deploy

- [ ] Aplicação está rodando
- [ ] Build foi bem-sucedido
- [ ] Migrações aplicadas
- [ ] Webhook do Stripe configurado
- [ ] Testar checkout com Stripe
- [ ] Verificar widget de tokens no dashboard
- [ ] Verificar configuração de preços no admin
- [ ] Logs sem erros críticos

## 🔄 Rollback (Se Necessário)

Se algo der errado, você pode fazer rollback:

```bash
# Ver commits anteriores
git log --oneline -10

# Voltar para commit anterior
git checkout <hash-do-commit-anterior>

# Rebuild
npm run build

# Restart
pm2 restart hr-automation-suite
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs
2. Verifique variáveis de ambiente
3. Verifique conexão com banco de dados
4. Verifique configuração do Stripe

## 🎯 Comandos Rápidos (Copy & Paste)

```bash
# Atualização completa
cd /var/www/hr-automation-suite && \
git fetch origin && \
git checkout main && \
git pull origin main && \
npm install && \
npx prisma generate && \
npm run build && \
pm2 restart hr-automation-suite && \
pm2 logs hr-automation-suite --lines 50
```

