/**
 * Script para tornar um usuário admin
 * 
 * Uso:
 *   npx tsx scripts/make-admin.ts <email>
 * 
 * Exemplo:
 *   npx tsx scripts/make-admin.ts admin@example.com
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    console.log(`Procurando usuário com email: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      console.error(`❌ Usuário com email ${email} não encontrado.`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`✅ Usuário ${email} já é um administrador.`);
      await prisma.$disconnect();
      process.exit(0);
    }

    console.log(`Atualizando role de ${user.role} para ADMIN...`);

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`✅ Usuário ${email} agora é um administrador!`);
    console.log(`   Nome: ${updatedUser.name || "N/A"}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
  } catch (error) {
    console.error("❌ Erro ao tornar usuário admin:", error);
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
  console.log("  npx tsx scripts/make-admin.ts <email>");
  console.log("\nExemplo:");
  console.log("  npx tsx scripts/make-admin.ts admin@example.com");
  process.exit(1);
}

// Validar formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error(`❌ Email inválido: ${email}`);
  process.exit(1);
}

// Executar
makeAdmin(email);

