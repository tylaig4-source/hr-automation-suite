# Como Tornar um Usuário Admin

Este documento explica como tornar um usuário administrador no sistema.

## Método 1: Script CLI (Recomendado)

Use o script TypeScript para tornar um usuário admin via linha de comando:

```bash
npx tsx scripts/make-admin.ts <email>
```

### Exemplo:

```bash
npx tsx scripts/make-admin.ts admin@example.com
```

### Saída esperada:

```
Procurando usuário com email: admin@example.com...
Atualizando role de HR_ANALYST para ADMIN...
✅ Usuário admin@example.com agora é um administrador!
   Nome: João Silva
   Email: admin@example.com
   Role: ADMIN
```

## Método 2: API Route

Você também pode usar a API route diretamente:

```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com"}'
```

**Nota:** Esta rota não requer autenticação, então use apenas em desenvolvimento ou com proteção adequada em produção.

## Método 3: Prisma Studio

1. Abra o Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Navegue até a tabela `User`
3. Encontre o usuário pelo email
4. Edite o campo `role` para `ADMIN`
5. Salve as alterações

## Verificação

Após tornar um usuário admin:

1. O usuário precisa fazer logout e login novamente para que a sessão seja atualizada
2. O botão "Painel Admin" aparecerá no menu lateral do dashboard
3. O usuário poderá acessar todas as rotas `/admin/*`

## Permissões de Admin

Usuários com role `ADMIN` têm acesso a:

- `/admin` - Dashboard administrativo
- `/admin/companies` - Gerenciar empresas
- `/admin/subscriptions` - Gerenciar assinaturas
- `/admin/payments` - Ver pagamentos
- `/admin/prompts` - Editar prompts dos agentes
- `/admin/enterprise-requests` - Gerenciar solicitações Enterprise
- `/admin/settings` - Configurações do sistema

## Troubleshooting

### O botão admin não aparece

1. Verifique se o usuário realmente tem role `ADMIN` no banco de dados
2. Peça para o usuário fazer logout e login novamente
3. Limpe o cache do navegador
4. Verifique se o SessionProvider está configurado corretamente

### Erro: "Usuário não encontrado"

- Verifique se o email está correto
- Certifique-se de que o usuário existe no banco de dados
- Verifique a conexão com o banco de dados

