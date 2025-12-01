"use client";

import { AlertCircle, CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PaymentAlertProps {
  subscriptionStatus?: "PENDING" | "ACTIVE" | "OVERDUE" | "CANCELED" | "EXPIRED" | null;
  nextDueDate?: Date | string | null;
  daysUntilDue?: number;
}

export function PaymentAlert({ 
  subscriptionStatus, 
  nextDueDate, 
  daysUntilDue 
}: PaymentAlertProps) {
  const router = useRouter();

  // Não mostrar se não tiver assinatura
  if (!subscriptionStatus) {
    return null;
  }

  // Se estiver ativa, mostrar apenas aviso de vencimento próximo
  if (subscriptionStatus === "ACTIVE") {
    // Calcular dias até vencimento
    let daysUntil = daysUntilDue;
    if (!daysUntil && nextDueDate) {
      const due = new Date(nextDueDate);
      const now = new Date();
      const diffTime = due.getTime() - now.getTime();
      daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Aviso para pagamento próximo (7 dias antes)
    if (daysUntil && daysUntil <= 7 && daysUntil > 0) {
    return (
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <Calendar className="h-4 w-4 text-amber-400" />
        <AlertTitle className="text-amber-400">Pagamento Próximo</AlertTitle>
        <AlertDescription className="text-gray-300">
          Sua assinatura vencerá em {daysUntil} dia{daysUntil !== 1 ? 's' : ''}. 
          Certifique-se de que seu método de pagamento está atualizado.
          <Button
            variant="link"
            className="ml-2 p-0 h-auto text-amber-400 hover:text-amber-300"
            onClick={() => router.push("/dashboard/plans")}
          >
            Ver detalhes
          </Button>
        </AlertDescription>
      </Alert>
    );
    }
    
    // Se está ativa e não está próximo do vencimento, não mostrar nada
    return null;
  }

  // Calcular dias até vencimento para outros status
  let daysUntil = daysUntilDue;
  if (!daysUntil && nextDueDate) {
    const due = new Date(nextDueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Alerta para pagamento em atraso
  if (subscriptionStatus === "OVERDUE") {
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertTitle className="text-red-400">Pagamento em Atraso</AlertTitle>
        <AlertDescription className="text-gray-300">
          O pagamento da sua assinatura falhou. Atualize seu método de pagamento 
          para evitar interrupção do serviço. Seu acesso aos agentes está bloqueado até a regularização.
          <div className="mt-3">
            <Button
              onClick={() => router.push("/dashboard/plans")}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Atualizar Pagamento
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerta para assinatura cancelada/expirada
  if (subscriptionStatus === "CANCELED" || subscriptionStatus === "EXPIRED") {
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertTitle className="text-red-400">
          Assinatura {subscriptionStatus === "CANCELED" ? "Cancelada" : "Expirada"}
        </AlertTitle>
        <AlertDescription className="text-gray-300">
          Sua assinatura foi {subscriptionStatus === "CANCELED" ? "cancelada" : "expirada"}. 
          Renove sua assinatura para continuar usando a plataforma.
          <div className="mt-3">
            <Button
              onClick={() => router.push("/dashboard/plans")}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Renovar Assinatura
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Alerta para assinatura pendente
  if (subscriptionStatus === "PENDING") {
    return (
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <AlertTitle className="text-yellow-400">Pagamento Pendente</AlertTitle>
        <AlertDescription className="text-gray-300">
          Seu pagamento está pendente. Complete o pagamento para ativar sua assinatura.
          <div className="mt-3">
            <Button
              onClick={() => router.push("/dashboard/plans")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Completar Pagamento
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

