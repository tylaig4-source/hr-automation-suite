# 🔧 Como Resolver Conflito de Porta no Docker

## 🚨 Erro: "port is already allocated"

Este erro ocorre quando a porta 6379 (Redis) ou outra porta já está em uso por outro processo.

## 🔍 Passo 1: Identificar o Processo

```bash
# Ver qual processo está usando a porta 6379 (Redis)
sudo lsof -i :6379

# Ou usar netstat
sudo netstat -tulpn | grep 6379

# Ou usar ss
sudo ss -tulpn | grep 6379
```

## 🛑 Passo 2: Matar o Processo

### Opção A: Se for outro container Docker

```bash
# Listar containers rodando
docker ps

# Parar e remover container que está usando a porta
docker stop <container-id>
docker rm <container-id>

# Ou parar todos os containers
docker stop $(docker ps -q)
```

### Opção B: Se for processo do sistema

```bash
# Encontrar PID do processo
sudo lsof -i :6379 | grep LISTEN

# Matar o processo (substitua <PID> pelo número encontrado)
sudo kill -9 <PID>

# Ou matar diretamente
sudo kill -9 $(sudo lsof -t -i:6379)
```

### Opção C: Se for Redis instalado no sistema

```bash
# Parar serviço Redis do sistema
sudo systemctl stop redis
sudo systemctl stop redis-server

# Desabilitar para não iniciar automaticamente
sudo systemctl disable redis
sudo systemctl disable redis-server
```

## 🔄 Passo 3: Limpar Containers e Redes Docker

```bash
# Parar todos os containers
docker-compose down

# Remover containers órfãos
docker-compose down --remove-orphans

# Limpar tudo (cuidado: remove containers, redes, volumes)
docker-compose down -v

# Limpar sistema Docker (se necessário)
docker system prune -a
```

## ✅ Passo 4: Subir Novamente

```bash
# Subir containers
docker-compose up -d --build

# Verificar se está rodando
docker-compose ps

# Ver logs
docker-compose logs -f
```

## 🎯 Solução Rápida (Copy & Paste)

```bash
# Matar processo na porta 6379
sudo kill -9 $(sudo lsof -t -i:6379) 2>/dev/null || true

# Parar Redis do sistema (se instalado)
sudo systemctl stop redis redis-server 2>/dev/null || true

# Parar todos containers Docker
docker-compose down

# Limpar e subir novamente
docker-compose up -d --build

# Verificar
docker-compose ps
```

## 🔧 Corrigir Warning do docker-compose.yml

O warning sobre `version` pode ser corrigido removendo a linha `version:` do arquivo `docker-compose.yml` (não é mais necessária nas versões recentes do Docker Compose).

## 📝 Verificar Outras Portas

Se tiver problemas com outras portas:

```bash
# PostgreSQL (5432)
sudo lsof -i :5432
sudo kill -9 $(sudo lsof -t -i:5432)

# Next.js (3000)
sudo lsof -i :3000
sudo kill -9 $(sudo lsof -t -i:3000)
```

## 🐛 Troubleshooting Adicional

### Se ainda não funcionar:

```bash
# Verificar todos os containers Docker
docker ps -a

# Remover container específico
docker rm -f hr-redis

# Verificar redes Docker
docker network ls

# Remover rede se necessário
docker network rm hr-network

# Limpar tudo e recomeçar
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

