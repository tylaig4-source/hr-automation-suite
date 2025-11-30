# 🌐 Configurar Domínio na VPS

Guia completo para configurar seu domínio personalizado com SSL gratuito (Let's Encrypt).

## 📋 Pré-requisitos

1. ✅ Domínio comprado e configurado
2. ✅ Acesso ao painel do seu provedor de domínio (Registro.br, GoDaddy, etc.)
3. ✅ VPS com IP público
4. ✅ Aplicação rodando com PM2

## 🔧 Passo 1: Configurar DNS do Domínio

### 1.1 Obter IP da VPS

```bash
# Na sua VPS, execute:
curl ifconfig.me
# Ou
hostname -I
```

Anote o IP que aparecer (exemplo: `45.33.32.1`)

### 1.2 Configurar DNS no Provedor

Acesse o painel do seu provedor de domínio e configure os registros DNS:

#### Opção A: Registro A (Recomendado)

```
Tipo: A
Nome: @ (ou deixe em branco)
Valor: SEU_IP_DA_VPS
TTL: 3600 (ou padrão)
```

#### Opção B: Subdomínio (ex: app.seudominio.com)

```
Tipo: A
Nome: app
Valor: SEU_IP_DA_VPS
TTL: 3600
```

#### Opção C: Com www

Crie dois registros:

```
Registro 1:
Tipo: A
Nome: @
Valor: SEU_IP_DA_VPS

Registro 2:
Tipo: A
Nome: www
Valor: SEU_IP_DA_VPS
```

**Exemplo prático:**
- Domínio: `meusistema.com`
- IP da VPS: `45.33.32.1`

Configuração:
```
A    @    45.33.32.1
A    www  45.33.32.1
```

### 1.3 Verificar Propagação DNS

Aguarde alguns minutos (pode levar até 48h, mas geralmente é rápido) e verifique:

```bash
# No seu computador local, execute:
nslookup meusistema.com
# Ou
dig meusistema.com

# Deve retornar o IP da sua VPS
```

**Ou use ferramentas online:**
- https://dnschecker.org
- https://www.whatsmydns.net

---

## 🚀 Passo 2: Instalar e Configurar Nginx

### 2.1 Instalar Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

### 2.2 Criar Configuração do Domínio

```bash
sudo nano /etc/nginx/sites-available/hr-automation-suite
```

Cole este conteúdo (substitua `meusistema.com` pelo seu domínio):

```nginx
server {
    listen 80;
    server_name meusistema.com www.meusistema.com;

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
        
        # Timeouts para evitar erros
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Se usar subdomínio (ex: app.seudominio.com):**
```nginx
server {
    listen 80;
    server_name app.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        # ... resto igual acima
    }
}
```

### 2.3 Ativar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/hr-automation-suite /etc/nginx/sites-enabled/

# Remover site padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Se aparecer "syntax is ok", reinicie:
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
```

### 2.4 Abrir Portas no Firewall

```bash
# Permitir HTTP (porta 80)
sudo ufw allow 80/tcp

# Permitir HTTPS (porta 443)
sudo ufw allow 443/tcp

# Verificar
sudo ufw status
```

### 2.5 Testar (sem SSL ainda)

Acesse no navegador: `http://meusistema.com`

Deve funcionar! (mas ainda sem SSL, então aparecerá "Não seguro")

---

## 🔒 Passo 3: Configurar SSL com Let's Encrypt (HTTPS)

### 3.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3.2 Obter Certificado SSL

```bash
# Substitua pelo seu domínio
sudo certbot --nginx -d meusistema.com -d www.meusistema.com
```

**Ou se usar subdomínio:**
```bash
sudo certbot --nginx -d app.seudominio.com
```

### 3.3 Durante a Instalação

O Certbot vai perguntar:

1. **Email:** Digite seu email (para notificações de renovação)
2. **Termos:** Digite `A` para aceitar
3. **Compartilhar email:** Digite `N` (não compartilhar)
4. **Redirecionar HTTP para HTTPS:** Digite `2` (recomendado)

### 3.4 Verificar Renovação Automática

```bash
# Testar renovação (não renova de verdade, só testa)
sudo certbot renew --dry-run
```

O certificado será renovado automaticamente antes de expirar.

### 3.5 Verificar Certificado

```bash
# Ver certificados instalados
sudo certbot certificates
```

---

## ✅ Passo 4: Verificar Tudo

### 4.1 Verificar Nginx

