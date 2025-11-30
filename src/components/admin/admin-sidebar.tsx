"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  FileCode,
  Sparkles,
  Users,
  BarChart3,
  ArrowLeft,
  Webhook,
  Receipt,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Empresas",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    name: "Planos",
    href: "/admin/plans",
    icon: CreditCard,
  },
  {
    name: "Assinaturas",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    name: "Pagamentos",
    href: "/admin/payments",
    icon: Receipt,
  },
  {
    name: "Prompts",
    href: "/admin/prompts",
    icon: FileCode,
  },
  {
    name: "Solicitações Enterprise",
    href: "/admin/enterprise-requests",
    icon: MessageSquare,
  },
  {
    name: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-[#0f0f14] hidden lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-magenta to-neon-purple flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-white block">HR Suite</span>
            <span className="text-xs text-neon-cyan">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 text-white border border-neon-cyan/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-neon-cyan" : ""
                  )} 
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar ao Dashboard</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

