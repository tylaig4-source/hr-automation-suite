import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EnterpriseRequestsClient } from "./enterprise-requests-client";

export const metadata = {
  title: "Solicitações Enterprise | Admin",
  description: "Gerencie solicitações do plano Enterprise",
};

export default async function EnterpriseRequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const requests = await prisma.enterpriseRequest.findMany({
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
  });

  return <EnterpriseRequestsClient requests={requests} />;
}

