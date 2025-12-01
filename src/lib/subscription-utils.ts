import { prisma } from "@/lib/prisma";
import { getStripeInstance } from "@/lib/stripe";

/**
 * Valida uma assinatura específica com o Stripe
 * Retorna true se está realmente ativa, false caso contrário
 */
export async function validateSubscriptionWithStripe(subscriptionId: string): Promise<{
  isValid: boolean;
  actualStatus: "ACTIVE" | "OVERDUE" | "CANCELED" | "EXPIRED" | "PENDING";
  stripeStatus?: string;
  error?: string;
}> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: {
        stripeSubscriptionId: true,
        status: true,
      },
    });

    if (!subscription) {
      return {
        isValid: false,
        actualStatus: "EXPIRED",
        error: "Assinatura não encontrada",
      };
    }

    // Se não tem Stripe ID, não podemos validar
    if (!subscription.stripeSubscriptionId) {
      return {
        isValid: subscription.status === "ACTIVE",
        actualStatus: subscription.status as any,
        error: "Sem ID do Stripe para validação",
      };
    }

    // Buscar status real no Stripe
    const stripe = await getStripeInstance();
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Mapear status do Stripe
    let actualStatus: "ACTIVE" | "OVERDUE" | "CANCELED" | "EXPIRED" | "PENDING" = "PENDING";
    let isValid = false;

    if (stripeSubscription.status === "active") {
      actualStatus = "ACTIVE";
      isValid = true;
    } else if (stripeSubscription.status === "past_due" || stripeSubscription.status === "unpaid") {
      actualStatus = "OVERDUE";
      isValid = false;
    } else if (stripeSubscription.status === "canceled") {
      actualStatus = "CANCELED";
      isValid = false;
    } else if (stripeSubscription.status === "incomplete_expired") {
      actualStatus = "EXPIRED";
      isValid = false;
    }

    // Verificar se status no banco está correto
    const statusMatches = subscription.status === actualStatus;

    return {
      isValid: isValid && statusMatches,
      actualStatus,
      stripeStatus: stripeSubscription.status,
      error: !statusMatches ? `Status no banco (${subscription.status}) não corresponde ao Stripe (${actualStatus})` : undefined,
    };
  } catch (error: any) {
    return {
      isValid: false,
      actualStatus: "EXPIRED",
      error: error.message || "Erro ao validar com Stripe",
    };
  }
}

/**
 * Verifica e valida TODAS as assinaturas ACTIVE com o Stripe
 * Útil para detectar manipulações ou inconsistências
 */
export async function validateAllActiveSubscriptions(): Promise<{
  checked: number;
  invalid: number;
  updated: number;
  errors: string[];
}> {
  const results = {
    checked: 0,
    invalid: 0,
    updated: 0,
    errors: [] as string[],
  };

  // Buscar todas as assinaturas marcadas como ACTIVE
  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      stripeSubscriptionId: { not: null },
    },
    include: {
      company: {
        select: {
          id: true,
          users: {
            select: { id: true },
          },
        },
      },
    },
  });

  results.checked = activeSubscriptions.length;

  for (const subscription of activeSubscriptions) {
    try {
      const validation = await validateSubscriptionWithStripe(subscription.id);

      if (!validation.isValid) {
        results.invalid++;

        // Atualizar status no banco se estiver incorreto
        if (validation.actualStatus !== subscription.status) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: validation.actualStatus,
              endDate: validation.actualStatus === "EXPIRED" || validation.actualStatus === "CANCELED" 
                ? new Date() 
                : null,
            },
          });

          results.updated++;

          // Criar notificações se foi marcada como expirada/cancelada
          if (validation.actualStatus === "EXPIRED" || validation.actualStatus === "CANCELED") {
            await Promise.all(
              subscription.company.users.map((user) =>
                prisma.notification.create({
                  data: {
                    userId: user.id,
                    title: "⚠️ Assinatura Atualizada",
                    message: `O status da sua assinatura foi atualizado. Por favor, verifique seu método de pagamento.`,
                    type: "WARNING",
                  },
                })
              )
            );
          }
        }

        if (validation.error) {
          results.errors.push(`Subscription ${subscription.id}: ${validation.error}`);
        }
      }
    } catch (error: any) {
      results.errors.push(`Erro ao validar subscription ${subscription.id}: ${error.message}`);
    }
  }

  return results;
}

/**
 * Verifica e atualiza status de assinaturas expiradas
 * Marca como EXPIRED se nextDueDate passou e status ainda está ACTIVE
 * Marca como EXPIRED se OVERDUE há mais de X dias
 */
