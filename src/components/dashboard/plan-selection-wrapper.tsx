"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PlanSelectionModal } from "@/components/onboarding/plan-selection-modal";

interface Plan {
  id: string;
  planId: string;
  name: string;
  description: string | null;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  yearlyTotal: number | null;
  maxUsers: number | null;
  maxExecutions: number | null;
  maxCredits: number | null;
  features: any;
  isActive: boolean;
  isPopular: boolean;
  isTrial: boolean;
  isEnterprise: boolean;
  orderIndex: number;
}

interface PlanSelectionWrapperProps {
  plans: Plan[];
}

export function PlanSelectionWrapper({ plans }: PlanSelectionWrapperProps) {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Verificar se empresa tem plano ativo
      fetch("/api/company/usage")
        .then((res) => res.json())
        .then((data) => {
          // Verificar se tem plano ativo usando o campo hasActivePlan ou verificar manualmente
          const hasActivePlan = data.hasActivePlan !== undefined 
            ? data.hasActivePlan 
            : ((data.isTrialing && !data.trialExpired) || 
               (data.subscription?.status === "ACTIVE") ||
               (data.credits > 0 && data.maxExecutions > 0));
          
          if (!hasActivePlan) {
            setShowModal(true);
          }
          setHasChecked(true);
        })
        .catch(() => {
          // Em caso de erro, mostrar modal por segurança
          setShowModal(true);
          setHasChecked(true);
        });
    }
  }, [session]);

  if (!hasChecked || !showModal) {
    return null;
  }

  return (
    <PlanSelectionModal
      isOpen={showModal}
      plans={plans}
    />
  );
}

