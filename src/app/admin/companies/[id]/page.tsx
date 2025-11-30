import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { 
  Building2, 
  Users, 
  Activity,
  Calendar,
  CreditCard,
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  Mail,
  Shield,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CompanyActions } from "./company-actions";

async function getCompany(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: { executions: true },
          },
        },
      },
      executions: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          agent: {
            select: { name: true },
          },
          user: {
            select: { name: true, email: true },
          },
        },
      },
      _count: {
        select: { users: true, executions: true },
      },
    },
  });

  return company;
}

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const company = await getCompany(params.id);

  if (!company) {
    notFound();
  }

  const planColors = {
    STARTER: { bg: "bg-neon-cyan/20", text: "text-neon-cyan", border: "border-neon-cyan/30" },
    PROFESSIONAL: { bg: "bg-neon-magenta/20", text: "text-neon-magenta", border: "border-neon-magenta/30" },
    ENTERPRISE: { bg: "bg-neon-purple/20", text: "text-neon-purple", border: "border-neon-purple/30" },
  };

  const roleColors = {
    ADMIN: "text-red-400",
    COMPANY_ADMIN: "text-neon-magenta",
    HR_MANAGER: "text-neon-cyan",
    HR_ANALYST: "text-blue-400",
    MANAGER: "text-amber-400",
    EMPLOYEE: "text-gray-400",
  };

  const colors = planColors[company.plan as keyof typeof planColors];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/companies"
            className="mt-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-cyan/30 to-neon-magenta/30 flex items-center justify-center text-white text-2xl font-bold">
                {company.name[0]}
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white">{company.name}</h1>
                <p className="text-gray-400">{company.slug}</p>
              </div>
            </div>
          </div>
        </div>
        <CompanyActions company={company} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-cyan/20">
              <Users className="h-5 w-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Usuários</p>
              <p className="text-2xl font-bold text-white">
                {company._count.users}
                <span className="text-sm text-gray-500 font-normal">/{company.maxUsers}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-magenta/20">
              <Activity className="h-5 w-5 text-neon-magenta" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Execuções</p>
              <p className="text-2xl font-bold text-white">
                {company._count.executions}
                <span className="text-sm text-gray-500 font-normal">/{company.maxExecutions}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CreditCard className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Créditos</p>
              <p className={`text-2xl font-bold ${company.credits > 20 ? "text-green-400" : company.credits > 0 ? "text-amber-400" : "text-red-400"}`}>
                {company.credits}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              <TrendingUp className={`h-5 w-5 ${colors.text}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Plano</p>
              <p className={`text-xl font-bold ${colors.text}`}>{company.plan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold text-white">Usuários</h2>
            <Button size="sm" className="bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 border border-neon-cyan/30">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {company.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-black font-bold text-sm">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name || "Sem nome"}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span className="text-gray-400">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${roleColors[user.role as keyof typeof roleColors] || "text-gray-400"}`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user._count.executions} exec.
                    </span>
                  </div>
                </div>
              ))}
              {company.users.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhum usuário cadastrado
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Executions */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold text-white">Execuções Recentes</h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {company.executions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div>
                    <p className="font-medium text-white">{execution.agent.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{execution.user.name || execution.user.email}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{format(execution.createdAt, "dd/MM HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      execution.status === "COMPLETED"
                        ? "border-green-500/30 bg-green-500/10 text-green-400"
                        : execution.status === "FAILED"
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }
                  >
                    {execution.status}
                  </Badge>
                </div>
              ))}
              {company.executions.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma execução registrada
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Informações da Empresa</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">ID</p>
            <p className="text-white font-mono text-sm">{company.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Slug</p>
            <p className="text-white">{company.slug}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Criado em</p>
            <p className="text-white">{format(company.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Limite de Usuários</p>
            <p className="text-white">{company.maxUsers}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Limite de Execuções/mês</p>
            <p className="text-white">{company.maxExecutions}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Última Atualização</p>
            <p className="text-white">{format(company.updatedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