export async function checkAndUpdateExpiredSubscriptions() {
  const now = new Date();
  const expiredThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás

  // Buscar assinaturas que podem estar expiradas
  const subscriptionsToCheck = await prisma.subscription.findMany({
    where: {
      OR: [
        // Assinaturas ACTIVE com nextDueDate no passado
        {
          status: "ACTIVE",
          nextDueDate: {
            lt: now,
          },
        },
        // Assinaturas OVERDUE há mais de 30 dias
        {
          status: "OVERDUE",
          nextDueDate: {
            lt: expiredThreshold,
          },
        },
      ],
    },
    include: {
      company: {
        select: {
          id: true,
          users: {
            select: { id: true },
          },
        },
      },
    },
  });

  const results = {
    checked: subscriptionsToCheck.length,
    expired: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (const subscription of subscriptionsToCheck) {
    try {
      // Se tem stripeSubscriptionId, verificar status real no Stripe
      if (subscription.stripeSubscriptionId) {
        try {
          const stripe = await getStripeInstance();
          const stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId
          );

          // Atualizar baseado no status do Stripe
          let newStatus: "ACTIVE" | "OVERDUE" | "EXPIRED" | "CANCELED" = subscription.status as any;

          if (stripeSubscription.status === "active") {
            newStatus = "ACTIVE";
            // Atualizar nextDueDate se necessário
            const currentPeriodEnd = new Date(
              (stripeSubscription as any).current_period_end * 1000
            );
            if (currentPeriodEnd > now) {
              await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                  status: "ACTIVE",
                  nextDueDate: currentPeriodEnd,
                },
              });
              results.updated++;
              continue;
            }
          } else if (
            stripeSubscription.status === "past_due" ||
            stripeSubscription.status === "unpaid"
          ) {
            newStatus = "OVERDUE";
          } else if (stripeSubscription.status === "canceled") {
            newStatus = "CANCELED";
          } else if (stripeSubscription.status === "incomplete_expired") {
            newStatus = "EXPIRED";
          }

          // Se status mudou, atualizar
          if (newStatus !== subscription.status) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: newStatus,
                endDate: newStatus === "EXPIRED" || newStatus === "CANCELED" ? now : null,
              },
            });

            // Criar notificações se expirou
            if (newStatus === "EXPIRED") {
              results.expired++;
              await Promise.all(
                subscription.company.users.map((user) =>
                  prisma.notification.create({
                    data: {
                      userId: user.id,
                      title: "⚠️ Assinatura Expirada",
                      message:
                        "Sua assinatura expirou. Renove sua assinatura para continuar usando a plataforma.",
                      type: "WARNING",
                    },
                  })
                )
              );
            }

            results.updated++;
          }
        } catch (stripeError: any) {
          // Se não conseguir buscar do Stripe, marcar como expirada se nextDueDate passou
          if (subscription.status === "ACTIVE" && subscription.nextDueDate && subscription.nextDueDate < now) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: "EXPIRED",
                endDate: now,
              },
            });

            results.expired++;
            results.updated++;

            // Criar notificações
            await Promise.all(
              subscription.company.users.map((user) =>
                prisma.notification.create({
                  data: {
                    userId: user.id,
                    title: "⚠️ Assinatura Expirada",
                    message:
                      "Sua assinatura expirou. Renove sua assinatura para continuar usando a plataforma.",
                    type: "WARNING",
                  },
                })
              )
            );
          } else {
            results.errors.push(
              `Erro ao verificar Stripe para subscription ${subscription.id}: ${stripeError.message}`
            );
          }
        }
      } else {
        // Sem Stripe ID, verificar apenas por data
        if (subscription.status === "ACTIVE" && subscription.nextDueDate && subscription.nextDueDate < now) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "EXPIRED",
              endDate: now,
            },
          });

          results.expired++;
          results.updated++;

          // Criar notificações
          await Promise.all(
            subscription.company.users.map((user) =>
              prisma.notification.create({
                data: {
                  userId: user.id,
                  title: "⚠️ Assinatura Expirada",
                  message:
                    "Sua assinatura expirou. Renove sua assinatura para continuar usando a plataforma.",
                  type: "WARNING",
                },
              })
            )
          );
        } else if (
          subscription.status === "OVERDUE" &&
          subscription.nextDueDate &&
          subscription.nextDueDate < expiredThreshold
        ) {
          // OVERDUE há mais de 30 dias, marcar como EXPIRED
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "EXPIRED",
              endDate: now,
            },
          });

          results.expired++;
          results.updated++;

          // Criar notificações
          await Promise.all(
            subscription.company.users.map((user) =>
              prisma.notification.create({
                data: {
                  userId: user.id,
                  title: "⚠️ Assinatura Expirada",
                  message:
                    "Sua assinatura expirou após período prolongado de atraso. Renove sua assinatura para continuar usando a plataforma.",
                  type: "WARNING",
                },
              })
            )
          );
        }
      }
    } catch (error: any) {
      results.errors.push(`Erro ao processar subscription ${subscription.id}: ${error.message}`);
    }
  }

  return results;
}

