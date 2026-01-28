# PIX Parcelado - Informações e Status

## 📋 Resumo

O **PIX Parcelado** é uma nova funcionalidade anunciada pelo Banco Central do Brasil que permitirá que consumidores realizem pagamentos parcelados utilizando o PIX, enquanto os comerciantes receberão o valor integral imediatamente.

## 📅 Status Atual

### Lançamento
- **Data de lançamento prevista**: Setembro de 2025
- **Status**: Ainda não disponível
- **Fonte**: [Reuters - Brazil Central Bank](https://www.reuters.com/technology/brazil-central-bank-launch-pix-installment-feature-september-2025-04-03/)

### Funcionalidade
A funcionalidade visa:
- Expandir o uso do PIX para compras de maior valor
- Oferecer alternativas para aqueles sem acesso ao crédito tradicional
- Permitir parcelamento sem necessidade de cartão de crédito

## 🔌 Integração com Stripe

### Status Atual do Stripe
- **PIX no Stripe**: ✅ Disponível
  - O Stripe já oferece suporte ao PIX como método de pagamento no Brasil
  - Permite que clientes escolham PIX durante o checkout
  - Gera código QR ou chave PIX para pagamento
  - Pagamentos são processados em tempo real

### PIX Parcelado no Stripe
- **Status**: ❌ Ainda não disponível
- **Razão**: A funcionalidade ainda não foi lançada pelo Banco Central
- **Ação necessária**: Aguardar lançamento oficial e verificar se o Stripe oferecerá suporte

## 📚 Documentação

### PIX no Stripe
- [Stripe PIX Payment Method](https://stripe.com/br/payment-method/pix)
- [Stripe Payment Element](https://stripe.com/docs/payments/payment-element)

### PIX Parcelado
- [Banco Central do Brasil - PIX Parcelado](https://www.bcb.gov.br) (quando disponível)
- [Reuters - Anúncio do PIX Parcelado](https://www.reuters.com/technology/brazil-central-bank-launch-pix-installment-feature-september-2025-04-03/)

## 🚀 Implementação Futura

Quando o PIX Parcelado estiver disponível:

1. **Verificar disponibilidade no Stripe**
   - Acompanhar atualizações do Stripe para suporte ao PIX Parcelado
   - Verificar documentação oficial

2. **Implementar no sistema**
   - Adicionar opção de parcelamento PIX no checkout
   - Configurar número de parcelas disponíveis
   - Atualizar UI para mostrar opções de parcelamento

3. **Testes**
   - Testar fluxo completo de pagamento parcelado
   - Validar recebimento imediato do valor total
   - Verificar processamento de parcelas

## 📝 Notas

- O PIX Parcelado será uma funcionalidade do Banco Central, não do Stripe
- O Stripe precisará implementar suporte após o lançamento oficial
- Recomenda-se acompanhar atualizações do Stripe e do Banco Central
- Atualmente, o PIX no Stripe funciona apenas para pagamentos à vista

## 🔗 Links Úteis

- [Stripe Brasil](https://stripe.com/br)
- [Banco Central do Brasil](https://www.bcb.gov.br)
- [Documentação Stripe PIX](https://stripe.com/docs/payments/pix)

---

**Última atualização**: Dezembro 2024
**Próxima revisão**: Setembro 2025 (após lançamento oficial)

