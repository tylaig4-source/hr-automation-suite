# 🚨 Correção Urgente - Erros 500 nas APIs

## ⚠️ Problema

As rotas `/api/notifications` e `/api/company/usage` estão retornando erro 500 no servidor de produção.

## 🔍 Diagnóstico Rápido

### 1. Acesse o Endpoint de Diagnóstico

Abra no navegador (logado):
```
https://iapararh.meusuper.app/api/debug
```

Isso mostrará:
- Status da sessão
- Status da conexão com banco
- Status dos modelos Prisma
- Erros específicos

### 2. Verificar Logs do Servidor

```bash
# Conectar ao servidor
ssh usuario@ip-do-servidor

# Ver logs de erro
pm2 logs hr-automation-suite --err --lines 50
# ou
sudo journalctl -u hr-automation-suite -p err -n 50
```

Procure por:
- `Erro ao buscar notificações:`
- `Erro ao buscar uso:`
- `Stack trace:`
- `PrismaClient`
- `Cannot find module`

## 🛠️ Solução Imediata

### Passo 1: Atualizar Código no Servidor

```bash
# 1. Conectar ao servidor
ssh usuario@ip-do-servidor

# 2. Ir para diretório
cd ~/hr-automation-suite

# 3. Atualizar código
git fetch origin
git checkout feat/stripe-checkout-and-token-tracking
git pull origin feat/stripe-checkout-and-token-tracking

# 4. Instalar dependências
npm install

# 5. Gerar Prisma Client (IMPORTANTE!)
npx prisma generate

# 6. Build
npm run build

# 7. Reiniciar
pm2 restart hr-automation-suite
```

### Passo 2: Verificar se Funcionou

1. Acesse `/api/debug` e verifique se tudo está OK
2. Teste `/api/notifications` e `/api/company/usage`
3. Verifique logs novamente

## 🔧 Possíveis Causas

### 1. Prisma Client não atualizado

```bash
npx prisma generate
```

### 2. Tabela Notification não existe

```bash
npx prisma db push
# ou
npx prisma migrate deploy
```

### 3. Variáveis de ambiente incorretas

```bash
# Verificar DATABASE_URL
cat .env | grep DATABASE_URL

# Testar conexão
npx prisma db pull
```

### 4. Código não atualizado

```bash
# Verificar último commit
git log --oneline -5

# Verificar se está na branch correta
git branch --show-current
```

## 📊 Endpoint de Diagnóstico

Após atualizar, acesse:
```
https://iapararh.meusuper.app/api/debug
```

Isso retornará um JSON com:
- Status da sessão
- Status do banco de dados
- Status dos modelos Prisma
- Erros específicos (se houver)

## 🎯 Checklist de Verificação

- [ ] Código atualizado no servidor
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Build realizado (`npm run build`)
- [ ] Aplicação reiniciada
- [ ] Endpoint `/api/debug` acessível
- [ ] Logs verificados
- [ ] Erros 500 resolvidos

## 📞 Se Ainda Não Funcionar

1. **Copie os logs de erro** do servidor
2. **Acesse `/api/debug`** e copie o JSON retornado
3. **Envie essas informações** para análise

Os logs devem mostrar exatamente qual é o problema.


