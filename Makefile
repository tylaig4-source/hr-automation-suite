# ==========================================
# HR AUTOMATION SUITE - Makefile
# ==========================================

.PHONY: help install setup dev build start docker-up docker-down docker-logs docker-reset db-push db-seed db-studio clean

# Mostra ajuda
help:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║          HR AUTOMATION SUITE - Comandos Disponíveis           ║"
	@echo "╠════════════════════════════════════════════════════════════════╣"
	@echo "║ SETUP                                                          ║"
	@echo "║   make install    - Instala dependências npm                   ║"
	@echo "║   make setup      - Setup completo (docker + db + seed)        ║"
	@echo "║                                                                ║"
	@echo "║ DESENVOLVIMENTO                                                ║"
	@echo "║   make dev        - Inicia servidor de desenvolvimento         ║"
	@echo "║   make build      - Build de produção                          ║"
	@echo "║   make start      - Inicia em produção                         ║"
	@echo "║                                                                ║"
	@echo "║ DOCKER                                                         ║"
	@echo "║   make docker-up  - Inicia containers (postgres + redis)       ║"
	@echo "║   make docker-dev - Inicia com UIs (pgadmin + redis-commander) ║"
	@echo "║   make docker-down- Para containers                            ║"
	@echo "║   make docker-logs- Mostra logs dos containers                 ║"
	@echo "║   make docker-reset- Reset completo (apaga volumes)            ║"
	@echo "║                                                                ║"
	@echo "║ BANCO DE DADOS                                                 ║"
	@echo "║   make db-push    - Sincroniza schema com banco                ║"
	@echo "║   make db-seed    - Popula dados iniciais                      ║"
	@echo "║   make db-studio  - Abre Prisma Studio                         ║"
	@echo "║   make db-migrate - Cria migration                             ║"
	@echo "║                                                                ║"
	@echo "║ OUTROS                                                         ║"
	@echo "║   make clean      - Limpa node_modules e cache                 ║"
	@echo "║   make lint       - Verifica código                            ║"
	@echo "║   make test       - Executa testes                             ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"

# ==========================================
# SETUP
# ==========================================

install:
	npm install

setup: docker-up
	@echo "⏳ Aguardando containers iniciarem..."
	@sleep 5
	npm run db:push
	npm run db:seed
	@echo "✅ Setup completo! Execute 'make dev' para iniciar"

# ==========================================
# DESENVOLVIMENTO
# ==========================================

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

test:
	npm run test

# ==========================================
# DOCKER
# ==========================================

docker-up:
	docker-compose up -d
	@echo "✅ Containers iniciados!"
	@echo "   PostgreSQL: localhost:5432"
	@echo "   Redis: localhost:6379"

docker-dev:
	docker-compose --profile dev up -d
	@echo "✅ Containers iniciados com UIs!"
	@echo "   PostgreSQL: localhost:5432"
	@echo "   Redis: localhost:6379"
	@echo "   pgAdmin: http://localhost:5050"
	@echo "   Redis Commander: http://localhost:8081"

docker-down:
	docker-compose down
	@echo "✅ Containers parados"

docker-logs:
	docker-compose logs -f

docker-reset:
	docker-compose down -v
	docker-compose up -d
	@echo "✅ Containers resetados (volumes apagados)"

docker-status:
	docker-compose ps

# ==========================================
# BANCO DE DADOS
# ==========================================

db-push:
	npm run db:push

db-seed:
	npm run db:seed

db-studio:
	npm run db:studio

db-migrate:
	npm run db:migrate

db-generate:
	npm run db:generate

# ==========================================
# UTILITÁRIOS
# ==========================================

clean:
	rm -rf node_modules
	rm -rf .next
	rm -rf .turbo
	@echo "✅ Limpeza concluída"

# Cria arquivo .env.local a partir do template
env:
	@if [ ! -f .env.local ]; then \
		echo "DATABASE_URL=\"postgresql://hr_user:hr_secret_2024@localhost:5432/hr_automation?schema=public\"" > .env.local; \
		echo "REDIS_URL=\"redis://localhost:6379\"" >> .env.local; \
		echo "REDIS_PASSWORD=\"redis_secret_2024\"" >> .env.local; \
		echo "NEXTAUTH_SECRET=\"$$(openssl rand -base64 32)\"" >> .env.local; \
		echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env.local; \
		echo "" >> .env.local; \
		echo "# OpenAI (opcional se usar Gemini)" >> .env.local; \
		echo "# OPENAI_API_KEY=\"sk-...\"" >> .env.local; \
		echo "" >> .env.local; \
		echo "# Google Gemini (opcional se usar OpenAI)" >> .env.local; \
		echo "# GEMINI_API_KEY=\"...\"" >> .env.local; \
		echo "✅ Arquivo .env.local criado!"; \
	else \
		echo "⚠️  Arquivo .env.local já existe"; \
	fi

# Quick start completo
quickstart: install env docker-up
	@sleep 5
	npm run db:push
	npm run db:seed
	@echo ""
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║                    🚀 SETUP COMPLETO!                          ║"
	@echo "╠════════════════════════════════════════════════════════════════╣"
	@echo "║ 1. Configure suas API keys no arquivo .env.local:              ║"
	@echo "║    - OPENAI_API_KEY ou GEMINI_API_KEY                          ║"
	@echo "║                                                                ║"
	@echo "║ 2. Inicie o servidor:                                          ║"
	@echo "║    make dev                                                    ║"
	@echo "║                                                                ║"
	@echo "║ 3. Acesse: http://localhost:3000                               ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"

