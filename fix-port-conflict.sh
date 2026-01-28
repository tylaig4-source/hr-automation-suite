#!/bin/bash

echo "🔍 Verificando processos na porta 6379 (Redis)..."

# Verificar se há processo na porta 6379
if sudo lsof -i :6379 > /dev/null 2>&1; then
    echo "⚠️  Processo encontrado na porta 6379!"
    echo ""
    echo "Processos usando a porta 6379:"
    sudo lsof -i :6379
    echo ""
    echo "🛑 Matando processos..."
    sudo kill -9 $(sudo lsof -t -i:6379) 2>/dev/null
    echo "✅ Processos finalizados"
else
    echo "✅ Porta 6379 está livre"
fi

echo ""
echo "🔍 Verificando Redis do sistema..."

# Parar Redis do sistema se estiver rodando
if systemctl is-active --quiet redis 2>/dev/null; then
    echo "⚠️  Redis do sistema está rodando"
    sudo systemctl stop redis 2>/dev/null || true
    echo "✅ Redis do sistema parado"
fi

if systemctl is-active --quiet redis-server 2>/dev/null; then
    echo "⚠️  Redis-server do sistema está rodando"
    sudo systemctl stop redis-server 2>/dev/null || true
    echo "✅ Redis-server do sistema parado"
fi

echo ""
echo "🔍 Verificando containers Docker..."

# Parar containers Docker
if docker ps -a | grep -q hr-redis; then
    echo "⚠️  Container hr-redis encontrado"
    docker stop hr-redis 2>/dev/null || true
    docker rm hr-redis 2>/dev/null || true
    echo "✅ Container hr-redis removido"
fi

# Parar todos os containers relacionados
docker-compose down 2>/dev/null || true

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "Agora você pode executar:"
echo "  docker-compose up -d --build"

