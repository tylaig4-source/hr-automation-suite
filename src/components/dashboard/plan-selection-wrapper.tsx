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
  const [showModal, setShowModal] = useState(true); // Iniciar como true
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Garantir que o componente está montado no cliente
    setMounted(true);
    // Modal já está como true, apenas garantir que está montado
    setShowModal(true);
  }, []);

  // Renderizar o modal mesmo antes de montar completamente para evitar delay visual
  // O Dialog do shadcn/ui lida bem com isso
  return (
    <PlanSelectionModal
      isOpen={showModal && mounted ? true : false}
      plans={plans}
    />
  );
}

