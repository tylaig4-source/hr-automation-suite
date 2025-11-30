// ===========================================
// HR AUTOMATION SUITE - Seed do Banco de Dados
// ===========================================

import { PrismaClient } from "@prisma/client";
import { categories, mvpAgents } from "../prompts";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // 1. Criar categorias
  console.log("📁 Criando categorias...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        orderIndex: category.orderIndex,
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
        orderIndex: category.orderIndex,
        isActive: true,
      },
    });
    console.log(`  ✅ ${category.name}`);
  }
  console.log(`  Total: ${categories.length} categorias\n`);

  // 2. Criar agentes do MVP
  console.log("🤖 Criando agentes...");
  for (const agent of mvpAgents) {
    // Buscar categoria pelo ID
    const category = await prisma.category.findFirst({
      where: { 
        OR: [
          { id: agent.categoryId },
          { slug: agent.categoryId }
        ]
      },
    });

    if (!category) {
      console.log(`  ⚠️ Categoria não encontrada para agente: ${agent.name}`);
      continue;
    }

    await prisma.agent.upsert({
      where: { slug: agent.slug },
      update: {
        name: agent.name,
        description: agent.description,
        shortDescription: agent.shortDescription,
        promptTemplate: agent.promptTemplate,
        systemPrompt: agent.systemPrompt,
        inputSchema: agent.inputSchema as any,
        estimatedTimeSaved: agent.estimatedTimeSaved,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        model: agent.model,
        isPremium: agent.isPremium || false,
      },
      create: {
        id: agent.id,
        categoryId: category.id,
        name: agent.name,
        slug: agent.slug,
        description: agent.description,
        shortDescription: agent.shortDescription,
        promptTemplate: agent.promptTemplate,
        systemPrompt: agent.systemPrompt,
        inputSchema: agent.inputSchema as any,
        estimatedTimeSaved: agent.estimatedTimeSaved,
        temperature: agent.temperature || 0.7,
        maxTokens: agent.maxTokens || 4000,
        model: agent.model || "gpt-4-turbo-preview",
        isPremium: agent.isPremium || false,
        isActive: true,
        version: 1,
      },
    });
    console.log(`  ✅ ${agent.name}`);
  }
  console.log(`  Total: ${mvpAgents.length} agentes\n`);

  // 3. Criar empresa demo (opcional)
  console.log("🏢 Criando empresa demo...");
  const demoCompany = await prisma.company.upsert({
    where: { slug: "empresa-demo" },
    update: {},
    create: {
      name: "Empresa Demo",
      slug: "empresa-demo",
      plan: "PROFESSIONAL",
      maxUsers: 10,
      maxExecutions: 500,
      settings: {
        theme: "light",
        language: "pt-BR",
      },
    },
  });
  console.log(`  ✅ ${demoCompany.name}\n`);

  // 4. Criar usuário admin demo (opcional)
  console.log("👤 Criando usuário admin demo...");
  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash("demo123", 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "Admin Demo",
      password: hashedPassword,
      role: "COMPANY_ADMIN",
      companyId: demoCompany.id,
    },
  });
  console.log(`  ✅ ${demoUser.email}\n`);

  console.log("✨ Seed concluído com sucesso!\n");
  console.log("📊 Resumo:");
  console.log(`   - ${categories.length} categorias`);
  console.log(`   - ${mvpAgents.length} agentes`);
  console.log(`   - 1 empresa demo`);
  console.log(`   - 1 usuário admin (admin@demo.com / demo123)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

