import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAICompletion, buildPromptFromTemplate, type AIProvider } from "@/lib/ai-providers";
import { checkRateLimit, CacheKeys } from "@/lib/redis";
import { getAgentBySlug } from "../../../../../prompts";

// Forçar renderização dinâmica (usa headers/session)
export const dynamic = 'force-dynamic';

const executeSchema = z.object({
  inputs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.undefined()])),
  provider: z.enum(["openai", "gemini", "auto"]).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentSlug: string }> | { agentSlug: string } }
) {
  try {
    // Resolver params (Next.js 14+ pode retornar Promise)
    const resolvedParams = await Promise.resolve(params);
    const agentSlug = resolvedParams.agentSlug;

    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // ========================================
    // DB-FIRST: Buscar agente do banco primeiro
    // ========================================
    let dbAgent = await prisma.agent.findUnique({
      where: { slug: agentSlug },
      include: {
        category: true,
      },
    });

    // Se não existir no banco, criar a partir do template estático
    if (!dbAgent) {
      const staticAgent = getAgentBySlug(agentSlug);
      if (!staticAgent) {
        return NextResponse.json(
          { error: "Agente não encontrado" },
          { status: 404 }
        );
      }

      // Buscar ou criar categoria
      let category = await prisma.category.findFirst({
        where: {
          OR: [
            { id: staticAgent.categoryId },
            { slug: staticAgent.categoryId }
          ]
        },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: staticAgent.categoryId,
            slug: staticAgent.categoryId,
          },
        });
      }

      // Criar agente no banco a partir do template
      try {
        dbAgent = await prisma.agent.create({
          data: {
            id: staticAgent.id,
            categoryId: category.id,
            name: staticAgent.name,
            slug: staticAgent.slug,
            description: staticAgent.description,
            shortDescription: staticAgent.shortDescription,
            promptTemplate: staticAgent.promptTemplate,
            systemPrompt: staticAgent.systemPrompt,
            inputSchema: staticAgent.inputSchema as any,
            estimatedTimeSaved: staticAgent.estimatedTimeSaved,
            temperature: staticAgent.temperature,
            maxTokens: staticAgent.maxTokens,
            model: staticAgent.model,
          },
          include: {
            category: true,
          },
        });
      } catch (createError: any) {
        // Se o ID já existir, tentar criar sem especificar o ID
        if (createError?.code === 'P2002') {
          dbAgent = await prisma.agent.create({
            data: {
              categoryId: category.id,
              name: staticAgent.name,
              slug: staticAgent.slug,
              description: staticAgent.description,
              shortDescription: staticAgent.shortDescription,
              promptTemplate: staticAgent.promptTemplate,
              systemPrompt: staticAgent.systemPrompt,
              inputSchema: staticAgent.inputSchema as any,
              estimatedTimeSaved: staticAgent.estimatedTimeSaved,
              temperature: staticAgent.temperature,
              maxTokens: staticAgent.maxTokens,
              model: staticAgent.model,
            },
            include: {
              category: true,
            },
          });
        } else {
          throw createError;
        }
      }
    }

    // Agora usamos dbAgent para tudo (valores editados pelo admin)
    const agentInputSchema = (dbAgent.inputSchema as any) || { fields: [] };

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
      return NextResponse.json(
        {
          error: "Você precisa escolher um plano primeiro. Complete o onboarding para continuar.",
          requiresPlanSelection: true
        },
        { status: 402 } // Payment Required
      );
    }

    // Verificar se usuário é ADMIN (acesso ilimitado) - mover para cima
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdmin = user?.role === "ADMIN";

    // Verificar se empresa tem plano ativo
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        credits: true,
        isTrialing: true,
        trialEndDate: true,
        subscription: {
          select: { status: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se tem plano ativo
    const hasActiveTrial = company.isTrialing && company.trialEndDate && new Date(company.trialEndDate) > new Date();
    const subscriptionStatus = company.subscription?.status;
    const hasActiveSubscription = subscriptionStatus === "ACTIVE";
    const hasActivePlan = hasActiveTrial || hasActiveSubscription;

    // Bloquear se não tiver plano ativo
    if (!hasActivePlan && company.credits === 0) {
      return NextResponse.json(
        {
          error: "Você precisa escolher um plano primeiro. Complete o onboarding para continuar.",
          requiresPlanSelection: true
        },
        { status: 402 } // Payment Required
      );
    }

    // Bloquear se assinatura estiver em atraso, cancelada ou expirada
    if (subscriptionStatus && subscriptionStatus !== "ACTIVE" && !hasActiveTrial) {
      let errorMessage = "Assinatura inativa. ";
      if (subscriptionStatus === "OVERDUE") {
        errorMessage = "Pagamento em atraso. Atualize seu método de pagamento para continuar usando os agentes.";
      } else if (subscriptionStatus === "CANCELED" || subscriptionStatus === "EXPIRED") {
        errorMessage = "Assinatura cancelada ou expirada. Renove sua assinatura para continuar usando os agentes.";
      } else if (subscriptionStatus === "PENDING") {
        errorMessage = "Pagamento pendente. Complete o pagamento para continuar usando os agentes.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          requiresPayment: true,
          subscriptionStatus
        },
        { status: 402 } // Payment Required
      );
    }

    // VALIDAÇÃO DE SEGURANÇA: Se tem assinatura ACTIVE, validar com Stripe
    // Isso previne manipulação do banco de dados
    if (hasActiveSubscription && !isAdmin && session.user.companyId) {
      try {
        const { validateSubscriptionAccess, shouldValidateWithStripe } = await import("@/lib/subscription-security");

        // Validar com Stripe (pode ser configurado para validar apenas X% das vezes)
        if (shouldValidateWithStripe()) {
          const validation = await validateSubscriptionAccess(session.user.companyId);

          if (!validation.allowed) {
            return NextResponse.json(
              {
                error: validation.reason || "Assinatura inválida. Verifique seu método de pagamento.",
                requiresPayment: true,
                subscriptionStatus: "INVALID"
              },
              { status: 402 } // Payment Required
            );
          }
        }
      } catch (error: any) {
        // Se houver erro na validação, logar mas permitir (para não bloquear usuários legítimos)
        console.error("[Execute] Erro ao validar assinatura:", error);
      }
    }

    // Verificar se pode executar agentes (bloqueio de trial/assinatura)
    if (!isAdmin && session.user.companyId) {
      const { canExecuteAgents } = await import("@/lib/trial-settings");
      const canExecute = await canExecuteAgents(session.user.companyId);

      if (!canExecute.allowed) {
        return NextResponse.json(
          {
            error: canExecute.reason || "Acesso bloqueado. Assine um plano para continuar.",
            requiresUpgrade: true
          },
          { status: 402 } // Payment Required
        );
      }
    }

    // Verificar créditos da empresa (admin tem acesso ilimitado)
    if (!isAdmin) {
      const companyCredits = await prisma.company.findUnique({
        where: { id: session.user.companyId! }, // Agora garantimos que existe
        select: { credits: true }
      });

      if (!companyCredits || companyCredits.credits < 1) {
        return NextResponse.json(
          { error: "Créditos insuficientes. Faça um upgrade no seu plano." },
          { status: 402 } // Payment Required
        );
      }
    }

    // Validar campos obrigatórios usando inputSchema do banco
    for (const field of agentInputSchema.fields || []) {
      if (field.required && !inputs[field.name]) {
        return NextResponse.json(
          { error: `Campo obrigatório: ${field.label}` },
          { status: 400 }
        );
      }
    }

    // Montar prompt final usando template do banco
    const userPrompt = buildPromptFromTemplate(
      dbAgent.promptTemplate,
      inputs as Record<string, string | number | boolean | undefined>
    );

    // Executar chamada à IA (multi-provider)
    const startTime = Date.now();

    const result = await createAICompletion({
      provider: (provider as AIProvider) || "auto",
      model: dbAgent.model || undefined,
      temperature: dbAgent.temperature || undefined,
      maxTokens: dbAgent.maxTokens || undefined,
      systemPrompt: dbAgent.systemPrompt || undefined,
      userPrompt,
    });

    const executionTimeMs = Date.now() - startTime;
    console.log(`[Execute] Agent: ${dbAgent.slug}, Provider: ${result.provider}, Time: ${executionTimeMs}ms`);

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
    console.error("[Execute] Erro na execução:", error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("[Execute] Mensagem:", error.message);
      console.error("[Execute] Stack:", error.stack);
    }

    if (error instanceof z.ZodError) {
      console.error("[Execute] Erro de validação:", error.errors);
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    // Retornar mensagem de erro mais específica se disponível
    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

