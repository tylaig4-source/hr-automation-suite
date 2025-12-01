#!/bin/bash

# ==========================================
# Script para fazer push com autenticação
# ==========================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Push para GitHub                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se remote está configurado
if ! git remote | grep -q "^origin$"; then
    echo -e "${RED}❌ Remote 'origin' não configurado!${NC}"
    echo "Execute: git remote add origin https://github.com/USUARIO/REPO.git"
    exit 1
fi

REMOTE_URL=$(git remote get-url origin)
echo -e "${BLUE}ℹ️  Remote: ${REMOTE_URL}${NC}"
echo ""

# Limpar credenciais antigas
echo -e "${YELLOW}⚠️  Limpando credenciais antigas...${NC}"
git credential-cache exit 2>/dev/null || true

echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  IMPORTANTE: Autenticação GitHub${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}O GitHub não aceita mais senha normal!${NC}"
echo -e "${BLUE}Você precisa usar um Personal Access Token.${NC}"
echo ""
echo -e "${GREEN}Como criar o token:${NC}"
echo "  1. Acesse: https://github.com/settings/tokens"
echo "  2. Clique em 'Generate new token' → 'Generate new token (classic)'"
echo "  3. Nome: hr-automation-suite"
echo "  4. Marque a permissão: 'repo' (todas)"
echo "  5. Clique em 'Generate token'"
echo "  6. COPIE o token (você não verá novamente!)"
echo ""
echo -e "${YELLOW}Quando pedir credenciais:${NC}"
echo -e "${YELLOW}  Username: seu usuário do GitHub${NC}"
echo -e "${YELLOW}  Password: COLE O TOKEN (não sua senha)${NC}"
echo ""
read -p "Pressione ENTER quando tiver o token pronto..."

echo ""
echo -e "${BLUE}▶ Fazendo push...${NC}"
echo ""

# Fazer push (vai pedir credenciais)
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              🎉 PUSH REALIZADO COM SUCESSO!                    ║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║  Seu repositório está no GitHub!                              ║${NC}"
    echo -e "${GREEN}║  ${REMOTE_URL}${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
else
    echo ""
    echo -e "${RED}❌ Erro ao fazer push${NC}"
    echo ""
    echo -e "${YELLOW}Possíveis soluções:${NC}"
    echo "  1. Verifique se o token está correto"
    echo "  2. Verifique se o repositório existe no GitHub"
    echo "  3. Verifique se você tem permissão no repositório"
    echo "  4. Tente criar o token novamente"
    exit 1
fi



