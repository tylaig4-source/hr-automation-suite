"use client";

import { useState, useEffect } from "react";
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
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Garantir que o componente está montado no cliente
    setMounted(true);
    // Mostrar modal imediatamente quando montar
    // O servidor já verificou que não tem plano ativo antes de renderizar este componente
    setShowModal(true);
  }, []);

  // Não renderizar nada até montar no cliente (evitar hydration mismatch)
  if (!mounted) {
    return null;
  }

  return (
    <PlanSelectionModal
      isOpen={showModal}
      plans={plans}
    />
  );
}

