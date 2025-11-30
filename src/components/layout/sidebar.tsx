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
  ChevronDown,
  CreditCard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { UsageCard } from "@/components/dashboard/usage-card";
import { useSidebar } from "@/components/layout/sidebar-context";
import { useSession } from "next-auth/react";
import { Shield } from "lucide-react";

const categories = [
  {
    name: "Recrutamento e Seleção",
    slug: "recrutamento-selecao",
    icon: Users,
    color: "#6366F1",
  },
  {
    name: "Onboarding",
    slug: "onboarding-integracao",
    icon: Rocket,
    color: "#8B5CF6",
  },
  {
    name: "Treinamento",
    slug: "treinamento-desenvolvimento",
    icon: GraduationCap,
    color: "#06B6D4",
  },
  {
    name: "Avaliação",
    slug: "avaliacao-desempenho",
    icon: BarChart3,
    color: "#10B981",
  },
  {
    name: "Clima e Cultura",
    slug: "clima-cultura",
    icon: Heart,
    color: "#F59E0B",
  },
  {
    name: "Dept. Pessoal",
    slug: "departamento-pessoal",
    icon: FileText,
    color: "#EF4444",
  },
  {
    name: "Remuneração",
    slug: "remuneracao-beneficios",
    icon: DollarSign,
    color: "#14B8A6",
  },
  {
    name: "Desligamento",
    slug: "desligamento",
    icon: UserMinus,
    color: "#64748B",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card hidden lg:block transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn("flex h-16 items-center border-b px-6", isCollapsed ? "justify-center px-0" : "gap-2")}>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && <span className="font-bold text-lg whitespace-nowrap">HR Suite</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/dashboard"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Dashboard" : undefined}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          {/* Categories Section */}
          <div className="pt-4">
            {!isCollapsed ? (
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Categorias
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    categoriesOpen && "rotate-180"
                  )}
                />
              </button>
            ) : (
              <div className="h-px bg-border my-2 mx-2" />
            )}

            {(categoriesOpen || isCollapsed) && (
              <div className="mt-1 space-y-1">
                {/* Ver todas as categorias */}
                <Link
                  href="/dashboard/categories"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname === "/dashboard/categories"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? "Todas as Categorias" : undefined}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">Todas as Categorias</span>}
                </Link>

                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = pathname.includes(category.slug);

                  return (
                    <Link
                      key={category.slug}
                      href={`/dashboard/categories/${category.slug}`}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        isCollapsed && "justify-center px-2"
                      )}
                      title={isCollapsed ? category.name : undefined}
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: isActive ? category.color : undefined }}
                      />
                      {!isCollapsed && <span className="truncate">{category.name}</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t my-4" />

          {/* Analytics */}
          <Link
            href="/dashboard/analytics"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/dashboard/analytics"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Analytics" : undefined}
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Analytics</span>}
          </Link>

          {/* History */}
          <Link
            href="/dashboard/history"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/dashboard/history"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Histórico" : undefined}
          >
            <History className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Histórico</span>}
          </Link>

          {/* Templates */}
          <Link
            href="/dashboard/templates"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/dashboard/templates"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Templates" : undefined}
          >
            <Bookmark className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Templates</span>}
          </Link>

          {/* Divider */}
          <div className="border-t my-4" />

          {/* Plans */}
          <Link
            href="/dashboard/plans"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/dashboard/plans"
                ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Planos" : undefined}
          >
            <CreditCard className={cn("h-4 w-4 shrink-0", pathname === "/dashboard/plans" && "text-green-600 dark:text-green-400")} />
            {!isCollapsed && <span>Planos</span>}
          </Link>

          {/* Admin Panel - Only for admins */}
          {isAdmin && (
            <>
              <div className="border-t my-4" />
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? "Admin" : undefined}
              >
                <Shield className={cn(
                  "h-4 w-4 shrink-0",
                  pathname.startsWith("/admin") && "text-amber-600 dark:text-amber-400"
                )} />
                {!isCollapsed && <span>Painel Admin</span>}
              </Link>
            </>
          )}

          {/* Profile/Settings */}
          <Link
            href="/dashboard/profile"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === "/dashboard/profile"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Perfil" : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Configurações</span>}
          </Link>
        </nav>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-background border rounded-full p-1 shadow-md hover:bg-accent transition-colors z-50"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform rotate-90", isCollapsed && "-rotate-90")} />
        </button>

        {/* Footer */}
        <div className="border-t p-4">
          {!isCollapsed ? (
            <UsageCard />
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                %
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
