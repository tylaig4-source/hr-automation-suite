#!/bin/bash

# ==========================================
# HR AUTOMATION SUITE - Script de Update
# ==========================================
# Execute com: chmod +x update.sh && ./update.sh
# Ou: ./update.sh --quick (pula npm install)

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

# Banner
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          HR AUTOMATION SUITE - Script de Update                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Diretório do projeto
PROJECT_DIR="/var/www/hr-automation-suite"

# Verificar se estamos no diretório correto
if [ -f "package.json" ]; then
    PROJECT_DIR=$(pwd)
elif [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
else
    print_error "Diretório do projeto não encontrado!"
    print_warning "Execute este script na raiz do projeto ou configure PROJECT_DIR"
    exit 1
fi

print_step "Diretório: $PROJECT_DIR"

# ==========================================
# 1. Verificar se há mudanças locais
# ==========================================
print_step "Verificando mudanças locais..."

if [ -n "$(git status --porcelain)" ]; then
    print_warning "Existem mudanças locais não commitadas!"
    echo ""
    git status --short
    echo ""
    read -p "Deseja fazer stash das mudanças? (S/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        git stash
        print_success "Mudanças salvas no stash"
        STASHED=true
    else
        print_error "Abortando update. Commite ou descarte as mudanças locais primeiro."
        exit 1
    fi
else
    print_success "Nenhuma mudança local pendente"
    STASHED=false
fi

# ==========================================
# 2. Pull das atualizações
# ==========================================
print_step "Baixando atualizações do repositório..."

# Obter branch atual
CURRENT_BRANCH=$(git branch --show-current)
print_warning "Branch atual: $CURRENT_BRANCH"

# Fazer pull
git fetch origin
git pull origin "$CURRENT_BRANCH" --no-rebase

print_success "Código atualizado"

# ==========================================
# 3. Instalar dependências (se não for --quick)
# ==========================================
if [ "$1" != "--quick" ] && [ "$1" != "-q" ]; then
    print_step "Instalando/atualizando dependências..."
    npm install --legacy-peer-deps
    print_success "Dependências atualizadas"
else
    print_warning "Pulando npm install (modo --quick)"
fi

# ==========================================
# 4. Verificar se há novas migrações
# ==========================================
print_step "Verificando banco de dados..."

# Gerar Prisma Client
npm run db:generate 2>/dev/null || true

# Sincronizar schema (seguro, não perde dados)
if npm run db:push 2>&1 | grep -q "already in sync"; then
    print_success "Banco de dados já está sincronizado"
else
    npm run db:push
    print_success "Schema do banco atualizado"
fi

# ==========================================
# 5. Build da aplicação
# ==========================================
print_step "Fazendo build da aplicação..."

# Limpar cache antigo se muito grande
if [ -d ".next" ]; then
    NEXT_SIZE=$(du -sm .next 2>/dev/null | cut -f1)
    if [ "$NEXT_SIZE" -gt 500 ]; then
        print_warning "Limpando cache do Next.js ($NEXT_SIZE MB)..."
        rm -rf .next
    fi
fi

npm run build
print_success "Build concluído"

# ==========================================
# 6. Reiniciar aplicação com PM2
# ==========================================
print_step "Reiniciando aplicação..."

if command -v pm2 &> /dev/null; then
    # Verificar se app está rodando
    if pm2 list | grep -q "hr-automation-suite"; then
        pm2 restart hr-automation-suite
        print_success "Aplicação reiniciada com PM2"
    else
        # Tentar iniciar se houver ecosystem.config.js
        if [ -f "ecosystem.config.js" ]; then
            pm2 start ecosystem.config.js
            pm2 save
            print_success "Aplicação iniciada com PM2"
        else
            print_warning "PM2 encontrado, mas aplicação não está configurada"
            print_warning "Inicie manualmente com: pm2 start npm --name hr-automation-suite -- start"
        fi
    fi
    
    # Mostrar status
    echo ""
    pm2 status
else
    print_warning "PM2 não encontrado. Reinicie a aplicação manualmente."
    print_warning "Ou instale PM2: npm install -g pm2"
fi

# ==========================================
# 7. Restaurar stash se necessário
# ==========================================
if [ "$STASHED" = true ]; then
    print_step "Restaurando mudanças locais do stash..."
    read -p "Deseja restaurar as mudanças do stash? (S/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        git stash pop
        print_success "Mudanças restauradas"
    else
        print_warning "Mudanças mantidas no stash. Restaure com: git stash pop"
    fi
fi

# ==========================================
# 8. Resumo
# ==========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ UPDATE CONCLUÍDO!                        ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Branch: ${BLUE}$CURRENT_BRANCH${NC}"
echo -e "${GREEN}║  Commit: ${BLUE}$(git rev-parse --short HEAD)${NC}"
echo -e "${GREEN}║  Data: ${BLUE}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se app está online
if command -v curl &> /dev/null; then
    sleep 3
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302"; then
        print_success "Aplicação está online em http://localhost:3000"
    else
        print_warning "Verificando logs... (pode levar alguns segundos para iniciar)"
        if command -v pm2 &> /dev/null; then
            pm2 logs hr-automation-suite --lines 10 --nostream 2>/dev/null || true
        fi
    fi
fi
