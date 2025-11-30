#!/bin/bash
# Script para iniciar containers com Podman (alternativa ao docker-compose)

echo "🐳 Iniciando containers com Podman..."

# Criar rede se não existir
podman network create hr-network 2>/dev/null || echo "Rede já existe"

# PostgreSQL
echo "📦 Iniciando PostgreSQL..."
podman run -d \
  --name hr-postgres \
  --network hr-network \
  -e POSTGRES_USER=hr_user \
  -e POSTGRES_PASSWORD=hr_secret_2024 \
  -e POSTGRES_DB=hr_automation \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
  -p 5433:5432 \
  -v hr-postgres-data:/var/lib/postgresql/data \
  --restart unless-stopped \
  docker.io/postgres:16-alpine

# Redis
echo "📦 Iniciando Redis..."
podman run -d \
  --name hr-redis \
  --network hr-network \
  -p 6380:6379 \
  -v hr-redis-data:/data \
  --restart unless-stopped \
  docker.io/redis:7-alpine redis-server --appendonly yes --requirepass redis_secret_2024

echo "✅ Containers iniciados!"
echo ""
echo "PostgreSQL: localhost:5433"
echo "Redis: localhost:6380"
echo ""
echo "Para parar: podman stop hr-postgres hr-redis"
echo "Para remover: podman rm hr-postgres hr-redis"

