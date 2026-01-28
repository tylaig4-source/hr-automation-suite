#!/bin/bash

# ==========================================
# HR AUTOMATION SUITE - Instalador Automático
# ==========================================
# Execute com: chmod +x install.sh && ./install.sh

set -e  # Para na primeira erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Banner
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║          HR AUTOMATION SUITE - Instalador Automático          ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ==========================================
# 1. Verificar Pré-requisitos
# ==========================================
print_step "Verificando pré-requisitos..."

# Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado!"
    print_info "Instale Node.js 20+ em: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versão 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) encontrado"

# npm
if ! command -v npm &> /dev/null; then
    print_error "npm não encontrado!"
    exit 1
fi
print_success "npm $(npm -v) encontrado"

# Docker ou Podman
DOCKER_CMD=""
if command -v docker &> /dev/null; then
    DOCKER_CMD="docker"
    print_success "Docker encontrado: $(docker --version)"
elif command -v podman &> /dev/null; then
    DOCKER_CMD="podman"
    print_success "Podman encontrado: $(podman --version)"
    print_warning "Usando Podman em vez de Docker"
else
    print_error "Docker ou Podman não encontrado!"
    print_info "Instale Docker: https://docs.docker.com/get-docker/"
    print_info "Ou Podman: https://podman.io/getting-started/installation"
    exit 1
fi

# docker-compose ou podman-compose
DOCKER_COMPOSE_CMD=""
if [ "$DOCKER_CMD" = "docker" ]; then
    # Verificar qual versão do docker-compose está disponível
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
        print_success "docker-compose (standalone) encontrado"
    elif docker compose version &> /dev/null 2>&1; then
        DOCKER_COMPOSE_CMD="docker compose"
        print_success "docker compose (plugin) encontrado"
    else
        print_error "docker-compose ou docker compose não encontrado!"
        print_info "Instale com: sudo apt install docker-compose-plugin"
        exit 1
    fi
else
    if ! command -v podman-compose &> /dev/null; then
        print_warning "podman-compose não encontrado, tentando instalar..."
        # Tentar instalar podman-compose
        if command -v pip3 &> /dev/null; then
            pip3 install podman-compose --user 2>/dev/null || true
        fi
    fi
    if command -v podman-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="podman-compose"
        print_success "podman-compose encontrado"
    else
        print_warning "podman-compose não disponível, usando script alternativo"
    fi
fi

# openssl (para gerar NEXTAUTH_SECRET)
if ! command -v openssl &> /dev/null; then
    print_warning "openssl não encontrado, usando método alternativo para gerar secret"
fi

# ==========================================
# 2. Instalar Dependências npm
# ==========================================
print_step "Instalando dependências npm..."

if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado! Execute este script na raiz do projeto."
    exit 1
fi

npm install
print_success "Dependências instaladas"

# ==========================================
# 3. Criar arquivo .env.local
# ==========================================
print_step "Configurando variáveis de ambiente..."

if [ -f ".env.local" ]; then
    print_warning ".env.local já existe, pulando criação"
    read -p "Deseja sobrescrever? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_info "Mantendo .env.local existente"
        SKIP_ENV=true
    else
        SKIP_ENV=false
    fi
else
    SKIP_ENV=false
fi

if [ "$SKIP_ENV" = false ]; then
    # Gerar NEXTAUTH_SECRET
    if command -v openssl &> /dev/null; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
    else
        # Fallback: usar /dev/urandom
        NEXTAUTH_SECRET=$(head -c 32 /dev/urandom | base64 | tr -d '\n')
    fi

    cat > .env.local << EOF
# ===========================================
# HR AUTOMATION SUITE - Variáveis de Ambiente
# Gerado automaticamente em $(date)
# ===========================================

# --------------------------------------------
# DATABASE (PostgreSQL)
# --------------------------------------------
DATABASE_URL="postgresql://hr_user:hr_secret_2024@localhost:5432/hr_automation?schema=public"

# --------------------------------------------
# REDIS (Cache e Rate Limiting)
# --------------------------------------------
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="redis_secret_2024"

# --------------------------------------------
# AUTENTICAÇÃO (NextAuth.js)
# --------------------------------------------
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# --------------------------------------------
# IA (Configure pelo menos um)
# --------------------------------------------
# OpenAI API Key: https://platform.openai.com/api-keys
# OPENAI_API_KEY="sk-..."

# Google Gemini API Key: https://aistudio.google.com/apikey
# GEMINI_API_KEY="..."

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
EOF

    print_success ".env.local criado"
    print_warning "⚠️  IMPORTANTE: Configure suas API keys no arquivo .env.local:"
    print_info "   - OPENAI_API_KEY ou GEMINI_API_KEY (pelo menos uma é necessária)"
fi

# ==========================================
# 4. Verificar se Docker está rodando
# ==========================================
print_step "Verificando Docker/Podman..."

if [ "$DOCKER_CMD" = "docker" ]; then
    if ! docker info &> /dev/null; then
        print_error "Docker não está rodando!"
        print_info "Inicie o Docker e execute este script novamente"
        exit 1
    fi
else
    if ! podman info &> /dev/null; then
        print_error "Podman não está acessível!"
        exit 1
    fi
fi

# ==========================================
# 5. Subir Containers Docker
# ==========================================
print_step "Iniciando containers Docker..."

