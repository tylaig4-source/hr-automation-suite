# Verificação de Assinaturas Expiradas

Este documento explica como funciona e como configurar a verificação automática de assinaturas expiradas.

## 📋 Funcionalidade

O sistema possui uma função que verifica e atualiza automaticamente o status de assinaturas que podem ter expirado:

- **Assinaturas ACTIVE** com `nextDueDate` no passado
- **Assinaturas OVERDUE** há mais de 30 dias (marcadas como EXPIRED)

### O que a função faz:

1. Busca assinaturas que podem estar expiradas
2. Verifica o status real no Stripe (se disponível)
3. Atualiza o status no banco de dados
4. Cria notificações para os usuários afetados
5. Retorna um relatório com os resultados

## 🔧 Como Usar

### 1. Verificação Manual (via API)

#### Verificar sem atualizar (GET)
```bash
curl -X GET http://localhost:3000/api/admin/subscriptions/check-expired \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"
```

Retorna uma lista de assinaturas que precisam ser verificadas.

#### Executar verificação e atualização (POST)
```bash
curl -X POST http://localhost:3000/api/admin/subscriptions/check-expired \
  -H "Cookie: next-auth.session-token=SEU_TOKEN"
```

Retorna:
```json
{
  "success": true,
  "message": "Verificação de assinaturas expiradas concluída",
  "results": {
    "checked": 5,
    "expired": 2,
    "updated": 2,
    "errors": []
  }
}
```

**⚠️ Requer autenticação como ADMIN**

### 2. Configurar Cron Job (Recomendado)

Para verificar automaticamente, configure um cron job no servidor:

#### Opção 1: Cron Job no Linux/Mac

Edite o crontab:
```bash
crontab -e
```

Adicione uma linha para executar diariamente às 2h da manhã:
```bash
0 2 * * * curl -X POST https://seu-dominio.com/api/admin/subscriptions/check-expired -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

#### Opção 2: Usando Vercel Cron (se hospedado na Vercel)

Crie `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/admin/subscriptions/check-expired",
      "schedule": "0 2 * * *"
    }
  ]
}
```

#### Opção 3: Usando Node-Cron (se rodando em servidor próprio)

Instale o pacote:
```bash
npm install node-cron
```

Crie um arquivo `scripts/check-subscriptions.ts`:
```typescript
import cron from 'node-cron';
import { checkAndUpdateExpiredSubscriptions } from '@/lib/subscription-utils';

// Executar diariamente às 2h da manhã
cron.schedule('0 2 * * *', async () => {
  console.log('[Cron] Verificando assinaturas expiradas...');
  const results = await checkAndUpdateExpiredSubscriptions();
  console.log('[Cron] Resultado:', results);
});
```

## 🔐 Autenticação para API

Para chamar a API, você precisa estar autenticado como ADMIN. Duas opções:

### Opção 1: Usar Cookie de Sessão
Faça login no sistema e use o cookie `next-auth.session-token` nas requisições.

### Opção 2: Criar Token de API (Recomendado para Cron)

Crie uma rota de API interna que valide um token secreto:

```typescript
// src/app/api/admin/subscriptions/check-expired/route.ts
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: NextRequest) {
  // Verificar token secreto no header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  
  // ... resto do código
}
```

E configure no `.env`:
```
CRON_SECRET=seu-token-secreto-aqui
```

## 📊 Status de Assinaturas

A função verifica e atualiza os seguintes status:

- **ACTIVE** → **EXPIRED**: Se `nextDueDate` passou
- **OVERDUE** → **EXPIRED**: Se está OVERDUE há mais de 30 dias
- **ACTIVE** → **ACTIVE**: Se verificado no Stripe e ainda está ativa (atualiza `nextDueDate`)

## 🔔 Notificações

Quando uma assinatura é marcada como EXPIRED, o sistema:

1. Atualiza o status no banco
2. Define `endDate` como a data atual
3. Cria notificações para **todos os usuários** da empresa
4. Bloqueia acesso aos agentes (via `canExecuteAgents`)

## ⚙️ Configuração Recomendada

**Frequência:** Diária (1x por dia)
**Horário:** Madrugada (2h-4h) para evitar impacto nos usuários
**Timeout:** A função pode demorar se houver muitas assinaturas para verificar

## 🐛 Troubleshooting

### Erro: "Não autorizado"
- Verifique se está autenticado como ADMIN
- Verifique se o token/cookie está válido

### Erro: "Erro ao verificar Stripe"
- Verifique se as chaves do Stripe estão configuradas
- Verifique se a assinatura tem `stripeSubscriptionId`

### Assinaturas não estão sendo atualizadas
- Verifique se o cron job está rodando
- Verifique os logs do servidor
- Execute manualmente via API para testar

## 📝 Exemplo de Resposta

```json
{
  "success": true,
  "message": "Verificação de assinaturas expiradas concluída",
  "results": {
    "checked": 10,
    "expired": 2,
    "updated": 3,
    "errors": [
      "Erro ao verificar Stripe para subscription abc123: Subscription not found"
    ]
  }
}
```

