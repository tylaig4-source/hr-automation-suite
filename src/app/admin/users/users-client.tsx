"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Building2, Activity, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  companyId: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  } | null;
  _count: {
    executions: number;
  };
  createdAt: Date;
}

interface UsersClientProps {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  searchParams: {
    q?: string;
    role?: string;
    company?: string;
  };
  roleColors: Record<string, string>;
  roleLabels: Record<string, string>;
}

export function UsersClient({
  users,
  total,
  page,
  totalPages,
  searchParams,
  roleColors,
  roleLabels,
}: UsersClientProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-sm font-medium text-gray-400">Usuário</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Role</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Empresa</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Execuções</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Criado em</th>
              <th className="text-right p-4 text-sm font-medium text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-white dark:text-black font-bold text-sm">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name || "Sem nome"}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant="outline"
                    className={`${roleColors[user.role] || roleColors.EMPLOYEE} border`}
                  >
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </td>
                <td className="p-4">
                  {user.company ? (
                    <Link
                      href={`/admin/companies/${user.company.id}`}
                      className="flex items-center gap-2 hover:text-neon-cyan transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{user.company.name}</span>
                    </Link>
                  ) : (
                    <span className="text-gray-500">Sem empresa</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <span>{user._count.executions}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400">
                  {format(user.createdAt, "dd MMM yyyy", { locale: ptBR })}
                </td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white">
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
                        Alterar role
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
                        Alterar empresa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Desativar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <p>Nenhum usuário encontrado</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            Mostrando {users.length} de {total} usuários
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild
              className="border-white/10 text-white hover:bg-white/10"
            >
              <Link
                href={`/admin/users?page=${page - 1}&q=${searchParams.q || ""}&role=${searchParams.role || ""}&company=${searchParams.company || ""}`}
              >
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
              <Link
                href={`/admin/users?page=${page + 1}&q=${searchParams.q || ""}&role=${searchParams.role || ""}&company=${searchParams.company || ""}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

