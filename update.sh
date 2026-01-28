#!/bin/bash

# ==========================================
# HR AUTOMATION SUITE - Script de Update
# ==========================================
# Execute com: ./update.sh
# Opções:
#   --quick, -q     : Pula npm install
#   --domain, -d    : Alterar domínio/SSL
#   --help, -h      : Mostra ajuda

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "\n${BLUE}▶ $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Mostrar ajuda
show_help() {
    echo "HR Automation Suite - Script de Update"
    echo ""
    echo "Uso: ./update.sh [opções]"
    echo ""
    echo "Opções:"
    echo "  --quick, -q     Pula npm install (update rápido)"
    echo "  --domain, -d    Alterar configuração de domínio/SSL"
    echo "  --ssl           Configurar/renovar SSL"
    echo "  --help, -h      Mostra esta ajuda"
    echo ""
    exit 0
}

# Processar argumentos
QUICK_MODE=false
CHANGE_DOMAIN=false
CONFIGURE_SSL=false

for arg in "$@"; do
    case $arg in
        --quick|-q)
            QUICK_MODE=true
            ;;
        --domain|-d)
            CHANGE_DOMAIN=true
            ;;
        --ssl)
            CONFIGURE_SSL=true
            ;;
        --help|-h)
            show_help
            ;;
    esac
done

# Banner
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          HR AUTOMATION SUITE - Script de Update                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Diretório do projeto
PROJECT_DIR="/var/www/hr-automation-suite"

if [ -f "package.json" ]; then
    PROJECT_DIR=$(pwd)
elif [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
else
    print_error "Diretório do projeto não encontrado!"
    exit 1
fi

print_info "Diretório: $PROJECT_DIR"

# Carregar variáveis de ambiente
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Carregar configuração de domínio
if [ -f ".domain.conf" ]; then
    source .domain.conf
    print_info "Domínio atual: $DOMAIN"
fi

# ==========================================
# Função: Alterar Domínio
# ==========================================
change_domain() {
    print_step "Alterando configuração de domínio..."
    
    echo ""
    echo "Domínio atual: ${DOMAIN:-localhost}"
    echo ""
    read -p "Digite o novo domínio (ou Enter para manter): " NEW_DOMAIN
    
    if [ -z "$NEW_DOMAIN" ]; then
        print_info "Mantendo domínio atual"
        return
    fi
    
    DOMAIN="$NEW_DOMAIN"
    
    read -p "Usar HTTPS com Let's Encrypt? (S/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        APP_URL="https://$DOMAIN"
        USE_SSL=true
        read -p "Email para o certificado SSL: " SSL_EMAIL
    else
        APP_URL="http://$DOMAIN"
        USE_SSL=false
    fi
    
    # Atualizar .env.local
    if [ -f ".env.local" ]; then
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"$APP_URL\"|" .env.local
        sed -i "s|APP_URL=.*|APP_URL=\"$APP_URL\"|" .env.local
        
        # Adicionar DOMAIN se não existir
        if grep -q "DOMAIN=" .env.local; then
            sed -i "s|DOMAIN=.*|DOMAIN=\"$DOMAIN\"|" .env.local
        else
            echo "DOMAIN=\"$DOMAIN\"" >> .env.local
        fi
    fi
    
    # Atualizar .domain.conf
    echo "DOMAIN=$DOMAIN" > .domain.conf
    echo "APP_URL=$APP_URL" >> .domain.conf
    echo "USE_SSL=$USE_SSL" >> .domain.conf
    [ -n "$SSL_EMAIL" ] && echo "SSL_EMAIL=$SSL_EMAIL" >> .domain.conf
    
    print_success "Configuração de domínio atualizada"
    
    # Atualizar Nginx
    if command -v nginx &> /dev/null; then
        print_step "Atualizando Nginx..."
        
        sudo tee /etc/nginx/sites-available/hr-automation-suite > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
        
        if sudo nginx -t; then
            sudo systemctl restart nginx
            print_success "Nginx atualizado"
        else
            print_error "Erro na configuração do Nginx"
        fi
        
        # Configurar SSL
        if [ "$USE_SSL" = true ] && [ -n "$SSL_EMAIL" ]; then
            configure_ssl
        fi
    fi
}

# ==========================================
# Função: Configurar SSL
# ==========================================
configure_ssl() {
    print_step "Configurando SSL com Let's Encrypt..."
    
    if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "localhost" ]; then
        print_error "Configure um domínio antes de ativar SSL"
        return
    fi
    
    if ! command -v certbot &> /dev/null; then
        print_info "Instalando Certbot..."
        sudo apt update && sudo apt install -y certbot python3-certbot-nginx
    fi
    
    if [ -z "$SSL_EMAIL" ]; then
        read -p "Email para o certificado SSL: " SSL_EMAIL
    fi
    
    if sudo certbot --nginx -d "$DOMAIN" --email "$SSL_EMAIL" --agree-tos --non-interactive; then
        print_success "Certificado SSL instalado!"
        
        # Atualizar URLs para HTTPS
        APP_URL="https://$DOMAIN"
        sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"$APP_URL\"|" .env.local
        sed -i "s|APP_URL=.*|APP_URL=\"$APP_URL\"|" .env.local
        
        echo "DOMAIN=$DOMAIN" > .domain.conf
        echo "APP_URL=$APP_URL" >> .domain.conf
        echo "USE_SSL=true" >> .domain.conf
        echo "SSL_EMAIL=$SSL_EMAIL" >> .domain.conf
    else
        print_error "Erro ao obter certificado SSL"
        print_info "Verifique se o domínio está apontando para este servidor"
    fi
}

