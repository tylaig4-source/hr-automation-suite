import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  Building2, 
  Search, 
  Filter,
  Plus,
  MoreVertical,
  Users,
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SearchParams {
  q?: string;
  plan?: string;
  page?: string;
}

async function getCompanies(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const perPage = 10;
  const skip = (page - 1) * perPage;

  const where: any = {};

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: "insensitive" } },
      { slug: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }

  if (searchParams.plan && searchParams.plan !== "all") {
    where.plan = searchParams.plan;
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
      include: {
        _count: {
          select: { users: true, executions: true },
        },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    companies,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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

  // Buscar todas as empresas diretamente do banco
  const { companies, total, page, totalPages } = await getCompanies(searchParams);

  const planColors = {
    STARTER: { bg: "bg-neon-cyan/20", text: "text-neon-cyan", border: "border-neon-cyan/30" },
    PROFESSIONAL: { bg: "bg-neon-magenta/20", text: "text-neon-magenta", border: "border-neon-magenta/30" },
    ENTERPRISE: { bg: "bg-neon-purple/20", text: "text-neon-purple", border: "border-neon-purple/30" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Empresas</h1>
          <p className="text-gray-400 mt-1">
            Gerencie todas as empresas cadastradas na plataforma
          </p>
        </div>
        <Button className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-semibold hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              name="q"
              placeholder="Buscar por nome ou slug..."
              defaultValue={searchParams.q}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <select
            name="plan"
            defaultValue={searchParams.plan || "all"}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
          >
            <option value="all" className="bg-gray-900">Todos os planos</option>
            <option value="STARTER" className="bg-gray-900">Starter</option>
            <option value="PROFESSIONAL" className="bg-gray-900">Professional</option>
            <option value="ENTERPRISE" className="bg-gray-900">Enterprise</option>
          </select>
          <Button type="submit" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
        <div className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 p-4">
          <p className="text-sm text-neon-cyan">Ativas este mês</p>
          <p className="text-2xl font-bold text-white">{companies.filter(c => c._count.executions > 0).length}</p>
        </div>
        <div className="rounded-xl border border-neon-magenta/30 bg-neon-magenta/10 p-4">
          <p className="text-sm text-neon-magenta">Professional+</p>
          <p className="text-2xl font-bold text-white">
            {companies.filter(c => c.plan !== "STARTER").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-gray-400">Empresa</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Plano</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Usuários</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Execuções</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Créditos</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Criado em</th>
                <th className="text-right p-4 text-sm font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const colors = planColors[company.plan as keyof typeof planColors];
                return (
                  <tr
                    key={company.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <Link href={`/admin/companies/${company.id}`} className="flex items-center gap-3 hover:text-neon-cyan transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-magenta/30 flex items-center justify-center text-white font-bold">
                          {company.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">{company.name}</p>
                          <p className="text-sm text-gray-500">{company.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {company.plan}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{company._count.users}</span>
                        <span className="text-gray-500">/ {company.maxUsers}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Activity className="h-4 w-4 text-gray-500" />
                        <span>{company._count.executions}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${company.credits > 20 ? "text-green-400" : company.credits > 0 ? "text-amber-400" : "text-red-400"}`}>
                        {company.credits}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{format(company.createdAt, "dd MMM yyyy", { locale: ptBR })}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white">
                          <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/5">
                            <Link href={`/admin/companies/${company.id}`}>Ver detalhes</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
                            Editar plano
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
                            Adicionar créditos
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-red-500/10">
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma empresa encontrada</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <p className="text-sm text-gray-400">
              Mostrando {companies.length} de {total} empresas
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                asChild
                className="border-white/10 text-white hover:bg-white/10"
              >
                <Link href={`/admin/companies?page=${page - 1}&q=${searchParams.q || ""}&plan=${searchParams.plan || ""}`}>
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <span className="text-sm text-gray-400">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                asChild
                className="border-white/10 text-white hover:bg-white/10"
              >
                <Link href={`/admin/companies?page=${page + 1}&q=${searchParams.q || ""}&plan=${searchParams.plan || ""}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

