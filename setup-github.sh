#!/bin/bash

# ==========================================
# HR AUTOMATION SUITE - Setup GitHub
# ==========================================
# Script para preparar e fazer push inicial para GitHub

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          HR AUTOMATION SUITE - Setup GitHub                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se está na raiz do projeto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto!"
    exit 1
fi

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    print_error "Git não está instalado!"
    exit 1
fi

print_success "Git encontrado: $(git --version)"

# Verificar se já é um repositório Git
if [ -d ".git" ]; then
    print_warning "Repositório Git já inicializado"
    read -p "Deseja continuar? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 0
    fi
else
    print_step "Inicializando repositório Git..."
    git init
    print_success "Repositório inicializado"
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    print_step "Adicionando arquivos..."
    git add .
    print_success "Arquivos adicionados"
    
    print_step "Fazendo commit inicial..."
    git commit -m "Initial commit: HR Automation Suite MVP

- Sistema completo de automação de RH com agentes de IA
- 8 agentes implementados (MVP)
- Autenticação completa (NextAuth.js)
- Sistema de templates e histórico
- Exportação PDF/DOCX
- Analytics básico
- Docker Compose configurado
- Instalador automático
- Visualizador de Markdown
- Multi-provider IA (OpenAI + Gemini)"
    print_success "Commit criado"
else
    print_warning "Nenhuma mudança para commitar"
fi

# Verificar branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_step "Renomeando branch para 'main'..."
    git branch -M main
    print_success "Branch renomeada para 'main'"
fi

# Verificar remote
if git remote | grep -q "^origin$"; then
    REMOTE_URL=$(git remote get-url origin)
    print_warning "Remote 'origin' já existe: $REMOTE_URL"
    read -p "Deseja alterar? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Digite a URL do repositório GitHub: " GITHUB_URL
        git remote set-url origin "$GITHUB_URL"
        print_success "Remote atualizado"
    fi
else
    print_step "Configurando remote..."
    echo ""
    print_info "Você precisa criar o repositório no GitHub primeiro:"
    echo "  1. Acesse: https://github.com/new"
    echo "  2. Nome: hr-automation-suite (ou o que preferir)"
    echo "  3. NÃO marque 'Initialize with README'"
    echo "  4. Clique em 'Create repository'"
    echo ""
    read -p "Digite a URL do repositório GitHub (ex: https://github.com/usuario/repo.git): " GITHUB_URL
    
    if [ -z "$GITHUB_URL" ]; then
        print_error "URL não fornecida!"
        exit 1
    fi
    
    git remote add origin "$GITHUB_URL"
    print_success "Remote adicionado: $GITHUB_URL"
fi

# Mostrar status
print_step "Status do repositório:"
git status

echo ""
print_step "Próximos passos:"
echo ""
echo -e "${GREEN}1. Verifique se o repositório foi criado no GitHub${NC}"
echo -e "${GREEN}2. Execute o comando abaixo para fazer push:${NC}"
echo ""
echo -e "${BLUE}   git push -u origin main${NC}"
echo ""
echo -e "${YELLOW}⚠️  Se pedir autenticação:${NC}"
echo -e "${YELLOW}   - Username: Seu usuário do GitHub${NC}"
echo -e "${YELLOW}   - Password: Use um Personal Access Token (não sua senha)${NC}"
echo -e "${YELLOW}   - Criar token: https://github.com/settings/tokens${NC}"
echo ""

read -p "Deseja fazer push agora? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_step "Fazendo push para GitHub..."
    if git push -u origin main; then
        print_success "Push realizado com sucesso!"
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              🎉 REPOSITÓRIO NO GITHUB!                        ║${NC}"
        echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
        echo -e "${GREEN}║                                                                ║${NC}"
        REMOTE_URL=$(git remote get-url origin)
        echo -e "${GREEN}║  Repositório: ${BLUE}$REMOTE_URL${GREEN}                    ║${NC}"
        echo -e "${GREEN}║                                                                ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    else
        print_error "Erro ao fazer push"
        print_info "Verifique sua autenticação e tente novamente"
    fi
else
    print_info "Execute 'git push -u origin main' quando estiver pronto"
fi

