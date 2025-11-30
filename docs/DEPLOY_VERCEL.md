# 🚀 Deploy na Vercel - HR Automation Suite

Este guia explica como fazer o deploy da aplicação na Vercel.

## ✅ Compatibilidade

**Sim, a aplicação pode ser instalada na Vercel!** 

A Vercel suporta nativamente aplicações Next.js, que é o framework usado neste projeto. No entanto, você precisará configurar serviços externos para PostgreSQL e Redis, já que a Vercel não oferece esses serviços diretamente.

---

## 📋 Pré-requisitos

### 1. Conta na Vercel
- Crie uma conta em [vercel.com](https://vercel.com)
- Conecte sua conta GitHub/GitLab/Bitbucket

### 2. Banco de Dados PostgreSQL (Escolha uma opção)

#### Opção A: Vercel Postgres (Recomendado - Integração nativa)
- Acesse o dashboard da Vercel
- Vá em **Storage** → **Create Database** → **Postgres**
- Copie a `DATABASE_URL` gerada

#### Opção B: Supabase (Gratuito até 500MB)
- Crie conta em [supabase.com](https://supabase.com)
- Crie um novo projeto
- Vá em **Settings** → **Database** → copie a connection string

#### Opção C: Neon (Gratuito até 3GB)
- Crie conta em [neon.tech](https://neon.tech)
- Crie um novo projeto
- Copie a connection string

#### Opção D: Railway (Gratuito até $5/mês)
- Crie conta em [railway.app](https://railway.app)
- Crie um novo projeto PostgreSQL
- Copie a connection string

### 3. Redis (Escolha uma opção)

#### Opção A: Upstash Redis (Recomendado - Integração com Vercel)
- Acesse [upstash.com](https://upstash.com)
- Crie uma conta e um novo Redis database
- Copie a `REDIS_URL` (formato: `redis://default:senha@host:porta`)

#### Opção B: Redis Cloud (Gratuito até 30MB)
- Crie conta em [redis.com/cloud](https://redis.com/cloud)
- Crie um novo database
- Copie a connection string

---

## 🔧 Configuração do Projeto

### 1. Preparar o Repositório

Certifique-se de que seu código está no GitHub/GitLab/Bitbucket:

```bash
git add .
git commit -m "Preparar para deploy na Vercel"
git push origin main
```

### 2. Configurar Prisma para Produção

O Prisma precisa gerar o cliente durante o build. A Vercel faz isso automaticamente, mas você pode adicionar um script de postinstall:

```json
// package.json (já deve estar configurado)
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 3. Criar arquivo `.vercelignore` (opcional)

Crie um arquivo `.vercelignore` na raiz para excluir arquivos desnecessários:

```
.env.local
.env*.local
node_modules
.next
.DS_Store
*.log
docker-compose.yml
docker-podman.sh
Makefile
```

---

## 🚀 Deploy na Vercel

### Método 1: Via Dashboard (Recomendado)

1. **Acesse [vercel.com/new](https://vercel.com/new)**

2. **Importe seu repositório**
   - Conecte seu GitHub/GitLab/Bitbucket
   - Selecione o repositório do projeto
   - Clique em **Import**

3. **Configure o projeto**
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)
   - **Install Command**: `npm install` (padrão)

4. **Configure as Variáveis de Ambiente**

   Clique em **Environment Variables** e adicione:

   ```env
   # ===========================================
   # OBRIGATÓRIAS
   # ===========================================
   
   # Database (use a URL do seu serviço PostgreSQL)
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   
   # NextAuth
   NEXTAUTH_URL=https://seu-projeto.vercel.app
   NEXTAUTH_SECRET=gerar_com_openssl_rand_base64_32
   
   # ===========================================
   # REDIS (Opcional mas recomendado)
   # ===========================================
   REDIS_URL=redis://default:senha@host:porta
   REDIS_PASSWORD=senha_do_redis
   
   # ===========================================
   # IA (Pelo menos uma é necessária)
   # ===========================================
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=...
   
   # ===========================================
   # OPCIONAIS
   # ===========================================
   NODE_ENV=production
   APP_URL=https://seu-projeto.vercel.app
   RATE_LIMIT_REQUESTS_PER_MINUTE=30
   MAX_TOKENS_PER_REQUEST=4000
   ```

   **⚠️ Importante:**
   - Marque todas como **Production**, **Preview** e **Development**
   - Para `NEXTAUTH_SECRET`, gere uma nova chave:
     ```bash
     openssl rand -base64 32
     ```

5. **Deploy**
   - Clique em **Deploy**
   - Aguarde o build (pode levar 2-5 minutos)
   - A Vercel executará automaticamente:
     - `npm install`
     - `prisma generate`
     - `npm run build`

6. **Configurar Banco de Dados**
   - Após o primeiro deploy, você precisa executar as migrações
   - Acesse o terminal da Vercel ou use o CLI:

   ```bash
   # Instalar Vercel CLI
   npm i -g vercel
   
   # Fazer login
   vercel login
   
   # Linkar projeto
   vercel link
   
   # Executar migrações
   vercel env pull .env.local
   npx prisma migrate deploy
   # ou
   npx prisma db push
   ```

   **Alternativa:** Use o Prisma Studio ou um cliente SQL para executar o schema manualmente.

### Método 2: Via CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer login
vercel login

# 3. Deploy
vercel

# 4. Configurar variáveis de ambiente
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add OPENAI_API_KEY
# ... adicione todas as variáveis necessárias

# 5. Deploy de produção
vercel --prod
```

---

## 🔄 Pós-Deploy

### 1. Executar Migrações do Banco

Após o primeiro deploy, você precisa criar as tabelas no banco de dados:

**Opção A: Via Vercel CLI (Recomendado)**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Opção B: Via Prisma Studio**
```bash
vercel env pull .env.local
npx prisma studio
# Execute o schema manualmente
```

**Opção C: Via SQL direto**
- Use um cliente SQL (pgAdmin, DBeaver, etc.)
- Conecte ao seu banco PostgreSQL
- Execute o schema do Prisma

### 2. Popular Dados Iniciais (Opcional)

Se você quiser popular dados iniciais (seed):

```bash
vercel env pull .env.local
npm run db:seed
```

**⚠️ Nota:** O seed pode ser executado apenas uma vez. Se já tiver dados, pule esta etapa.

### 3. Verificar Funcionamento

1. Acesse `https://seu-projeto.vercel.app`
2. Teste o registro/login
3. Teste a execução de um agente
4. Verifique os logs na Vercel Dashboard

---

## 🐛 Troubleshooting

### Erro: "Prisma Client not generated"

**Solução:**
```bash
# Adicione ao package.json
"postinstall": "prisma generate"
```

### Erro: "DATABASE_URL not found"

**Solução:**
- Verifique se a variável está configurada no dashboard da Vercel
- Certifique-se de que está marcada para **Production**
- Refaça o deploy após adicionar

### Erro: "Connection timeout" (Redis)

**Solução:**
- Verifique se o Redis está acessível publicamente
- Se usar Upstash, certifique-se de usar a URL correta
- Redis pode ser opcional - a aplicação funciona sem ele (mas sem cache)

### Erro: "Module not found"

**Solução:**
- Verifique se todas as dependências estão em `dependencies` (não `devDependencies`)
- Execute `npm install` localmente e verifique se há erros

### Build falha

**Solução:**
- Verifique os logs de build na Vercel
- Certifique-se de que `package.json` tem o script `build`
- Verifique se não há imports de arquivos que não existem

---

## 📊 Monitoramento

### Logs
- Acesse **Vercel Dashboard** → **Deployments** → **Functions** → **View Function Logs**

### Analytics
- A Vercel oferece analytics básico no dashboard
- Para analytics avançado, considere integrar Google Analytics ou Vercel Analytics

### Performance
- A Vercel otimiza automaticamente Next.js
- Use **Vercel Speed Insights** para monitorar performance

---

## 🔐 Segurança

### Variáveis Sensíveis
- **Nunca** commite `.env.local` no Git
- Use apenas variáveis de ambiente da Vercel
- Rotacione `NEXTAUTH_SECRET` periodicamente

### HTTPS
- A Vercel fornece HTTPS automaticamente
- Certificados SSL são gerenciados automaticamente

### Rate Limiting
- Configure rate limiting no código (já implementado com Redis)
- Considere usar Vercel Edge Functions para rate limiting adicional

---

## 💰 Custos

### Vercel
- **Hobby (Gratuito)**: Ilimitado para projetos pessoais
  - 100GB bandwidth/mês
  - Deploys ilimitados
  - SSL automático
- **Pro ($20/mês)**: Para projetos comerciais
  - Mais recursos e suporte

### Banco de Dados
- **Vercel Postgres**: $0.20/GB/mês (primeiros 256MB grátis)
- **Supabase**: Gratuito até 500MB
- **Neon**: Gratuito até 3GB
- **Railway**: $5 crédito grátis/mês

### Redis
- **Upstash**: Gratuito até 10K comandos/dia
- **Redis Cloud**: Gratuito até 30MB

---

## 🚀 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Configure domínio customizado (opcional)
2. ✅ Configure CI/CD automático (push → deploy)
3. ✅ Configure monitoramento e alertas
4. ✅ Configure backups do banco de dados
5. ✅ Configure analytics e métricas

---

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Upstash Redis](https://docs.upstash.com/redis)

---

## ✅ Checklist de Deploy

- [ ] Conta na Vercel criada
- [ ] Repositório no GitHub/GitLab
- [ ] PostgreSQL configurado (Vercel/Supabase/Neon)
- [ ] Redis configurado (Upstash/Redis Cloud)
- [ ] Variáveis de ambiente configuradas
- [ ] `NEXTAUTH_SECRET` gerado
- [ ] `NEXTAUTH_URL` configurado com URL da Vercel
- [ ] API Keys de IA configuradas
- [ ] Deploy executado
- [ ] Migrações do banco executadas
- [ ] Seed executado (opcional)
- [ ] Aplicação testada e funcionando

---

**🎉 Pronto! Sua aplicação está no ar!**

Se tiver dúvidas ou problemas, consulte os logs da Vercel ou abra uma issue no repositório.

