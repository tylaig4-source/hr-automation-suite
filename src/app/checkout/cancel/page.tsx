"use client";

import { useRouter } from "next/navigation";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-md w-full glass rounded-2xl p-8 border border-white/10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
          <X className="w-10 h-10 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pagamento Cancelado</h2>
        <p className="text-gray-400 mb-6">
          Você cancelou o processo de pagamento. Nenhuma cobrança foi realizada.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/plans")} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Planos
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="flex-1">
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

