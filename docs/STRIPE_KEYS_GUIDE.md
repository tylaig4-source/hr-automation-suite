# 🔑 Guia Completo: Como Obter as Chaves do Stripe

## 📋 Variáveis Necessárias

Você precisa de **3 chaves** do Stripe:

1. **STRIPE_SECRET_KEY** (Chave Secreta)
2. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** (Chave Pública)
3. **STRIPE_WEBHOOK_SECRET** (Secret do Webhook) - Opcional, mas recomendado

---

## 🎯 Onde Conseguir no Stripe

### 1. Acessar o Dashboard do Stripe

1. Acesse: https://dashboard.stripe.com
2. Faça login na sua conta
3. Se não tiver conta, crie uma em: https://dashboard.stripe.com/register

### 2. Escolher o Ambiente

O Stripe tem **2 ambientes**:

- **Teste (Test Mode)**: Para desenvolvimento e testes
- **Produção (Live Mode)**: Para pagamentos reais

**Importante:** Use o **Test Mode** primeiro para testar sem cobranças reais!

Para alternar entre os modos, use o toggle no canto superior direito do dashboard.

---

## 🔐 Passo a Passo: Obter as Chaves

### Passo 1: Obter Chave Secreta e Chave Pública

1. No Dashboard do Stripe, vá em:
   - **Desenvolvedores** → **Chaves de API** (ou **Developers** → **API keys**)

2. Você verá duas chaves:

   **a) Chave Secreta (Secret key)**
   - Formato: `sk_test_...` (teste) ou `sk_live_...` (produção)
   - Esta é a **STRIPE_SECRET_KEY**
   - ⚠️ **NUNCA compartilhe esta chave!** Ela dá acesso total à sua conta
   - Clique em **"Revelar chave de teste"** para ver

   **b) Chave publicável (Publishable key)**
   - Formato: `pk_test_...` (teste) ou `pk_live_...` (produção)
   - Esta é a **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Esta chave pode ser exposta no frontend (é segura)

3. **Copie as duas chaves** e guarde em local seguro

### Passo 2: Obter Webhook Secret (Opcional mas Recomendado)

1. No Dashboard do Stripe, vá em:
   - **Desenvolvedores** → **Webhooks** (ou **Developers** → **Webhooks**)

2. Clique em **"Adicionar endpoint"** (ou **"Add endpoint"**)

3. Configure o webhook:
   - **URL do endpoint**: `https://seu-dominio.com/api/stripe/webhook`
   - **Descrição**: "HR Automation Suite Webhook"
   - **Eventos para enviar**: Selecione os eventos:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `charge.refunded`

4. Clique em **"Adicionar endpoint"**

5. Após criar, clique no endpoint criado

6. Na seção **"Assinatura"** (ou **"Signing secret"**), você verá:
   - **Secret do webhook**: `whsec_...`
   - Esta é a **STRIPE_WEBHOOK_SECRET**
   - Clique em **"Revelar"** para ver o secret completo

7. **Copie o secret** e guarde em local seguro

---

## 📝 Como Configurar no Sistema

### Opção 1: Via Frontend (Recomendado)

1. Acesse o painel admin: `https://seu-dominio.com/admin/settings`
2. Na seção **"Integração Stripe"**:
   - Cole a **Chave Secreta** (Secret Key)
   - Cole a **Chave Pública** (Publishable Key)
   - Opcional: Cole o **Webhook Secret**
3. Clique em **"Salvar Configurações"**
4. Clique em **"Testar Conexão"** para verificar

### Opção 2: Via Variáveis de Ambiente (Fallback)

Se preferir usar variáveis de ambiente (ou como fallback):

1. Edite o arquivo `.env.local` ou `.env`:

```env
# Chave Secreta do Stripe
STRIPE_SECRET_KEY="sk_test_51ABC..."

# Chave Pública do Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51ABC..."

# Secret do Webhook (opcional)
STRIPE_WEBHOOK_SECRET="whsec_ABC..."
```

2. Reinicie a aplicação

---

## 🔍 Links Diretos

### Ambiente de Teste
- **Chaves de API**: https://dashboard.stripe.com/test/apikeys
- **Webhooks**: https://dashboard.stripe.com/test/webhooks

### Ambiente de Produção
- **Chaves de API**: https://dashboard.stripe.com/apikeys
- **Webhooks**: https://dashboard.stripe.com/webhooks

---

## ⚠️ Importante

### Segurança
- ✅ **Chave Secreta**: NUNCA exponha no frontend ou em repositórios públicos
- ✅ **Chave Pública**: Pode ser exposta (é segura para frontend)
- ✅ **Webhook Secret**: NUNCA exponha publicamente

### Ambientes
- 🧪 **Test Mode**: Use para desenvolvimento e testes
- 🚀 **Live Mode**: Use apenas em produção com pagamentos reais

### Teste de Cartões
No ambiente de teste, você pode usar cartões de teste:
- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **CVV**: Qualquer 3 dígitos
- **Data**: Qualquer data futura

Mais cartões de teste: https://stripe.com/docs/testing

---

## ✅ Checklist

- [ ] Conta Stripe criada
- [ ] Ambiente escolhido (Test ou Live)
- [ ] Chave Secreta copiada
- [ ] Chave Pública copiada
- [ ] Webhook configurado (opcional)
- [ ] Webhook Secret copiado (se configurado)
- [ ] Chaves configuradas no sistema (via frontend ou .env)
- [ ] Conexão testada com sucesso

---

## 🆘 Problemas Comuns

### "Não foi possível conectar ao Stripe"
- Verifique se a chave secreta está correta
- Verifique se está usando a chave do ambiente correto (test/live)
- Verifique se a chave não expirou

### "Webhook não funciona"
- Verifique se a URL do webhook está correta
- Verifique se o webhook secret está configurado
- Verifique se os eventos estão selecionados no Stripe

### "Erro ao criar subscription"
- Verifique se os planos foram sincronizados com o Stripe
- Verifique se os price IDs existem no banco
- Verifique se o customer foi criado primeiro

