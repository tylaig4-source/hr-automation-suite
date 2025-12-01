# Sincronização de Planos com Stripe

## 📋 Visão Geral

O sistema permite sincronizar automaticamente os planos configurados no painel admin com o Stripe, criando produtos e prices (preços) automaticamente. Isso elimina a necessidade de criar manualmente produtos e assinaturas no Stripe Dashboard.

## 🚀 Como Funciona

### 1. Configuração Inicial

1. Configure a chave secreta do Stripe no `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_live_... ou sk_test_...
   ```

2. Certifique-se de que os planos estão cadastrados no banco de dados:
   - Execute `npm run db:seed` para criar os planos iniciais
   - Ou configure manualmente no painel admin em `/admin/plans`

### 2. Sincronização

1. Acesse o painel admin: `/admin/plans`
2. Clique no botão **"Sincronizar com Stripe"**
3. O sistema irá:
   - Criar produtos no Stripe para cada plano ativo
   - Criar prices (preços) mensais e anuais
   - Atualizar os planos no banco com os IDs do Stripe

### 3. O Que é Criado no Stripe

Para cada plano sincronizado:

- **Produto (Product)**: Representa o plano (ex: "Professional")
- **Price Mensal**: Preço recorrente mensal (ex: R$ 597/mês)
- **Price Anual**: Preço recorrente anual (ex: R$ 497/mês)

**Nota**: Planos de trial (gratuitos) são pulados automaticamente.

## 📝 Detalhes Técnicos

### Campos Sincronizados

- **Nome do Plano** → Nome do produto no Stripe
- **Descrição** → Descrição do produto
- **Preço Mensal** → Price com intervalo mensal
- **Preço Anual** → Price com intervalo anual
- **Plan ID** → Metadata no Stripe

### IDs Armazenados

Após a sincronização, os seguintes IDs são salvos no banco:

- `stripePriceIdMonthly`: ID do price mensal (ex: `price_1ABC...`)
- `stripePriceIdYearly`: ID do price anual (ex: `price_1XYZ...`)

### API Endpoint

```
POST /api/admin/plans/sync-stripe
```

**Body (opcional)**:
```json
{
  "planId": "plan_id_especifico" // Se fornecido, sincroniza apenas um plano
}
```

**Resposta**:
```json
{
  "success": true,
  "message": "Sincronização concluída: 2 sucesso, 0 erros, 1 pulados",
  "results": [
    {
      "planId": "PROFESSIONAL",
      "name": "Professional",
      "status": "success",
      "productId": "prod_...",
      "monthlyPriceId": "price_...",
      "yearlyPriceId": "price_..."
    }
  ],
  "summary": {
    "total": 3,
    "success": 2,
    "errors": 0,
    "skipped": 1
  }
}
```

## ⚠️ Importante

1. **Não é necessário criar produtos manualmente no Stripe** - A sincronização faz isso automaticamente
2. **Planos de trial são ignorados** - Apenas planos com preço são sincronizados
3. **Produtos duplicados são evitados** - Se um produto com o mesmo nome já existe, ele é reutilizado
4. **IDs são atualizados automaticamente** - Os IDs do Stripe são salvos nos planos do banco

## 🔄 Re-sincronização

Você pode sincronizar novamente a qualquer momento:

- Se um plano foi editado (preço, nome, etc.), sincronize novamente
- O sistema criará novos prices se necessário
- Produtos existentes são reutilizados

## 🐛 Troubleshooting

### Erro: "Stripe não está configurado"
- Verifique se `STRIPE_SECRET_KEY` está configurado no `.env`
- Certifique-se de que a chave não é `sk_test_dummy`

### Erro: "Nenhum plano encontrado"
- Execute `npm run db:seed` para criar os planos iniciais
- Ou crie planos manualmente no painel admin

### IDs não aparecem após sincronização
- Recarregue a página
- Verifique os logs do servidor para erros
- Confirme que o Stripe está acessível

## 📚 Referências

- [Stripe Products API](https://stripe.com/docs/api/products)
- [Stripe Prices API](https://stripe.com/docs/api/prices)
- [Stripe Recurring Billing](https://stripe.com/docs/billing/subscriptions/overview)

