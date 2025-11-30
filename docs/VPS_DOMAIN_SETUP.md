# Configuração de Domínio no Nginx

Este guia mostra como configurar seu domínio no Nginx e obter certificado SSL com Let's Encrypt.

## 📋 Pré-requisitos

- Domínio apontando para o IP do servidor (DNS configurado)
- Nginx instalado e rodando
- Porta 80 e 443 liberadas no firewall
- Acesso root ou sudo

## 🔧 Passo 1: Verificar DNS

Antes de começar, verifique se o domínio está apontando para o IP do servidor:

```bash
# Verificar se o DNS está configurado
dig seu-dominio.com +short
# ou
nslookup seu-dominio.com

# Deve retornar o IP do seu servidor
```

## 🔧 Passo 2: Instalar Certbot (Let's Encrypt)

```bash
# Atualizar pacotes
sudo apt update

# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y
```

## 🔧 Passo 3: Configurar Nginx para o Domínio

### 3.1 Criar/Editar Configuração do Nginx

```bash
# Editar configuração do Nginx
sudo nano /etc/nginx/sites-available/hr-automation-suite
```

### 3.2 Configuração Completa (HTTP + HTTPS)

Substitua `seu-dominio.com` pelo seu domínio real:

```nginx
# HTTP - Redirecionar para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirecionar tudo para HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS - Configuração Principal
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # Certificados SSL (serão gerados pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Configurações SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Tamanho máximo de upload
    client_max_body_size 10M;

    # Proxy para Next.js
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /_next/webpack-hmr {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 3.3 Habilitar Site

```bash
# Criar link simbólico (se ainda não existir)
sudo ln -s /etc/nginx/sites-available/hr-automation-suite /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Se tudo estiver OK, recarregar Nginx
sudo systemctl reload nginx
```

## 🔧 Passo 4: Obter Certificado SSL

### 4.1 Gerar Certificado com Certbot

```bash
# Substitua seu-dominio.com pelo seu domínio
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# O Certbot irá:
# 1. Verificar o domínio
# 2. Gerar os certificados
# 3. Atualizar automaticamente a configuração do Nginx
# 4. Configurar renovação automática
```

### 4.2 Verificar Renovação Automática

```bash
# Testar renovação (não vai renovar, só testar)
sudo certbot renew --dry-run

# Verificar status do timer
sudo systemctl status certbot.timer
```

## 🔧 Passo 5: Atualizar Variáveis de Ambiente

### 5.1 Editar .env

```bash
cd /var/www/hr-automation-suite
nano .env
```

### 5.2 Atualizar URLs

Atualize as seguintes variáveis (substitua `seu-dominio.com`):

```env
# URL base da aplicação
NEXTAUTH_URL=https://seu-dominio.com
NEXT_PUBLIC_APP_URL=https://seu-dominio.com

# Se usar Google OAuth, atualize também:
# GOOGLE_CLIENT_ID=seu-client-id
# GOOGLE_CLIENT_SECRET=seu-client-secret
# E adicione https://seu-dominio.com/api/auth/callback/google nas URLs autorizadas no Google Console
```

### 5.3 Reiniciar Aplicação

```bash
# Reiniciar PM2 para aplicar novas variáveis
pm2 restart hr-automation-suite

# Verificar logs
pm2 logs hr-automation-suite
```

## 🔧 Passo 6: Verificar Funcionamento

### 6.1 Testar HTTP (deve redirecionar para HTTPS)

```bash
curl -I http://seu-dominio.com
# Deve retornar: HTTP/1.1 301 Moved Permanently
```

### 6.2 Testar HTTPS

```bash
curl -I https://seu-dominio.com
# Deve retornar: HTTP/2 200
```

### 6.3 Verificar SSL

Acesse no navegador:
- `https://seu-dominio.com`
- Verifique o cadeado verde no navegador
- Teste todas as rotas principais

## 🔧 Passo 7: Configurar Google OAuth (se usar)

Se você usa autenticação com Google, precisa atualizar:

1. **Google Cloud Console**:
   - Acesse: https://console.cloud.google.com/
   - Vá em "APIs & Services" > "Credentials"
   - Edite seu OAuth 2.0 Client ID
   - Adicione nas "Authorized redirect URIs":
     - `https://seu-dominio.com/api/auth/callback/google`
   - Salve

2. **Atualizar .env**:
   ```env
   GOOGLE_CLIENT_ID=seu-novo-client-id
   GOOGLE_CLIENT_SECRET=seu-novo-client-secret
   ```

3. **Reiniciar aplicação**:
   ```bash
   pm2 restart hr-automation-suite
   ```

## 🔧 Passo 8: Configurar Stripe Webhooks (se usar)

Se você usa Stripe, precisa atualizar a URL do webhook:

1. **Stripe Dashboard**:
   - Acesse: https://dashboard.stripe.com/webhooks
   - Edite seu webhook
   - Atualize a URL para: `https://seu-dominio.com/api/stripe/webhook`
   - Salve

2. **Atualizar .env** (se necessário):
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## ✅ Checklist Final

- [ ] DNS apontando para o IP do servidor
- [ ] Nginx configurado com domínio
- [ ] Certificado SSL instalado e funcionando
- [ ] Variáveis de ambiente atualizadas
- [ ] Aplicação reiniciada
- [ ] HTTPS funcionando no navegador
- [ ] Google OAuth atualizado (se usar)
- [ ] Stripe Webhooks atualizado (se usar)
- [ ] Renovação automática de SSL configurada

## 🐛 Troubleshooting

### Erro: "Domain not pointing to this server"
- Verifique se o DNS está propagado: `dig seu-dominio.com`
- Aguarde alguns minutos para propagação DNS

### Erro: "Port 80 already in use"
- Verifique se há outro serviço usando a porta 80
- `sudo netstat -tulpn | grep :80`

### Certificado não renova automaticamente
- Verifique o timer: `sudo systemctl status certbot.timer`
- Ative o timer: `sudo systemctl enable certbot.timer`

### Nginx não inicia
- Teste configuração: `sudo nginx -t`
- Verifique logs: `sudo tail -f /var/log/nginx/error.log`

### Aplicação não carrega
- Verifique se PM2 está rodando: `pm2 status`
- Verifique logs: `pm2 logs hr-automation-suite`
- Verifique se a aplicação está na porta 3000: `netstat -tulpn | grep :3000`

## 📚 Referências

- [Certbot Documentation](https://certbot.eff.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
