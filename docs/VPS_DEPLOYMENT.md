# 🚀 Guia de Deploy na VPS

Este guia cobre o processo completo de deploy do HR Automation Suite em uma VPS usando PM2.

## 📋 Pré-requisitos

- VPS com Ubuntu/Debian
- Acesso SSH à VPS
- Node.js 18+ instalado
- Docker e Docker Compose instalados
- PM2 instalado globalmente
- Nginx instalado (opcional, para reverse proxy)

## 🔧 Passo 1: Preparar o Servidor

### 1.1 Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx (opcional)
sudo apt install -y nginx
```

### 1.2 Configurar Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

## 📦 Passo 2: Clonar o Repositório

```bash
# Criar diretório para aplicações
sudo mkdir -p /var/www
cd /var/www

# Clonar repositório (ajuste a URL conforme necessário)
sudo git clone https://github.com/tylaig4-source/hr-automation-suite.git
sudo chown -R $USER:$USER /var/www/hr-automation-suite
cd /var/www/hr-automation-suite

# Fazer checkout da branch desejada
git checkout feat/migrate-to-stripe
```

## 🔐 Passo 3: Configurar Variáveis de Ambiente

```bash
# Copiar template de env
cp .env.example .env.local

# Editar variáveis de ambiente
nano .env.local
```

### Variáveis Obrigatórias:

```env
# Database
DATABASE_URL="postgresql://postgres:senha@localhost:5432/hr_suite?schema=public"

# NextAuth
NEXTAUTH_URL="https://seudominio.com"
NEXTAUTH_SECRET="gerar-uma-chave-secreta-aqui"

# Stripe (opcional durante build, obrigatório em runtime)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# OpenAI (se usar)
OPENAI_API_KEY="sk-..."

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha"
```

**Gerar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## 🗄️ Passo 4: Configurar Banco de Dados

### 4.1 Iniciar PostgreSQL com Docker

```bash
# Criar diretório para dados do PostgreSQL
mkdir -p ~/postgres-data

# Iniciar PostgreSQL
docker run -d \
  --name postgres-hr \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=sua_senha_aqui \
  -e POSTGRES_DB=hr_suite \
  -p 5432:5432 \
  -v ~/postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine

# Verificar se está rodando
docker ps
```

### 4.2 Executar Migrações

```bash
cd /var/www/hr-automation-suite

# Instalar dependências
npm install

# Executar migrações
npm run db:push

# Ou se preferir usar Prisma Migrate
npx prisma migrate deploy
```

## 🏗️ Passo 5: Build da Aplicação

```bash
cd /var/www/hr-automation-suite

# Build de produção
npm run build

# Verificar se build foi bem-sucedido
ls -la .next
```

**Nota:** O build funciona sem STRIPE_SECRET_KEY configurada, mas você precisará configurá-la antes de iniciar a aplicação em produção.

## 🚀 Passo 6: Configurar PM2

### 6.1 Criar Arquivo de Configuração PM2

```bash
nano ecosystem.config.js
```

Conteúdo:

```javascript
module.exports = {
  apps: [{
    name: 'hr-automation-suite',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/hr-automation-suite',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
  }]
};
```

### 6.2 Iniciar Aplicação com PM2

```bash
cd /var/www/hr-automation-suite

# Criar diretório de logs
mkdir -p logs

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que aparecer (geralmente algo como: sudo env PATH=...)
```

### 6.3 Comandos Úteis do PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs hr-automation-suite

# Reiniciar
pm2 restart hr-automation-suite

# Parar
pm2 stop hr-automation-suite

# Monitorar
pm2 monit
```

## 🌐 Passo 7: Configurar Nginx (Opcional)

### 7.1 Criar Configuração Nginx

```bash
sudo nano /etc/nginx/sites-available/hr-automation-suite
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.2 Ativar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/hr-automation-suite /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 7.3 Configurar SSL com Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Certificado será renovado automaticamente
```

## ✅ Passo 8: Verificar Deploy

1. **Verificar se aplicação está rodando:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Verificar logs:**
   ```bash
   pm2 logs hr-automation-suite
   ```

3. **Verificar banco de dados:**
   ```bash
   docker ps | grep postgres
   ```

4. **Acessar aplicação:**
   - Local: `http://seu-ip:3000`
   - Com Nginx: `http://seudominio.com`

## 🔄 Passo 9: Atualizar Aplicação

```bash
cd /var/www/hr-automation-suite

# Fazer pull das atualizações
git pull origin feat/migrate-to-stripe

# Instalar novas dependências (se houver)
npm install

# Executar migrações (se houver)
npm run db:push

# Rebuild
npm run build

# Reiniciar aplicação
pm2 restart hr-automation-suite
```

## 🐛 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs hr-automation-suite --lines 100

# Verificar variáveis de ambiente
pm2 env hr-automation-suite

# Verificar porta
sudo netstat -tulpn | grep 3000
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Verificar logs do PostgreSQL
docker logs postgres-hr

# Testar conexão
docker exec -it postgres-hr psql -U postgres -d hr_suite
```

### Build falha

```bash
# Limpar cache
rm -rf .next node_modules

# Reinstalar dependências
npm install

# Tentar build novamente
npm run build
```

### Porta 3000 já em uso

```bash
# Verificar o que está usando a porta
sudo lsof -i :3000

# Parar processo ou mudar porta no ecosystem.config.js
```

## 📝 Notas Importantes

1. **Stripe**: Configure as chaves do Stripe antes de usar funcionalidades de pagamento
2. **Backup**: Configure backups regulares do banco de dados
3. **Monitoramento**: Configure alertas do PM2 ou use ferramentas de monitoramento
4. **Segurança**: Mantenha o sistema e dependências atualizadas
5. **Logs**: Monitore logs regularmente para identificar problemas

## 🔗 Links Úteis

- [Documentação PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação Docker](https://docs.docker.com/)
- [Documentação Nginx](https://nginx.org/en/docs/)

