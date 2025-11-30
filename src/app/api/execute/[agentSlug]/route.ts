import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAICompletion, buildPromptFromTemplate, type AIProvider } from "@/lib/ai-providers";
import { checkRateLimit, CacheKeys } from "@/lib/redis";
import { getAgentBySlug } from "../../../../../prompts";

const executeSchema = z.object({
  inputs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.undefined()])),
  provider: z.enum(["openai", "gemini", "auto"]).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { agentSlug: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Buscar agente
    const agent = getAgentBySlug(params.agentSlug);
    if (!agent) {
      return NextResponse.json(
        { error: "Agente não encontrado" },
        { status: 404 }
      );
    }

    // Validar inputs
    const body = await request.json();
    const { inputs, provider } = executeSchema.parse(body);

    // Rate limiting (100 execuções por hora por usuário)
    try {
      const rateLimit = await checkRateLimit(
        CacheKeys.rateLimit.execution(session.user.id),
        100,
        3600
      );

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: "Limite de execuções atingido. Tente novamente em " +
              Math.ceil(rateLimit.resetIn / 60) + " minutos."
          },
          { status: 429 }
        );
      }
    } catch {
      // Se Redis não estiver disponível, continua sem rate limit
      console.warn("[RateLimit] Redis não disponível, continuando sem rate limit");
    }

    // Verificar se usuário tem empresa
    if (!session.user.companyId) {
      // Tenta encontrar uma empresa existente pelo email (ex: admin@saasrh.com -> saasrh)
      // Ou cria uma empresa padrão para o usuário
      const defaultSlug = session.user.email.split("@")[0] + "-" + Date.now().toString(36);

      const newCompany = await prisma.company.create({
        data: {
          name: "Minha Empresa",
          slug: defaultSlug,
          credits: 50, // Créditos iniciais
          users: {
            connect: { id: session.user.id }
          }
        }
      });

      // Atualiza a sessão localmente para continuar (o next-auth só atualizará no próximo login/refresh)
      session.user.companyId = newCompany.id;
    }

    // Verificar se usuário é ADMIN (acesso ilimitado)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === "ADMIN";

    // Verificar créditos da empresa (admin tem acesso ilimitado)
    if (!isAdmin) {
      const company = await prisma.company.findUnique({
        where: { id: session.user.companyId! }, // Agora garantimos que existe
        select: { credits: true }
      });

      if (!company || company.credits < 1) {
        return NextResponse.json(
          { error: "Créditos insuficientes. Faça um upgrade no seu plano." },
          { status: 402 } // Payment Required
        );
      }
    }

    // Validar campos obrigatórios
    for (const field of agent.inputSchema.fields) {
      if (field.required && !inputs[field.name]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field.label}` },
          { status: 400 }
        );
      }
    }

    // Montar prompt final
    const userPrompt = buildPromptFromTemplate(
      agent.promptTemplate,
      inputs as Record<string, string | number | boolean | undefined>
    );

    // Executar chamada à IA (multi-provider)
    const startTime = Date.now();

    const result = await createAICompletion({
      provider: (provider as AIProvider) || "auto",
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      systemPrompt: agent.systemPrompt,
      userPrompt,
    });

    const executionTimeMs = Date.now() - startTime;
    console.log(`[Execute] Agent: ${agent.slug}, Provider: ${result.provider}, Time: ${executionTimeMs}ms`);

    // Buscar ou criar agente no banco (se não existir)
    let dbAgent = await prisma.agent.findUnique({
      where: { slug: agent.slug },
    });

    if (!dbAgent) {
      // Buscar categoria
      let category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: agent.categoryId },
            { slug: agent.categoryId }
          ]
        },
      });

      if (!category) {
        // Criar categoria se não existir
        category = await prisma.category.create({
          data: {
            name: agent.categoryId,
            slug: agent.categoryId,
          },
        });
      }

      dbAgent = await prisma.agent.create({
        data: {
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
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          model: agent.model,
        },
      });
    }

    // Salvar execução no banco
    const execution = await prisma.execution.create({
      data: {
        userId: session.user.id,
        companyId: session.user.companyId,
        agentId: dbAgent.id,
        inputs: inputs as any,
        promptSent: userPrompt,
        output: result.content,
        tokensUsed: result.tokensUsed,
        executionTimeMs,
        status: "COMPLETED",
      },
    });

    // Atualizar contador do agente e deduzir crédito (admin não deduz)
    const updates: any[] = [
      prisma.agent.update({
        where: { id: dbAgent.id },
        data: {
          totalExecutions: { increment: 1 },
        },
      }),
    ];

    // Só deduz créditos se não for admin
    if (!isAdmin) {
      updates.push(
        prisma.company.update({
          where: { id: session.user.companyId },
          data: {
            credits: { decrement: 1 },
          },
        })
      );
    }

    await prisma.$transaction(updates);

    return NextResponse.json({
      id: execution.id,
      output: result.content,
      tokensUsed: result.tokensUsed,
      executionTimeMs,
      model: result.model,
      provider: result.provider,
    });
  } catch (error) {
    console.error("Erro na execução:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

