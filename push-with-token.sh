#!/bin/bash

# ==========================================
# Push para GitHub com Token na URL
# ==========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Push para GitHub com Token                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se remote está configurado
if ! git remote | grep -q "^origin$"; then
    echo -e "${RED}❌ Remote 'origin' não configurado!${NC}"
    exit 1
fi

REMOTE_URL=$(git remote get-url origin)
echo -e "${BLUE}ℹ️  Remote atual: ${REMOTE_URL}${NC}"
echo ""

echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Como obter o Token:${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Acesse: https://github.com/settings/tokens"
echo "2. Clique em 'Generate new token' → 'Generate new token (classic)'"
echo "3. Nome: hr-automation-suite"
echo "4. Marque a permissão: 'repo' (todas)"
echo "5. Clique em 'Generate token'"
echo "6. COPIE o token completo"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: O token começa com 'ghp_' ou similar${NC}"
echo ""

# Pedir token
read -sp "Cole seu Personal Access Token aqui: " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Token não fornecido!${NC}"
    exit 1
fi

# Remover credenciais antigas da URL
CLEAN_URL=$(echo "$REMOTE_URL" | sed 's|https://[^@]*@|https://|')
NEW_URL="https://${GITHUB_TOKEN}@${CLEAN_URL#https://}"

echo ""
echo -e "${BLUE}▶ Configurando remote com token...${NC}"

# Atualizar remote com token
git remote set-url origin "$NEW_URL"

echo -e "${GREEN}✅ Remote configurado${NC}"
echo ""

# Fazer push
echo -e "${BLUE}▶ Fazendo push...${NC}"
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              🎉 PUSH REALIZADO COM SUCESSO!                    ║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║  Seu repositório está no GitHub!                              ║${NC}"
    echo -e "${GREEN}║  https://github.com/tylaig4-source/hr-automation-suite        ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    
    # Remover token da URL por segurança
    echo ""
    echo -e "${YELLOW}⚠️  Removendo token da URL por segurança...${NC}"
    git remote set-url origin "$CLEAN_URL"
    echo -e "${GREEN}✅ Token removido da URL${NC}"
else
    echo ""
    echo -e "${RED}❌ Erro ao fazer push${NC}"
    echo ""
    echo -e "${YELLOW}Possíveis causas:${NC}"
    echo "  1. Token inválido ou expirado"
    echo "  2. Token sem permissão 'repo'"
    echo "  3. Repositório não existe ou você não tem acesso"
    echo "  4. Usuário do token diferente do dono do repositório"
    echo ""
    echo -e "${BLUE}Verifique:${NC}"
    echo "  - Token tem permissão 'repo'?"
    echo "  - Repositório existe: https://github.com/tylaig4-source/hr-automation-suite"
    echo "  - Você é o dono ou tem acesso ao repositório?"
    
    # Remover token da URL por segurança
    git remote set-url origin "$CLEAN_URL"
    exit 1
fi



