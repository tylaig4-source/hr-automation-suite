# 🐳 Docker - HR Automation Suite

Este documento explica como configurar e usar o Docker para desenvolvimento local.

## 📦 Serviços Incluídos

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| **PostgreSQL 16** | 5432 | Banco de dados principal |
| **Redis 7** | 6379 | Cache e filas de mensagens |
| **pgAdmin** | 5050 | UI para PostgreSQL (dev) |
| **Redis Commander** | 8081 | UI para Redis (dev) |

## 🚀 Quick Start

### Opção 1: Makefile (Recomendado)

```bash
# Setup completo (instala deps, sobe docker, configura banco)
make quickstart
```

### Opção 2: Comandos manuais

```bash
# 1. Subir containers
docker-compose up -d

# 2. Verificar se estão rodando
docker-compose ps

# 3. Configurar banco de dados
npm run db:push
npm run db:seed
```

## 📋 Comandos Docker

### Básicos

```bash
# Subir containers (postgres + redis)
make docker-up
# ou
docker-compose up -d

# Parar containers
make docker-down
# ou
docker-compose down

# Ver logs
make docker-logs
# ou
docker-compose logs -f
```

### Com UIs de Administração (dev)

```bash
# Subir com pgAdmin e Redis Commander
make docker-dev
# ou
docker-compose --profile dev up -d
```

Acesse:
- **pgAdmin**: http://localhost:5050
  - Email: `admin@hrautomation.com`
  - Senha: `admin123`
- **Redis Commander**: http://localhost:8081

### Reset Completo

```bash
# Apaga todos os dados e recria containers
make docker-reset
# ou
docker-compose down -v && docker-compose up -d
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```env
# Conexão com PostgreSQL Docker
DATABASE_URL="postgresql://hr_user:hr_secret_2024@localhost:5432/hr_automation?schema=public"

# Conexão com Redis Docker
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="redis_secret_2024"

# NextAuth
NEXTAUTH_SECRET="sua_chave_secreta"
NEXTAUTH_URL="http://localhost:3000"

# IA (pelo menos um é necessário)
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."
```

### Ou use o Makefile:

```bash
make env  # Cria .env.local automaticamente
```

## 🔧 Credenciais Padrão

### PostgreSQL
- **Host**: localhost
- **Porta**: 5432
- **Usuário**: hr_user
- **Senha**: hr_secret_2024
- **Database**: hr_automation

### Redis
- **Host**: localhost
- **Porta**: 6379
- **Senha**: redis_secret_2024

## 📊 Acessando os Bancos

### Via Prisma Studio

```bash
make db-studio
# ou
npm run db:studio
```

Acesse: http://localhost:5555

### Via psql (linha de comando)

```bash
docker exec -it hr-postgres psql -U hr_user -d hr_automation
```

### Via redis-cli

```bash
docker exec -it hr-redis redis-cli -a redis_secret_2024
```

## 🔄 Desenvolvimento

### Workflow típico

```bash
# 1. Subir infra
make docker-up

# 2. Iniciar app
make dev

# 3. Quando terminar
make docker-down
```

### Alterações no Schema (Prisma)

```bash
# Após alterar prisma/schema.prisma:
npm run db:push        # Aplica mudanças
npm run db:generate    # Regenera cliente
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs postgres
docker-compose logs redis

# Verificar se portas estão livres
lsof -i :5432
lsof -i :6379
```

### Banco não conecta

1. Verifique se o container está rodando:
   ```bash
   docker-compose ps
   ```

2. Verifique a URL no `.env.local`

3. Teste conexão:
   ```bash
   docker exec -it hr-postgres pg_isready -U hr_user
   ```

### Redis não conecta

```bash
docker exec -it hr-redis redis-cli -a redis_secret_2024 ping
# Deve retornar: PONG
```

### Reset total

```bash
# Remove containers, volumes e imagens
docker-compose down -v --rmi local
docker-compose up -d
npm run db:push
npm run db:seed
```

## 📁 Volumes

Os dados são persistidos nos volumes Docker:

- `postgres_data` - Dados do PostgreSQL
- `redis_data` - Dados do Redis
- `pgadmin_data` - Configurações do pgAdmin

Para listar volumes:
```bash
docker volume ls | grep hr
```

Para limpar volumes (⚠️ apaga dados):
```bash
docker-compose down -v
```

