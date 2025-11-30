import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentsClient } from "./payments-client";

export const metadata = {
  title: "Pagamentos | Admin",
  description: "Gerencie todos os pagamentos do sistema",
};

export default async function AdminPaymentsPage() {
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

  // Buscar todos os pagamentos diretamente do banco
  const payments = await prisma.payment.findMany({
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

  // Estatísticas
  const stats = await Promise.all([
    prisma.payment.count(),
    prisma.payment.count({
      where: { status: "RECEIVED" },
    }),
    prisma.payment.count({
      where: { status: "PENDING" },
    }),
    prisma.payment.aggregate({
      _sum: {
        value: true,
      },
      where: {
        status: "RECEIVED",
      },
    }),
  ]);

  const totalPayments = stats[0];
  const receivedPayments = stats[1];
  const pendingPayments = stats[2];
  const totalRevenue = stats[3]._sum.value || 0;

  return (
    <PaymentsClient
      payments={payments}
      stats={{
        total: totalPayments,
        received: receivedPayments,
        pending: pendingPayments,
        totalRevenue,
      }}
    />
  );
}

