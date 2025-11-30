"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  BarChart3,
  CreditCard,
  Shield,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./mobile-sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";

interface HeaderProps {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    role?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, update } = useSession();
  
  // Forçar atualização da sessão ao montar (para pegar role atualizado)
  useEffect(() => {
    // Atualizar sessão após um pequeno delay para garantir que o banco foi atualizado
    const timer = setTimeout(() => {
      update();
    }, 1000);
    return () => clearTimeout(timer);
  }, [update]);
  
  // Usar role da sessão do cliente (mais atualizado) ou do prop
  // Verificar ambos para garantir que funciona
  const sessionRole = session?.user?.role;
  const propRole = user.role;
  const userRole = sessionRole || propRole;
  const isAdmin = userRole === "ADMIN" || sessionRole === "ADMIN" || propRole === "ADMIN";
  
  // Debug temporário - remover após confirmar
  useEffect(() => {
    console.log("[Header Debug]", {
      sessionRole,
      propRole,
      finalRole: userRole,
      isAdmin,
      email: user.email,
      sessionExists: !!session
    });
  }, [sessionRole, propRole, userRole, isAdmin, user.email, session]);
  
  // Usar dados da sessão se disponível, senão usar props
  const displayUser = session?.user || user;

  const initials = displayUser.name
    ? displayUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : displayUser.email[0].toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Mobile menu button */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Mobile logo */}
      <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold">HR Suite</span>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Admin Link - sempre mostrar se for admin (mesmo que sessão não carregou) */}
        {(isAdmin || user.role === "ADMIN") && (
          <Link href="/admin">
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center gap-2 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-medium"
            >
              <Shield className="h-4 w-4" />
              <span>Painel Admin</span>
            </Button>
          </Link>
        )}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {displayUser.image ? (
                  <img
                    src={displayUser.image}
                    alt={displayUser.name || ""}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{displayUser.name || "Usuário"}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{displayUser.name || "Usuário"}</p>
                <p className="text-xs text-muted-foreground">{displayUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/analytics" className="cursor-pointer">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/plans" className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                Planos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Link>
            </DropdownMenuItem>
            {(isAdmin || user.role === "ADMIN") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer text-amber-600 dark:text-amber-400 font-medium">
                    <Shield className="mr-2 h-4 w-4" />
                    Painel Admin
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