# Verificar se containers já estão rodando
if [ -n "$DOCKER_COMPOSE_CMD" ]; then
    if $DOCKER_COMPOSE_CMD ps 2>/dev/null | grep -q "Up\|running"; then
        print_warning "Containers já estão rodando"
        read -p "Deseja reiniciar os containers? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            $DOCKER_COMPOSE_CMD down
            $DOCKER_COMPOSE_CMD up -d
        fi
    else
        $DOCKER_COMPOSE_CMD up -d
    fi
else
    # Usar script docker-podman.sh se existir
    if [ -f "docker-podman.sh" ]; then
        chmod +x docker-podman.sh
        ./docker-podman.sh
    else
        print_error "Não foi possível iniciar containers"
        print_info "Instale docker-compose-plugin ou podman-compose"
        exit 1
    fi
fi

print_success "Containers iniciados"

# ==========================================
# 6. Aguardar containers ficarem prontos
# ==========================================
print_step "Aguardando containers ficarem prontos..."

MAX_WAIT=60
WAIT_COUNT=0

# Verificar PostgreSQL
print_info "Verificando PostgreSQL..."
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if [ "$DOCKER_CMD" = "docker" ]; then
        if docker exec hr-postgres pg_isready -U hr_user -d hr_automation &> /dev/null; then
            print_success "PostgreSQL está pronto"
            break
        fi
    else
        if podman exec hr-postgres pg_isready -U hr_user -d hr_automation &> /dev/null; then
            print_success "PostgreSQL está pronto"
            break
        fi
    fi
    
    WAIT_COUNT=$((WAIT_COUNT + 5))
    if [ $WAIT_COUNT -lt $MAX_WAIT ]; then
        echo -n "."
        sleep 5
    fi
done

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    print_error "PostgreSQL não ficou pronto a tempo"
    exit 1
fi

# Verificar Redis
print_info "Verificando Redis..."
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if [ "$DOCKER_CMD" = "docker" ]; then
        if docker exec hr-redis redis-cli -a redis_secret_2024 ping &> /dev/null; then
            print_success "Redis está pronto"
            break
        fi
    else
        if podman exec hr-redis redis-cli -a redis_secret_2024 ping &> /dev/null; then
            print_success "Redis está pronto"
            break
        fi
    fi
    
    WAIT_COUNT=$((WAIT_COUNT + 5))
    if [ $WAIT_COUNT -lt $MAX_WAIT ]; then
        echo -n "."
        sleep 5
    fi
done

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    print_warning "Redis não ficou pronto a tempo (pode continuar sem ele)"
fi

# ==========================================
# 7. Configurar Banco de Dados
# ==========================================
print_step "Configurando banco de dados..."

# Gerar Prisma Client
print_info "Gerando Prisma Client..."
npm run db:generate
print_success "Prisma Client gerado"

# Sincronizar schema
print_info "Sincronizando schema com banco..."
npm run db:push
print_success "Schema sincronizado"

# ==========================================
# 8. Popular dados iniciais (Seed)
# ==========================================
print_step "Populando dados iniciais..."

if npm run db:seed; then
    print_success "Dados iniciais populados"
else
    print_warning "Erro ao popular dados iniciais (pode continuar)"
fi

# ==========================================
# 9. Verificar API Keys
# ==========================================
print_step "Verificando configuração..."

if grep -q "^OPENAI_API_KEY=\"sk-" .env.local 2>/dev/null || \
   grep -q "^GEMINI_API_KEY=\"" .env.local 2>/dev/null && \
   ! grep -q "^# GEMINI_API_KEY" .env.local 2>/dev/null; then
    print_success "API Key configurada"
else
    print_warning "⚠️  Nenhuma API Key configurada!"
    print_info "Configure pelo menos uma no arquivo .env.local:"
    print_info "   - OPENAI_API_KEY=\"sk-...\""
    print_info "   - GEMINI_API_KEY=\"...\""
    print_info ""
    print_info "Sem uma API Key, os agentes não funcionarão."
fi

# ==========================================
# 10. Resumo Final
# ==========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    🚀 INSTALAÇÃO CONCLUÍDA!                   ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║  📋 Próximos passos:                                          ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"

if ! grep -q "^OPENAI_API_KEY=\"sk-" .env.local 2>/dev/null && \
   ! (grep -q "^GEMINI_API_KEY=\"" .env.local 2>/dev/null && ! grep -q "^# GEMINI_API_KEY" .env.local 2>/dev/null); then
    echo -e "${YELLOW}║  1. Configure suas API keys no arquivo .env.local:           ║${NC}"
    echo -e "${YELLOW}║     - OPENAI_API_KEY ou GEMINI_API_KEY                       ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
fi

echo -e "${GREEN}║  2. Inicie o servidor:                                        ║${NC}"
echo -e "${GREEN}║     ${BLUE}npm run dev${GREEN}                                                  ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║  3. Acesse: ${BLUE}http://localhost:3000${GREEN}                                  ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║  📝 Credenciais padrão (após seed):                           ║${NC}"
echo -e "${GREEN}║     Email: ${BLUE}admin@demo.com${GREEN}                                        ║${NC}"
echo -e "${GREEN}║     Senha: ${BLUE}demo123${GREEN}                                               ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║  🐳 Containers Docker:                                        ║${NC}"
echo -e "${GREEN}║     PostgreSQL: ${BLUE}localhost:5432${GREEN}                                   ║${NC}"
echo -e "${GREEN}║     Redis: ${BLUE}localhost:6379${GREEN}                                       ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Perguntar se deseja iniciar o servidor
read -p "Deseja iniciar o servidor agora? (S/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    print_step "Iniciando servidor de desenvolvimento..."
    npm run dev
fi