```bash
# Verificar status
sudo systemctl status nginx

# Verificar configuração
sudo nginx -t

# Ver logs (se houver problemas)
sudo tail -f /var/log/nginx/error.log
```

### 4.2 Verificar PM2

```bash
# Ver status da aplicação
pm2 status

# Ver logs
pm2 logs hr-automation-suite
```

### 4.3 Testar Acesso

1. **HTTP (deve redirecionar para HTTPS):**
   - `http://meusistema.com` → deve redirecionar para HTTPS

2. **HTTPS (deve funcionar):**
   - `https://meusistema.com` → deve abrir com cadeado verde 🔒

3. **Testar de outro computador:**
   - Acesse de qualquer lugar: `https://meusistema.com`

---

## 🔧 Passo 5: Atualizar Variáveis de Ambiente

### 5.1 Atualizar NEXTAUTH_URL

```bash
cd /var/www/hr-automation-suite
nano .env.local
```

Atualize:

```env
# Antes (exemplo):
NEXTAUTH_URL="http://localhost:3000"

# Depois:
NEXTAUTH_URL="https://meusistema.com"
```

### 5.2 Reiniciar Aplicação

```bash
pm2 restart hr-automation-suite
```

---

## 🐛 Troubleshooting

### Domínio não resolve

1. **Verificar DNS:**
   ```bash
   nslookup meusistema.com
   # Deve retornar o IP da VPS
   ```

2. **Aguardar propagação:**
   - DNS pode levar até 48h para propagar
   - Geralmente leva 5-30 minutos

3. **Verificar configuração no provedor:**
   - Confirme que o registro A está correto
   - Verifique se não há cache DNS

### Certbot falha

1. **Verificar se porta 80 está aberta:**
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   ```

2. **Verificar se Nginx está rodando:**
   ```bash
   sudo systemctl status nginx
   ```

3. **Verificar se domínio aponta para VPS:**
   ```bash
   dig meusistema.com
   # Deve retornar IP da VPS
   ```

4. **Ver logs do Certbot:**
   ```bash
   sudo tail -f /var/log/letsencrypt/letsencrypt.log
   ```

### Nginx retorna 502 Bad Gateway

1. **Verificar se aplicação está rodando:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

2. **Verificar proxy_pass:**
   ```bash
   sudo nano /etc/nginx/sites-available/hr-automation-suite
   # Deve ter: proxy_pass http://localhost:3000;
   ```

3. **Reiniciar Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

### Certificado não renova automaticamente

O Certbot cria um cron job automaticamente. Verificar:

```bash
# Ver cron jobs
sudo crontab -l

# Ou verificar timer do systemd
sudo systemctl status certbot.timer
```

---

## 📝 Exemplo Completo

**Cenário:**
- Domínio: `meusistema.com`
- IP da VPS: `45.33.32.1`
- Aplicação rodando em `localhost:3000`

**Comandos:**

```bash
# 1. Configurar DNS no provedor:
# A    @    45.33.32.1
# A    www  45.33.32.1

# 2. Aguardar propagação (5-30 min)

# 3. Instalar Nginx
sudo apt install -y nginx

# 4. Criar configuração
sudo nano /etc/nginx/sites-available/hr-automation-suite
# (cole a configuração acima com meusistema.com)

# 5. Ativar
sudo ln -s /etc/nginx/sites-available/hr-automation-suite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6. Abrir portas
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 7. Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# 8. Obter SSL
sudo certbot --nginx -d meusistema.com -d www.meusistema.com

# 9. Atualizar .env.local
nano .env.local
# NEXTAUTH_URL="https://meusistema.com"

# 10. Reiniciar
pm2 restart hr-automation-suite

# ✅ Pronto! Acesse: https://meusistema.com
```

---

## 🔗 Próximos Passos

1. ✅ Domínio configurado
2. ✅ SSL ativado
3. ✅ Aplicação acessível via HTTPS
4. 🔄 Configure backups regulares
5. 🔄 Configure monitoramento
6. 🔄 Configure email (SMTP) se necessário

---

## 💡 Dicas

- **Renovação automática:** O Certbot renova automaticamente, mas verifique periodicamente
- **Backup:** Faça backup da configuração do Nginx: `sudo cp /etc/nginx/sites-available/hr-automation-suite ~/`
- **Monitoramento:** Configure alertas para quando o certificado estiver próximo de expirar
- **Performance:** Considere adicionar cache no Nginx para melhorar performance

