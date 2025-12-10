"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("ID da sessão não encontrado");
      setLoading(false);
      return;
    }

    // Verificar status da sessão
    const verifySession = async () => {
      try {
        const response = await fetch(`/api/stripe/checkout-session/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao verificar sessão");
        }

        setSubscriptionData(data);
      } catch (err: any) {
        console.error("Erro ao verificar sessão:", err);
        setError(err.message || "Erro ao verificar pagamento");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verificando pagamento...</h2>
          <p className="text-gray-400">Por favor, aguarde enquanto confirmamos sua assinatura.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="max-w-md w-full glass rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Erro ao processar pagamento</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/dashboard/plans")}>
              Voltar para Planos
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              Ir para Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-md w-full glass rounded-2xl p-8 border border-white/10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
        <p className="text-gray-400 mb-6">
          Sua assinatura foi processada com sucesso. Você já pode aproveitar todos os recursos do plano.
        </p>
        {subscriptionData && (
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border text-left">
            <p className="text-sm text-gray-400 mb-1">Plano</p>
            <p className="text-lg font-semibold text-white">{subscriptionData.planName}</p>
            {subscriptionData.trialEnd && (
              <p className="text-sm text-green-400 mt-2">
                Trial ativo até {new Date(subscriptionData.trialEnd).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        )}
        <Button asChild className="w-full">
          <Link href="/dashboard">Começar a usar</Link>
        </Button>
      </div>
    </div>
  );
}

