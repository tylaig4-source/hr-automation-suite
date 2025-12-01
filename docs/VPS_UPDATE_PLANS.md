# Atualização VPS - Sistema de Planos e Stripe

## 📋 Resumo das Alterações

### ✅ Correções Implementadas

1. **Sistema de Planos Baseado em Banco de Dados**
   - Removidos todos os dados hardcoded de planos
   - Planos agora são buscados do banco de dados (`prisma.plan`)
   - Preços e features são dinâmicos

2. **API de Subscriptions Corrigida**
   - Usa planos do banco ao invés de `PLAN_PRICES` hardcoded
   - Valida se `stripePriceIdMonthly`/`stripePriceIdYearly` existem
   - Erro claro se planos não estiverem sincronizados com Stripe

3. **Checkout Modal Atualizado**
   - Recebe planos do banco via props
   - Calcula preços dinamicamente
   - Suporta planos customizados

4. **Página de Planos**
   - Busca planos ativos do banco
   - Exibe dinamicamente com features e preços
   - Tabela de comparação calculada automaticamente

5. **Configuração Stripe via Frontend**
   - Chaves do Stripe podem ser configuradas no painel admin
   - Armazenadas criptografadas no banco
   - Não precisa mais de variáveis de ambiente

6. **Sincronização de Planos com Stripe**
   - Botão "Sincronizar com Stripe" no admin
   - Cria produtos e prices automaticamente
   - Salva IDs no banco

## 🚀 Comandos para Atualizar na VPS

### 1. Conectar na VPS

```bash
ssh seu-usuario@seu-ip-ou-dominio
```

### 2. Navegar para o diretório do projeto

```bash
cd /caminho/para/seu/projeto
# Exemplo: cd ~/hr-automation-suite
```

### 3. Fazer backup (recomendado)

```bash
# Backup do banco de dados
pg_dump hr_automation > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup do código atual
cp -r . ../backup_$(date +%Y%m%d_%H%M%S)
```

### 4. Atualizar código do repositório

```bash
# Verificar branch atual
git branch

# Se estiver em main, fazer pull
git pull origin main

# OU se estiver em outra branch, fazer merge
git checkout main
git pull origin main
git merge sua-branch
```

### 5. Instalar dependências (se necessário)

```bash
npm install
```

### 6. Aplicar migrations do banco

```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar migrations (se houver novas)
npx prisma migrate deploy

# OU se não usar migrations, usar db push
npx prisma db push
```

### 7. Verificar variáveis de ambiente

```bash
# Verificar se .env está configurado
cat .env | grep -E "DATABASE_URL|NEXTAUTH|STRIPE|ENCRYPTION"

# Se precisar adicionar ENCRYPTION_KEY (opcional)
# echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env
```

### 8. Fazer build

```bash
npm run build
```

### 9. Reiniciar aplicação (PM2)

```bash
# Ver processos rodando
pm2 list

# Reiniciar aplicação
pm2 restart hr-automation

# OU se não tiver nome específico
pm2 restart all

# Ver logs
pm2 logs hr-automation --lines 50
```

### 10. Verificar se está funcionando

```bash
# Verificar status
pm2 status

# Verificar logs de erro
pm2 logs hr-automation --err --lines 20

# Testar endpoint
curl http://localhost:3000/api/health
```

## 📝 Passos Pós-Deploy

### 1. Sincronizar Planos com Stripe

1. Acesse o painel admin: `https://seu-dominio.com/admin/plans`
2. Clique em **"Sincronizar com Stripe"**
3. Aguarde a conclusão
4. Verifique se os IDs foram salvos nos planos

### 2. Configurar Chaves do Stripe (se ainda não configurado)

1. Acesse: `https://seu-dominio.com/admin/settings`
2. Na seção "Integração Stripe":
   - Cole a **Chave Secreta** (Secret Key)
   - Cole a **Chave Pública** (Publishable Key)
   - Opcional: Cole o **Webhook Secret**
3. Clique em **"Salvar Configurações"**
4. Clique em **"Testar Conexão"** para verificar

### 3. Verificar Planos no Banco

```bash
# Conectar ao banco
psql hr_automation

# Ver planos
SELECT "planId", name, "monthlyPrice", "yearlyPrice", "stripePriceIdMonthly", "stripePriceIdYearly" FROM "Plan" WHERE "isActive" = true;

# Sair
\q
```

## ⚠️ Troubleshooting

### Erro: "Price ID do Stripe não configurado"

**Solução**: Sincronize os planos com o Stripe primeiro:
1. Vá em `/admin/plans`
2. Clique em "Sincronizar com Stripe"

### Erro: "Stripe não está configurado"

**Solução**: Configure as chaves do Stripe:
1. Vá em `/admin/settings`
2. Configure as chaves do Stripe
3. Salve e teste a conexão

### Erro: "Plano não encontrado"

**Solução**: Execute o seed do banco:
```bash
npm run db:seed
```

### Build falha

**Solução**: Verifique se todas as dependências estão instaladas:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Aplicação não inicia

**Solução**: Verifique logs e variáveis de ambiente:
```bash
pm2 logs hr-automation --lines 100
cat .env
```

## 📊 Checklist de Verificação

- [ ] Build passou sem erros
- [ ] Migrations aplicadas
- [ ] Aplicação reiniciada
- [ ] Planos sincronizados com Stripe
- [ ] Chaves do Stripe configuradas
- [ ] Teste de conexão Stripe passou
- [ ] Página de planos carrega corretamente
- [ ] Checkout funciona
- [ ] Webhooks do Stripe configurados

## 🔗 Links Úteis

- Admin Planos: `/admin/plans`
- Admin Settings: `/admin/settings`
- Dashboard Planos: `/dashboard/plans`
- Stripe Dashboard: https://dashboard.stripe.com

