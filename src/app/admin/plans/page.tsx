import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreditCard, Plus, Edit, Trash2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlansClient } from "./plans-client";

export default async function AdminPlansPage() {
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

  // Buscar todos os planos do banco de dados
  const plans = await prisma.plan.findMany({
    orderBy: { orderIndex: "asc" },
  });

  // Estatísticas
  const stats = {
    total: plans.length,
    active: plans.filter((p) => p.isActive).length,
    popular: plans.filter((p) => p.isPopular).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Planos</h1>
          <p className="text-gray-400 mt-1">
            Gerencie os planos disponíveis na plataforma
          </p>
        </div>
        <Button className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-semibold hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-400">Ativos</p>
          <p className="text-2xl font-bold text-white">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-neon-magenta/30 bg-neon-magenta/10 p-4">
          <p className="text-sm text-neon-magenta">Destaque</p>
          <p className="text-2xl font-bold text-white">{stats.popular}</p>
        </div>
      </div>

      {/* Plans List */}
      <PlansClient plans={plans} />
    </div>
  );
}

