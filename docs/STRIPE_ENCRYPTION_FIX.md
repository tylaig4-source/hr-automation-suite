# 🔐 Problema: Erro "bad decrypt" ao sincronizar Stripe

## 🐛 Sintoma

Erro ao tentar sincronizar planos com Stripe:
```
[Encryption] Erro ao descriptografar: Error: error:1C800064:Provider routines::bad decrypt
[Stripe Settings] Erro ao descriptografar chave: Error: Erro ao descriptografar valor
[Sync Stripe] Erro: Chave secreta do Stripe não encontrada no banco de dados
```

## 🔍 Causa

A chave de criptografia (`ENCRYPTION_KEY`) não está configurada no `.env` ou mudou entre restarts.

Quando `ENCRYPTION_KEY` não está definida, o sistema gera uma nova chave aleatória a cada restart. Isso significa que:
- Dados criptografados com uma chave não podem ser descriptografados com outra chave
- As chaves do Stripe salvas no banco não podem ser descriptografadas

## ✅ Solução

### 1. Gerar uma chave de criptografia

```bash
openssl rand -hex 32
```

Isso gerará uma string de 64 caracteres hexadecimais, por exemplo:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 2. Adicionar ao `.env`

Adicione a chave gerada ao arquivo `.env` na VPS:

```bash
# No servidor
cd /var/www/hr-automation-suite
nano .env
```

Adicione:
```env
ENCRYPTION_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
```

### 3. Reconfigurar chaves do Stripe

Como as chaves antigas não podem ser descriptografadas, você precisa reconfigurá-las:

1. Acesse `/admin/settings`
2. Remova as chaves atuais (ou deixe em branco)
3. Cole as chaves do Stripe novamente:
   - Chave Secreta (Secret Key)
   - Chave Pública (Publishable Key)
   - Webhook Secret (opcional)
4. Clique em "Salvar Configurações"

### 4. Reiniciar aplicação

```bash
pm2 restart hr-automation-suite
```

### 5. Testar sincronização

1. Acesse `/admin/plans`
2. Clique em "Sincronizar com Stripe"
3. Verifique se funciona corretamente

## ⚠️ Importante

- **NUNCA mude `ENCRYPTION_KEY` após ter dados criptografados no banco**
- **Mantenha `ENCRYPTION_KEY` segura e nunca a compartilhe**
- **Faça backup da `ENCRYPTION_KEY` em local seguro**
- **Se precisar mudar a chave, você precisará reconfigurar todos os dados criptografados**

## 🔄 Se precisar mudar a chave

Se você realmente precisar mudar `ENCRYPTION_KEY`:

1. Reconfigure todas as chaves do Stripe em `/admin/settings`
2. Qualquer outro dado criptografado também precisará ser reconfigurado

## 📝 Verificação

Após configurar `ENCRYPTION_KEY`, verifique os logs:

```bash
pm2 logs hr-automation-suite --lines 20
```

Você NÃO deve ver mais o aviso:
```
[Encryption] ⚠️ ENCRYPTION_KEY não definida no .env
```

E deve ver:
```
[Stripe Settings] Chave descriptografada (tamanho: XXX)
```

