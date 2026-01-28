#!/bin/bash

# ==========================================
# Script para promover usuário a Admin
# ==========================================
# Uso: ./scripts/make-admin.sh email@exemplo.com
# Ou sem argumento para modo interativo

set -e

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Carregar variáveis de ambiente
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | grep DATABASE_URL | xargs)
elif [ -f ".env" ]; then
    export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL não encontrada${NC}"
    exit 1
fi

# Obter email do argumento ou perguntar
EMAIL="${1:-}"

if [ -z "$EMAIL" ]; then
    read -p "Digite o email do usuário: " EMAIL
fi

if [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Email é obrigatório${NC}"
    exit 1
fi

echo -e "${BLUE}▶ Promovendo $EMAIL para ADMIN...${NC}"

# Executar update via Prisma
npx prisma db execute --stdin <<EOF
UPDATE "User" SET role = 'ADMIN' WHERE email = '$EMAIL';
EOF

# Verificar se atualizou
RESULT=$(npx prisma db execute --stdin <<EOF
SELECT email, role FROM "User" WHERE email = '$EMAIL';
EOF
)

echo ""
echo -e "${GREEN}✅ Usuário $EMAIL promovido a ADMIN!${NC}"
echo ""
echo "Reinicie a aplicação para aplicar as mudanças:"
echo "  pm2 restart hr-automation-suite"
