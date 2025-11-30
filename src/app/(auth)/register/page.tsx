"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getAbsoluteUrl } from "@/lib/url";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Mail, Lock, User, AlertCircle, ArrowRight, Zap, Bot, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerSchema, type RegisterInput } from "@/lib/validations";
export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Registrar usuário via API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar conta");
      }

      // Login automático após registro
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Conta criada, mas erro no login - redireciona para login
        const absoluteUrl = getAbsoluteUrl("/login?registered=true");
        window.location.href = absoluteUrl;
      } else {
        // Redireciona direto para dashboard (onboarding será mostrado lá)
        const absoluteUrl = getAbsoluteUrl("/dashboard");
        window.location.href = absoluteUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-mesh-gradient opacity-60" />
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-neon-magenta/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-float-delayed" />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-magenta/30 bg-neon-magenta/10 text-neon-magenta text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Comece gratuitamente</span>
          </div>
          
          <h2 className="font-display text-5xl font-bold text-white mb-6">
            Comece a automatizar{" "}
            <span className="bg-gradient-to-r from-neon-magenta to-neon-purple bg-clip-text text-transparent">
              seu RH hoje
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Junte-se a centenas de empresas que já economizam tempo com nossos agentes de IA.
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-2xl p-5 border border-neon-cyan/20">
              <div className="text-4xl font-display font-bold text-neon-cyan mb-1">95%</div>
              <div className="text-gray-400 text-sm">Economia de tempo</div>
            </div>
            <div className="glass rounded-2xl p-5 border border-neon-magenta/20">
              <div className="text-4xl font-display font-bold text-neon-magenta mb-1">34</div>
              <div className="text-gray-400 text-sm">Agentes de IA</div>
            </div>
            <div className="glass rounded-2xl p-5 border border-neon-purple/20">
              <div className="text-4xl font-display font-bold text-neon-purple mb-1">24/7</div>
              <div className="text-gray-400 text-sm">Disponibilidade</div>
            </div>
            <div className="glass rounded-2xl p-5 border border-green-400/20">
              <div className="text-4xl font-display font-bold text-green-400 mb-1">100%</div>
              <div className="text-gray-400 text-sm">Padronização</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="glass rounded-3xl p-8 border border-white/10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan via-neon-magenta to-neon-purple flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-magenta blur-lg opacity-50" />
              </div>
              <span className="font-display font-bold text-2xl bg-gradient-to-r from-neon-cyan to-neon-magenta bg-clip-text text-transparent">
                HR Suite
              </span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-white mb-2">Criar conta</h1>
              <p className="text-gray-400">
                Comece gratuitamente, sem cartão de crédito
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/30 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 rounded-xl"
                    disabled={isLoading}
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 rounded-xl"
                    disabled={isLoading}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 rounded-xl"
                    disabled={isLoading}
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 rounded-xl"
                    disabled={isLoading}
                    {...register("confirmPassword")}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-semibold hover:opacity-90 transition-opacity mt-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    Criar conta
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-4 text-gray-500">
                  Ou continue com
                </span>
              </div>
            </div>

            {/* Social Login */}
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar com Google
            </Button>

            {/* Terms */}
            <p className="text-center text-xs text-gray-500 mt-6">
              Ao criar uma conta, você concorda com nossos{" "}
              <Link href="/terms" className="text-neon-cyan hover:underline">
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link href="/privacy" className="text-neon-cyan hover:underline">
                Política de Privacidade
              </Link>
            </p>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-400 mt-4">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-neon-cyan hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </div>

          {/* Footer Credit */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Feito com ❤️ por{" "}
            <a href="https://meusuper.app/" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline">
              Meu Super App
            </a>
          </p>
        </div>
      </div>

    </div>
  );
}
