"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Rocket,
  GraduationCap,
  BarChart3,
  Heart,
  FileText,
  DollarSign,
  UserMinus,
  History,
  Bookmark,
  Sparkles,
  CreditCard,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const categories = [
  { name: "Recrutamento", slug: "recrutamento-selecao", icon: Users, color: "#6366F1" },
  { name: "Onboarding", slug: "onboarding-integracao", icon: Rocket, color: "#8B5CF6" },
  { name: "Treinamento", slug: "treinamento-desenvolvimento", icon: GraduationCap, color: "#06B6D4" },
  { name: "Avaliação", slug: "avaliacao-desempenho", icon: BarChart3, color: "#10B981" },
  { name: "Clima", slug: "clima-cultura", icon: Heart, color: "#F59E0B" },
  { name: "Dept. Pessoal", slug: "departamento-pessoal", icon: FileText, color: "#EF4444" },
  { name: "Remuneração", slug: "remuneracao-beneficios", icon: DollarSign, color: "#14B8A6" },
  { name: "Desligamento", slug: "desligamento", icon: UserMinus, color: "#64748B" },
];

interface MobileSidebarProps {
  onClose: () => void;
}

export function MobileSidebar({ onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg">HR Suite</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <Link
          href="/dashboard"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="pt-4">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
            Categorias
          </p>
          <div className="mt-1 space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = pathname.includes(category.slug);
              return (
                <Link
                  key={category.slug}
                  href={`/dashboard/categories/${category.slug}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" style={{ color: isActive ? category.color : undefined }} />
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t my-4" />

        <Link
          href="/dashboard/analytics"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard/analytics"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Link>

        <Link
          href="/dashboard/history"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard/history"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <History className="h-4 w-4" />
          Histórico
        </Link>

        <Link
          href="/dashboard/templates"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard/templates"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Bookmark className="h-4 w-4" />
          Templates
        </Link>

        <div className="border-t my-4" />

        {/* Admin Panel - Only for admins */}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname.startsWith("/admin")
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Shield className={cn(
              "h-4 w-4",
              pathname.startsWith("/admin") && "text-amber-600 dark:text-amber-400"
            )} />
            Painel Admin
          </Link>
        )}

        <Link
          href="/dashboard/plans"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard/plans"
              ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <CreditCard className={cn("h-4 w-4", pathname === "/dashboard/plans" && "text-green-600 dark:text-green-400")} />
          Planos
        </Link>

        <Link
          href="/dashboard/profile"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard/profile"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Settings className="h-4 w-4" />
          Configurações
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-center text-xs text-muted-foreground">
          Feito com ❤️ por{" "}
          <a href="https://meusuper.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Meu Super App
          </a>
        </p>
      </div>
    </div>
  );
}
