import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubscriptionsClient } from "./subscriptions-client";

export const metadata = {
  title: "Assinaturas | Admin",
  description: "Gerencie todas as assinaturas do sistema",
};

export default async function AdminSubscriptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Buscar role diretamente do banco de dados
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Buscar todas as assinaturas diretamente do banco
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          plan: true,
        },
      },
    },
    take: 100, // Limitar a 100 mais recentes
  });

  // Mapear para o formato esperado pelo cliente
  const formattedSubscriptions = subscriptions.map((sub) => ({
    id: sub.id,
    companyId: sub.companyId,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    status: sub.status,
    planId: sub.planId,
    billingType: sub.billingType,
    nextDueDate: sub.nextDueDate,
    endDate: sub.endDate,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt,
    company: sub.company,
  }));

  // Estatísticas
  const stats = await Promise.all([
    prisma.subscription.count(),
    prisma.subscription.count({
      where: { status: "ACTIVE" },
    }),
    prisma.subscription.count({
      where: { status: "PENDING" },
    }),
    prisma.subscription.count({
      where: { status: "CANCELED" },
    }),
    prisma.subscription.count({
      where: { status: "OVERDUE" },
    }),
  ]);

  const totalSubscriptions = stats[0];
  const activeSubscriptions = stats[1];
  const pendingSubscriptions = stats[2];
  const canceledSubscriptions = stats[3];
  const overdueSubscriptions = stats[4];

  return (
    <SubscriptionsClient
      subscriptions={formattedSubscriptions}
      stats={{
        total: totalSubscriptions,
        active: activeSubscriptions,
        pending: pendingSubscriptions,
        canceled: canceledSubscriptions,
        overdue: overdueSubscriptions,
      }}
    />
  );
}