# ==========================================
# Processar opções especiais
# ==========================================
if [ "$CHANGE_DOMAIN" = true ]; then
    change_domain
    print_step "Reiniciando aplicação..."
    pm2 restart hr-automation-suite 2>/dev/null || true
    exit 0
fi

if [ "$CONFIGURE_SSL" = true ]; then
    configure_ssl
    print_step "Reiniciando aplicação..."
    pm2 restart hr-automation-suite 2>/dev/null || true
    exit 0
fi

# ==========================================
# 1. Verificar mudanças locais
# ==========================================
print_step "Verificando mudanças locais..."

STASHED=false
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Existem mudanças locais não commitadas!"
    git status --short
    echo ""
    read -p "Fazer stash das mudanças? (S/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        git stash
        print_success "Mudanças salvas no stash"
        STASHED=true
    else
        print_error "Abortando. Commite ou descarte as mudanças primeiro."
        exit 1
    fi
else
    print_success "Nenhuma mudança local pendente"
fi

# ==========================================
# 2. Pull das atualizações
# ==========================================
print_step "Baixando atualizações..."

CURRENT_BRANCH=$(git branch --show-current)
print_info "Branch: $CURRENT_BRANCH"

git fetch origin
git pull origin "$CURRENT_BRANCH" --no-rebase

print_success "Código atualizado"

# ==========================================
# 3. Instalar dependências
# ==========================================
if [ "$QUICK_MODE" = false ]; then
    print_step "Atualizando dependências..."
    npm install --legacy-peer-deps
    print_success "Dependências atualizadas"
else
    print_warning "Pulando npm install (modo --quick)"
fi

# ==========================================
# 4. Atualizar banco de dados
# ==========================================
print_step "Verificando banco de dados..."

npm run db:generate 2>/dev/null || true

if npm run db:push 2>&1 | grep -q "already in sync"; then
    print_success "Banco já sincronizado"
else
    npm run db:push
    print_success "Schema atualizado"
fi

# ==========================================
# 5. Build da aplicação
# ==========================================
print_step "Fazendo build..."

if [ -d ".next" ]; then
    NEXT_SIZE=$(du -sm .next 2>/dev/null | cut -f1)
    if [ "$NEXT_SIZE" -gt 500 ]; then
        print_warning "Limpando cache ($NEXT_SIZE MB)..."
        rm -rf .next
    fi
fi

npm run build
print_success "Build concluído"

# ==========================================
# 6. Reiniciar aplicação
# ==========================================
print_step "Reiniciando aplicação..."

if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "hr-automation-suite"; then
        pm2 restart hr-automation-suite
        print_success "Aplicação reiniciada"
    elif [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js
        pm2 save
        print_success "Aplicação iniciada"
    fi
    
    echo ""
    pm2 status
else
    print_warning "PM2 não encontrado. Reinicie manualmente."
fi

# ==========================================
# 7. Restaurar stash
# ==========================================
if [ "$STASHED" = true ]; then
    read -p "Restaurar mudanças do stash? (S/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        git stash pop
        print_success "Mudanças restauradas"
    else
        print_warning "Mudanças mantidas no stash"
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
echo -e "${GREEN}║  Data:   ${BLUE}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "localhost" ]; then
    echo -e "${GREEN}║  URL:    ${BLUE}${APP_URL}${NC}"
fi
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se está online
if command -v curl &> /dev/null; then
    sleep 3
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302"; then
        print_success "Aplicação online!"
    fi
fi
