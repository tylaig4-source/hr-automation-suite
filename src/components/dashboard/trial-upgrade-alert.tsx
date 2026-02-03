"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CreditCard } from "lucide-react";
import Link from "next/link";

interface TrialUpgradeAlertProps {
  trialDaysLeft: number;
  trialExpired: boolean;
  allowTrialWithoutCard: boolean;
}

export function TrialUpgradeAlert({
  trialDaysLeft,
  trialExpired,
  allowTrialWithoutCard,
}: TrialUpgradeAlertProps) {
  // Se trial expirou
  if (trialExpired) {
    return (
      <Alert className="border-red-500/50 bg-red-500/10">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertTitle className="text-red-400">Trial Expirado</AlertTitle>
        <AlertDescription className="text-gray-300 mt-2">
          Seu trial expirou. Assine um plano para continuar usando todos os agentes e funcionalidades.
        </AlertDescription>
        <div className="mt-4">
          <Link href="/dashboard/plans">
            <Button className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-semibold hover:opacity-90">
              <CreditCard className="h-4 w-4 mr-2" />
              Assinar Agora
            </Button>
          </Link>
        </div>
      </Alert>
    );
  }

  // Se trial sem cartão está desabilitado
  if (!allowTrialWithoutCard) {
    return (
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertTitle className="text-amber-400">Assinatura Necessária</AlertTitle>
        <AlertDescription className="text-gray-300 mt-2">
          Trial sem cartão está desabilitado. Assine um plano para usar os agentes.
        </AlertDescription>
        <div className="mt-4">
          <Link href="/dashboard/plans">
            <Button className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-semibold hover:opacity-90">
              <CreditCard className="h-4 w-4 mr-2" />
              Ver Planos
            </Button>
          </Link>
        </div>
      </Alert>
    );
  }

  // Se está próximo de expirar (1 dia ou menos)
  if (trialDaysLeft <= 1) {
    return (
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <Clock className="h-4 w-4 text-amber-400" />
        <AlertTitle className="text-amber-400">Trial Expirando em Breve</AlertTitle>
        <AlertDescription className="text-gray-300 mt-2">
          Seu trial expira em {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""}.
          Assine um plano para continuar usando todos os agentes sem interrupções.
        </AlertDescription>
        <div className="mt-4">
          <Link href="/dashboard/plans">
            <Button className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-semibold hover:opacity-90">
              <CreditCard className="h-4 w-4 mr-2" />
              Fazer Upgrade
            </Button>
          </Link>
        </div>
      </Alert>
    );
  }

  // Se está com 2-7 dias restantes
  if (trialDaysLeft <= 3) {
    return (
      <Alert className="border-blue-500/50 bg-blue-500/10">
        <Clock className="h-4 w-4 text-blue-400" />
        <AlertTitle className="text-blue-400">Trial Ativo</AlertTitle>
        <AlertDescription className="text-gray-300 mt-2">
          Você tem {trialDaysLeft} dias restantes no seu trial.
          Considere fazer upgrade para continuar usando após o período de teste.
        </AlertDescription>
        <div className="mt-4">
          <Link href="/dashboard/plans">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
              Ver Planos
            </Button>
          </Link>
        </div>
      </Alert>
    );
  }

  return null;
}

