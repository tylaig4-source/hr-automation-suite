# 🔐 TEMPLATE DE VARIÁVEIS DE AMBIENTE

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# ===========================================
# HR AUTOMATION SUITE - Variáveis de Ambiente
# ===========================================

# --------------------------------------------
# DATABASE (PostgreSQL)
# --------------------------------------------
# Para Docker local (padrão):
DATABASE_URL="postgresql://hr_user:hr_secret_2024@localhost:5432/hr_automation?schema=public"

# Para produção, use a URL do seu serviço PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# --------------------------------------------
# REDIS (Cache e Rate Limiting)
# --------------------------------------------
# Para Docker local (padrão):
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="redis_secret_2024"

# Para produção (Upstash, Redis Cloud, etc.):
# REDIS_URL="redis://default:senha@host:porta"

# --------------------------------------------
# AUTENTICAÇÃO (NextAuth.js)
# --------------------------------------------
# URL da aplicação
NEXTAUTH_URL="http://localhost:3000"
# Para produção: NEXTAUTH_URL="https://seu-dominio.com"

# Chave secreta - Gere com: openssl rand -base64 32
NEXTAUTH_SECRET="gere-uma-chave-secreta-segura-aqui"

# --------------------------------------------
# IA (Configure pelo menos um)
# --------------------------------------------
# OpenAI API Key: https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."

# Google Gemini API Key: https://aistudio.google.com/apikey
GEMINI_API_KEY="..."

# --------------------------------------------
# GOOGLE OAUTH (Opcional)
# --------------------------------------------
# Para login com Google: https://console.cloud.google.com/
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."

# --------------------------------------------
# APLICAÇÃO
# --------------------------------------------
NODE_ENV="development"
APP_URL="http://localhost:3000"

# --------------------------------------------
# RATE LIMITING (Opcional)
# --------------------------------------------
RATE_LIMIT_REQUESTS_PER_MINUTE=30
MAX_TOKENS_PER_REQUEST=4000
```

## 📋 Checklist de Configuração

### Obrigatório
- [ ] PostgreSQL instalado e rodando (ou Docker)
- [ ] Redis instalado e rodando (ou Docker) - Opcional mas recomendado
- [ ] Banco de dados criado: `hr_automation`
- [ ] Chave da OpenAI ou Google Gemini obtida
- [ ] `NEXTAUTH_SECRET` gerado com `openssl rand -base64 32`

### Opcional
- [ ] Google OAuth configurado (para login social)
- [ ] Variáveis de rate limiting customizadas

## 🚀 Quick Setup

```bash
# 1. Copie o template
cp ENV_TEMPLATE.md .env.local

# 2. Edite .env.local e adicione suas credenciais

# 3. Gere NEXTAUTH_SECRET
openssl rand -base64 32

# 4. Configure suas API keys
# - OpenAI: https://platform.openai.com/api-keys
# - Gemini: https://aistudio.google.com/apikey
```

## 📚 Mais Informações

- Veja [docs/DOCKER.md](./docs/DOCKER.md) para configuração com Docker
- Veja [docs/DEPLOY_VERCEL.md](./docs/DEPLOY_VERCEL.md) para deploy em produção

