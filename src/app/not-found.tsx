import Link from "next/link";
import { Home, ArrowLeft, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="text-center px-4 max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl">HR Suite</span>
        </div>

        {/* 404 */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 leading-none">
            404
          </h1>
          <div className="absolute inset-0 text-[150px] md:text-[200px] font-bold text-slate-100 dark:text-slate-800 -z-10 leading-none">
            404
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8">
          Ops! A página que você está procurando não existe ou foi movida.
          Verifique o endereço ou volte para o início.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Ir para o Início
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>

        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Talvez você esteja procurando:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/dashboard/categories"
              className="text-sm text-primary hover:underline"
            >
              Categorias
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/dashboard/history"
              className="text-sm text-primary hover:underline"
            >
              Histórico
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/dashboard/analytics"
              className="text-sm text-primary hover:underline"
            >
              Analytics
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/dashboard/profile"
              className="text-sm text-primary hover:underline"
            >
              Meu Perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

