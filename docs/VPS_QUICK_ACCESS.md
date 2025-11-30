# 🌐 Tornar Aplicação Acessível na Web

Após iniciar com PM2, a aplicação roda em `localhost:3000` na VPS. Para acessar de outros locais, você tem 2 opções:

## Opção 1: Acesso Direto via IP e Porta (Rápido)

### 1.1 Abrir Porta no Firewall

```bash
# Permitir porta 3000 no firewall
sudo ufw allow 3000/tcp

# Verificar status
sudo ufw status
```

### 1.2 Acessar

- **URL:** `http://SEU_IP_DA_VPS:3000`
- Exemplo: `http://192.168.1.100:3000` ou `http://45.33.32.1:3000`

**⚠️ Nota:** Esta opção expõe a aplicação diretamente. Use apenas para testes ou se tiver domínio com SSL.

---

## Opção 2: Usar Nginx como Reverse Proxy (Recomendado)

Esta é a opção recomendada para produção. Nginx fica na porta 80/443 e redireciona para sua aplicação.

### 2.1 Instalar Nginx (se ainda não instalou)

```bash
sudo apt update
sudo apt install -y nginx
```

### 2.2 Criar Configuração Nginx

```bash
sudo nano /etc/nginx/sites-available/hr-automation-suite
```

Cole este conteúdo (substitua `SEU_IP_OU_DOMINIO` pelo seu IP ou domínio):

```nginx
server {
    listen 80;
    server_name SEU_IP_OU_DOMINIO;

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

**Exemplo com IP:**
```nginx
server {
    listen 80;
    server_name 192.168.1.100;  # Seu IP da VPS

    location / {
        proxy_pass http://localhost:3000;
        # ... resto igual
    }
}
```

**Exemplo com domínio:**
```nginx
server {
    listen 80;
    server_name meudominio.com www.meudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        # ... resto igual
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

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
```

### 2.4 Abrir Porta 80 no Firewall

```bash
# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS (se for usar SSL)
sudo ufw allow 443/tcp

# Verificar
sudo ufw status
```

### 2.5 Acessar

- **Com IP:** `http://SEU_IP_DA_VPS`
- **Com domínio:** `http://meudominio.com`

---

## 🔒 Opção 3: Adicionar SSL com Let's Encrypt (Recomendado para Produção)

Se você tem um domínio, configure SSL gratuito:

### 3.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3.2 Obter Certificado SSL

```bash
# Substitua pelo seu domínio
sudo certbot --nginx -d meudominio.com -d www.meudominio.com
```

Siga as instruções:
- Digite seu email
- Aceite os termos
- Escolha se quer redirecionar HTTP para HTTPS (recomendado: 2)

### 3.3 Verificar Renovação Automática

```bash
# Testar renovação
sudo certbot renew --dry-run
```

O certificado será renovado automaticamente.

### 3.4 Acessar

- **URL:** `https://meudominio.com` (com SSL!)

---

## ✅ Verificar se Está Funcionando

### Verificar PM2

```bash
pm2 status
pm2 logs hr-automation-suite
```

### Verificar Nginx

```bash
sudo systemctl status nginx
sudo nginx -t
```

### Testar Localmente na VPS

```bash
# Testar aplicação diretamente
curl http://localhost:3000

# Testar via Nginx (se configurado)
curl http://localhost
```

### Testar de Fora

Abra no navegador:
- **Opção 1:** `http://SEU_IP:3000`
- **Opção 2:** `http://SEU_IP` (com Nginx)
- **Opção 3:** `https://meudominio.com` (com SSL)

---

## 🐛 Troubleshooting

### Não consegue acessar de fora

1. **Verificar firewall:**
   ```bash
   sudo ufw status
   # Se porta não estiver aberta, abra:
   sudo ufw allow 3000/tcp  # Opção 1
   # ou
   sudo ufw allow 80/tcp    # Opção 2
   ```

2. **Verificar se aplicação está rodando:**
   ```bash
   pm2 status
   curl http://localhost:3000
   ```

3. **Verificar se porta está escutando:**
   ```bash
   sudo netstat -tulpn | grep 3000
   # Deve mostrar algo como: tcp 0.0.0.0:3000 LISTEN
   ```

4. **Verificar logs:**
   ```bash
   pm2 logs hr-automation-suite
   sudo tail -f /var/log/nginx/error.log
   ```

### Nginx retorna 502 Bad Gateway

1. **Verificar se aplicação está rodando:**
   ```bash
   pm2 status
   ```

2. **Verificar se proxy_pass está correto:**
   ```bash
   sudo nano /etc/nginx/sites-available/hr-automation-suite
   # Deve ter: proxy_pass http://localhost:3000;
   ```

3. **Reiniciar Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

### Porta já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :3000
sudo lsof -i :80

# Parar processo ou mudar porta no ecosystem.config.js
```

---

## 📝 Resumo Rápido

**Para acesso rápido (testes):**
```bash
sudo ufw allow 3000/tcp
# Acesse: http://SEU_IP:3000
```

**Para produção (recomendado):**
```bash
# 1. Configurar Nginx (passos acima)
# 2. Abrir porta 80
sudo ufw allow 80/tcp
# 3. Acesse: http://SEU_IP ou http://meudominio.com
# 4. (Opcional) Adicionar SSL com certbot
```

**Status atual:**
- ✅ PM2 rodando → Aplicação em `localhost:3000`
- ⚠️ Precisa abrir porta OU configurar Nginx para acessar de fora

