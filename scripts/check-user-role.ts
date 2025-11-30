/**
 * Script para verificar o role de um usuário
 * 
 * Uso:
 *   npx tsx scripts/check-user-role.ts <email>
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUserRole(email: string) {
  try {
    console.log(`Verificando usuário com email: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
      },
    });

    if (!user) {
      console.error(`❌ Usuário com email ${email} não encontrado.`);
      process.exit(1);
    }

    console.log("\n✅ Informações do usuário:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.name || "N/A"}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Company ID: ${user.companyId || "N/A"}`);
    
    if (user.role === "ADMIN") {
      console.log("\n✅ Usuário é ADMINISTRADOR");
      console.log("\n📝 Para o botão aparecer:");
      console.log("   1. Faça logout e login novamente");
      console.log("   2. Ou aguarde alguns segundos para a sessão atualizar");
      console.log("   3. Verifique o console do navegador para debug");
    } else {
      console.log("\n⚠️  Usuário NÃO é administrador");
      console.log("\n💡 Para tornar admin, execute:");
      console.log(`   npx tsx scripts/make-admin.ts ${email}`);
    }
  } catch (error) {
    console.error("❌ Erro ao verificar usuário:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar argumentos
const email = process.argv[2];

if (!email) {
  console.error("❌ Por favor, forneça um email como argumento.");
  console.log("\nUso:");
  console.log("  npx tsx scripts/check-user-role.ts <email>");
  console.log("\nExemplo:");
  console.log("  npx tsx scripts/check-user-role.ts admin@example.com");
  process.exit(1);
}

// Validar formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Email inválido: ${email}`);
  process.exit(1);
}

// Executar
checkUserRole(email);

