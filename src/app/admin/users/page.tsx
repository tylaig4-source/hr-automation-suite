import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Users,
  Search,
  Filter,
  Mail,
  Building2,
  Shield,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
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
import { UsersClient } from "./users-client";
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";

interface SearchParams {
  q?: string;
  role?: string;
  company?: string;
  page?: string;
}

async function getUsers(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const perPage = 20;
  const skip = (page - 1) * perPage;

  const where: any = {};

  if (searchParams.q) {
    const searchTerm = searchParams.q.trim();
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
  }

  if (searchParams.role && searchParams.role !== "all") {
    where.role = searchParams.role;
  }

  if (searchParams.company && searchParams.company !== "all") {
    where.companyId = searchParams.company;
  }

  const [users, total, companies] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
          },
        },
        _count: {
          select: { executions: true },
        },
      },
    }),
    prisma.user.count({ where }),
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    users,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    companies,
  };
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
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

  // Resolver searchParams (pode ser Promise no Next.js 14+)
  const resolvedSearchParams = await Promise.resolve(searchParams);

  // Buscar todos os usuários diretamente do banco
  const { users, total, page, totalPages, companies } = await getUsers(resolvedSearchParams);

  const roleColors = {
    ADMIN: "text-red-400 bg-red-500/20 border-red-500/30",
    COMPANY_ADMIN: "text-neon-magenta bg-neon-magenta/20 border-neon-magenta/30",
    HR_MANAGER: "text-neon-cyan bg-neon-cyan/20 border-neon-cyan/30",
    HR_ANALYST: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    MANAGER: "text-amber-400 bg-amber-500/20 border-amber-500/30",
    EMPLOYEE: "text-gray-400 bg-gray-500/20 border-gray-500/30",
  };

  const roleLabels = {
    ADMIN: "Admin",
    COMPANY_ADMIN: "Admin Empresa",
    HR_MANAGER: "Gerente RH",
    HR_ANALYST: "Analista RH",
    MANAGER: "Gestor",
    EMPLOYEE: "Colaborador",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Usuários</h1>
          <p className="text-gray-400 mt-1">
            Gerencie todos os usuários cadastrados na plataforma
          </p>
        </div>
        <CreateUserDialog companies={companies} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
        <div className="rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 p-4">
          <p className="text-sm text-neon-cyan">Com Empresa</p>
          <p className="text-2xl font-bold text-white">
            {users.filter((u) => u.companyId).length}
          </p>
        </div>
        <div className="rounded-xl border border-neon-magenta/30 bg-neon-magenta/10 p-4">
          <p className="text-sm text-neon-magenta">Admins</p>
          <p className="text-2xl font-bold text-white">
            {users.filter((u) => u.role === "ADMIN" || u.role === "COMPANY_ADMIN").length}
          </p>
        </div>
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-400">Ativos</p>
          <p className="text-2xl font-bold text-white">
            {users.filter((u) => u._count.executions > 0).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1 flex gap-4" method="get">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              name="q"
              placeholder="Buscar por nome ou email..."
              defaultValue={resolvedSearchParams.q}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <select
            name="role"
            defaultValue={resolvedSearchParams.role || "all"}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
          >
            <option value="all" className="bg-gray-900">Todos os roles</option>
            <option value="ADMIN" className="bg-gray-900">Admin</option>
            <option value="COMPANY_ADMIN" className="bg-gray-900">Admin Empresa</option>
            <option value="HR_MANAGER" className="bg-gray-900">Gerente RH</option>
            <option value="HR_ANALYST" className="bg-gray-900">Analista RH</option>
            <option value="MANAGER" className="bg-gray-900">Gestor</option>
            <option value="EMPLOYEE" className="bg-gray-900">Colaborador</option>
          </select>
          <select
            name="company"
            defaultValue={resolvedSearchParams.company || "all"}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50"
          >
            <option value="all" className="bg-gray-900">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id} className="bg-gray-900">
                {company.name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </form>
      </div>

      {/* Table */}
      <UsersClient
        users={users}
        total={total}
        page={page}
        totalPages={totalPages}
        searchParams={resolvedSearchParams}
        roleColors={roleColors}
        roleLabels={roleLabels}
      />
    </div>
  );
}

