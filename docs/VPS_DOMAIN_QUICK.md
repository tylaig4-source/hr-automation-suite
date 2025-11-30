# 🌐 Configurar Domínio - Passo a Passo Rápido

Guia direto para adicionar seu domínio (assumindo que Nginx já está configurado por IP).

## ✅ Pré-requisitos (já feitos)

- ✅ Nginx instalado e configurado
- ✅ Aplicação rodando com PM2
- ✅ Firewall configurado

## 🔧 Passo 1: Configurar DNS

### 1.1 Obter IP da VPS

```bash
curl ifconfig.me
```

Anote o IP (exemplo: `45.33.32.1`)

### 1.2 Configurar no Provedor de Domínio

Acesse o painel do seu provedor (Registro.br, GoDaddy, Namecheap, etc.) e adicione:

```
Registro 1:
Tipo: A
Nome: @ (ou deixe em branco)
Valor: SEU_IP_DA_VPS
TTL: 3600

Registro 2:
Tipo: A
Nome: www
Valor: SEU_IP_DA_VPS
TTL: 3600
```

**Exemplo:**
- Domínio: `meusistema.com`
- IP: `45.33.32.1`

```
A    @    45.33.32.1
A    www  45.33.32.1
```

### 1.3 Aguardar Propagação

Aguarde 5-30 minutos (pode levar até 48h, mas geralmente é rápido).

**Verificar propagação:**
```bash
# No seu computador local
nslookup meusistema.com
# Deve retornar o IP da VPS
```

---

## 🚀 Passo 2: Atualizar Configuração do Nginx

### 2.1 Editar Configuração Existente

```bash
sudo nano /etc/nginx/sites-available/hr-automation-suite
```

### 2.2 Atualizar server_name

Encontre a linha:
```nginx
server_name SEU_IP_OU_DOMINIO_ANTIGO;
```

E substitua por:
```nginx
server_name meusistema.com www.meusistema.com;
```

**Exemplo completo da configuração:**

```nginx
server {
    listen 80;
    server_name meusistema.com www.meusistema.com;  # ← ATUALIZE AQUI

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

### 2.3 Testar e Reiniciar

```bash
# Testar configuração
sudo nginx -t

# Se aparecer "syntax is ok", reinicie:
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
```

### 2.4 Testar (sem SSL ainda)

Acesse: `http://meusistema.com`

Deve funcionar! (mas ainda sem HTTPS)

---

## 🔒 Passo 3: Adicionar SSL (HTTPS)

### 3.1 Instalar Certbot (se ainda não instalou)

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 3.2 Obter Certificado SSL

```bash
# Substitua pelo seu domínio
sudo certbot --nginx -d meusistema.com -d www.meusistema.com
```

**Durante a instalação:**
1. **Email:** Digite seu email
2. **Termos:** Digite `A` para aceitar
3. **Compartilhar email:** Digite `N`
4. **Redirecionar HTTP → HTTPS:** Digite `2` (recomendado)

O Certbot vai:
- ✅ Obter certificado SSL
- ✅ Configurar HTTPS automaticamente
- ✅ Redirecionar HTTP para HTTPS

### 3.3 Verificar

```bash
# Ver certificados
sudo certbot certificates

# Testar renovação automática
sudo certbot renew --dry-run
```

---

## 🔧 Passo 4: Atualizar Variáveis de Ambiente

### 4.1 Editar .env.local

```bash
cd /var/www/hr-automation-suite
nano .env.local
```

### 4.2 Atualizar NEXTAUTH_URL

Encontre:
```env
NEXTAUTH_URL="http://localhost:3000"
```

E substitua por:
```env
NEXTAUTH_URL="https://meusistema.com"
NEXT_PUBLIC_APP_URL="https://meusistema.com"
```

### 4.3 Salvar e Reiniciar

```bash
# Salvar (Ctrl+X, Y, Enter no nano)

# Reiniciar aplicação
pm2 restart hr-automation-suite

# Verificar logs
pm2 logs hr-automation-suite
```

---

## ✅ Passo 5: Verificar Tudo

### 5.1 Testar Acesso

1. **HTTP (deve redirecionar):**
   - `http://meusistema.com` → deve redirecionar para HTTPS

2. **HTTPS (deve funcionar):**
   - `https://meusistema.com` → deve abrir com cadeado verde 🔒

### 5.2 Verificar Status

```bash
# Nginx
sudo systemctl status nginx

# PM2
pm2 status

# Logs
pm2 logs hr-automation-suite --lines 50
```

---

## 🐛 Troubleshooting Rápido

### Domínio não resolve

```bash
# Verificar DNS
nslookup meusistema.com
# Se não retornar o IP da VPS, aguarde mais tempo ou verifique DNS no provedor
```

### Certbot falha

```bash
# Verificar se porta 80 está aberta
sudo ufw status

# Verificar se Nginx está rodando
sudo systemctl status nginx

# Ver logs do Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### 502 Bad Gateway

```bash
# Verificar se aplicação está rodando
pm2 status

# Testar localmente
curl http://localhost:3000

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 📝 Resumo dos Comandos

```bash
# 1. Obter IP
curl ifconfig.me

# 2. Configurar DNS no provedor (manual)

# 3. Atualizar Nginx
sudo nano /etc/nginx/sites-available/hr-automation-suite
# (atualizar server_name)

sudo nginx -t
sudo systemctl restart nginx

# 4. Adicionar SSL
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d meusistema.com -d www.meusistema.com

# 5. Atualizar .env.local
nano .env.local
# (atualizar NEXTAUTH_URL)

# 6. Reiniciar
pm2 restart hr-automation-suite

# ✅ Pronto! Acesse: https://meusistema.com
```

---

## 💡 Dicas

- **Propagação DNS:** Pode levar 5-30 minutos, mas pode levar até 48h
- **Renovação SSL:** O Certbot renova automaticamente, não precisa fazer nada
- **Backup:** Faça backup da configuração: `sudo cp /etc/nginx/sites-available/hr-automation-suite ~/backup-nginx.conf`
