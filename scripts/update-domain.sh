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

# Função para atualizar arquivo
update_file() {
    local file=$1
    local domain=$2
    
    if [ -f "$file" ]; then
        echo "Atualizando $file..."
        # Backup
        cp "$file" "$file.backup"
        
        # NEXTAUTH_URL
        if grep -q "NEXTAUTH_URL=" "$file"; then
            sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=$domain|" "$file"
        else
            echo "NEXTAUTH_URL=$domain" >> "$file"
        fi

        # NEXT_PUBLIC_APP_URL
        if grep -q "NEXT_PUBLIC_APP_URL=" "$file"; then
            sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$domain|" "$file"
        else
            echo "NEXT_PUBLIC_APP_URL=$domain" >> "$file"
        fi
        
        # DOMAIN (usado por scripts)
        if grep -q "DOMAIN=" "$file"; then
             sed -i "s|DOMAIN=.*|DOMAIN=$domain|" "$file"
        fi
        
        # APP_URL (usado por scripts)
        if grep -q "APP_URL=" "$file"; then
             sed -i "s|APP_URL=.*|APP_URL=$domain|" "$file"
        fi
    fi
}

echo -e "\n${BLUE}Atualizando configurações...${NC}"

# Atualizar todos os arquivos de env possíveis
update_file ".env" "$NEW_DOMAIN"
update_file ".env.local" "$NEW_DOMAIN"
update_file ".env.production" "$NEW_DOMAIN"

echo -e "${GREEN}Arquivos de ambiente atualizados!${NC}"

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
