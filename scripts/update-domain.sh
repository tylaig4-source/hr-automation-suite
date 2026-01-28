#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Atualizador de Domínio SaaS RH ===${NC}"

# Verificar se .env existe
if [ ! -f .env ]; then
    echo -e "${RED}Erro: Arquivo .env não encontrado na raiz do projeto.${NC}"
    echo "Por favor, crie o arquivo .env baseado no .env.example"
    exit 1
fi

# Solicitar novo domínio
echo -e "\nDigite o novo domínio completo (ex: https://app.meudominio.com)"
echo "IMPORTANTE: Comece com https:// e não inclua barra no final."
read -p "Domínio: " NEW_DOMAIN

# Validação básica
if [[ ! $NEW_DOMAIN =~ ^https:// ]]; then
    echo -e "${RED}Erro: O domínio deve começar com https://${NC}"
    exit 1
fi

echo -e "\n${BLUE}Atualizando configurações...${NC}"

# Backup do .env
cp .env .env.backup
echo "Backup criado em .env.backup"

# Atualizar variáveis no .env usando sed
# NEXTAUTH_URL
if grep -q "NEXTAUTH_URL=" .env; then
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=$NEW_DOMAIN|" .env
else
    echo "NEXTAUTH_URL=$NEW_DOMAIN" >> .env
fi

# NEXT_PUBLIC_APP_URL
if grep -q "NEXT_PUBLIC_APP_URL=" .env; then
    sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$NEW_DOMAIN|" .env
else
    echo "NEXT_PUBLIC_APP_URL=$NEW_DOMAIN" >> .env
fi

echo -e "${GREEN}Arquivo .env atualizado com sucesso!${NC}"

# Perguntar sobre rebuild
echo -e "\n${BLUE}Deseja reconstruir (build) e reiniciar a aplicação agora? (S/n)${NC}"
read -p "Opção: " REBUILD_OPT

if [[ $REBUILD_OPT =~ ^[Nn]$ ]]; then
    echo -e "\nVocê escolheu não reconstruir agora."
    echo "Lembre-se de rodar 'npm run build' e reiniciar o processo manualmente para aplicar as mudanças."
    exit 0
fi

echo -e "\n${BLUE}Iniciando Build... (Isso pode levar alguns minutos)${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build concluído com sucesso!${NC}"
else
    echo -e "${RED}Falha no build. Verifique os erros acima.${NC}"
    echo "Restaurando backup do .env..."
    cp .env.backup .env
    exit 1
fi

echo -e "\n${BLUE}Reiniciando serviço PM2 (hr-automation-suite)...${NC}"
pm2 restart hr-automation-suite

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Serviço reiniciado com sucesso!${NC}"
    echo -e "\n${GREEN}=== Domínio atualizado para: $NEW_DOMAIN ===${NC}"
    echo "Lembre-se de atualizar também as URLs de callback nos provedores OAuth (Google, etc)."
else
    echo -e "${RED}Falha ao reiniciar PM2. Verifique se o serviço 'hr-automation-suite' existe.${NC}"
    echo "Tente rodar: pm2 start npm --name 'hr-automation-suite' -- start"
fi
