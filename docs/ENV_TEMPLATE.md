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

# Modelo OpenAI (opcional, padrão: gpt-4-turbo-preview)
# Exemplos: gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo
OPENAI_MODEL="gpt-4-turbo-preview"

# Google Gemini API Key: https://aistudio.google.com/apikey
GEMINI_API_KEY="..."

# Modelo Gemini (opcional, padrão: gemini-1.5-flash)
# Exemplos: gemini-pro, gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp, gemini-3-pro-preview
GEMINI_MODEL="gemini-1.5-flash"

# --------------------------------------------
# PAGAMENTOS (Stripe)
# --------------------------------------------
# Chave secreta do Stripe: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_..."

# Chave publicável do Stripe: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Secret do webhook: Configure no Dashboard do Stripe
# Desenvolvedores → Webhooks → Adicionar endpoint → Copiar Signing secret
STRIPE_WEBHOOK_SECRET="whsec_..."

# --------------------------------------------
# GOOGLE OAUTH (Opcional)
# --------------------------------------------
# Para login com Google: https://console.cloud.google.com/
# GOOGLE_CLIENT_ID="..."
# GOOGLE_CLIENT_SECRET="..."

# --------------------------------------------
# CRIPTOGRAFIA (Obrigatório para Stripe via Frontend)
# --------------------------------------------
# Chave de criptografia para dados sensíveis (Stripe keys, etc.)
# Gere com: openssl rand -hex 32
# IMPORTANTE: Mantenha a mesma chave entre restarts ou dados criptografados não poderão ser descriptografados
ENCRYPTION_KEY="sua-chave-de-64-caracteres-hexadecimais-aqui"

# --------------------------------------------
# APLICAÇÃO
# --------------------------------------------
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# --------------------------------------------
# RATE LIMITING (Opcional)
# --------------------------------------------
RATE_LIMIT_REQUESTS_PER_MINUTE=30
MAX_TOKENS_PER_REQUEST=4000

# --------------------------------------------
# SEGURANÇA DE ASSINATURAS (Opcional)
# --------------------------------------------
# Taxa de validação de assinaturas com Stripe (0.0 a 1.0)
# 1.0 = sempre validar (máxima segurança, mais lento)
# 0.1 = validar 10% das vezes (mais rápido, menos seguro)
# Padrão: 1.0 (sempre validar)
SUBSCRIPTION_VALIDATION_RATE=1.0
```

## 📋 Checklist de Configuração

### Obrigatório
- [ ] PostgreSQL instalado e rodando (ou Docker)
- [ ] Redis instalado e rodando (ou Docker) - Opcional mas recomendado
- [ ] Banco de dados criado: `hr_automation`
- [ ] Chave da OpenAI ou Google Gemini obtida
- [ ] `NEXTAUTH_SECRET` gerado com `openssl rand -base64 32`
- [ ] Chaves do Stripe configuradas (para pagamentos)

### Opcional
- [ ] Google OAuth configurado (para login social)
- [ ] Webhook do Stripe configurado (para eventos de pagamento)
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
# - Stripe: https://dashboard.stripe.com/apikeys
#   - Copie a Secret key (sk_test_...)
#   - Copie a Publishable key (pk_test_...)
#   - Configure webhook: https://dashboard.stripe.com/webhooks
```

## 📚 Mais Informações

- Veja [docs/DOCKER.md](./docs/DOCKER.md) para configuração com Docker
- Veja [docs/DEPLOY_VERCEL.md](./docs/DEPLOY_VERCEL.md) para deploy em produção

