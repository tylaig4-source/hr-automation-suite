"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";

interface OnboardingWrapperProps {
  companyInfo: {
    isTrialing: boolean;
    trialDaysLeft: number;
  };
}

export function OnboardingWrapper({ companyInfo }: OnboardingWrapperProps) {
  const { data: session } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Verificar se é primeiro acesso (não mostrar onboarding novamente se já viu)
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    if (!hasSeenOnboarding && session?.user) {
      // Verificar se usuário tem execuções (se não tiver, é primeiro acesso)
      fetch("/api/executions?limit=1")
        .then((res) => res.json())
        .then((data) => {
          if (data.executions && data.executions.length === 0) {
            // Primeiro acesso - mostrar onboarding
            setShowOnboarding(true);
          }
          setHasChecked(true);
        })
        .catch(() => {
          setHasChecked(true);
        });
    } else {
      setHasChecked(true);
    }
  }, [session]);

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShowOnboarding(false);
  };

  if (!hasChecked || !showOnboarding) {
    return null;
  }

  return (
    <OnboardingModal
      isOpen={showOnboarding}
      onComplete={handleComplete}
      isTrialing={companyInfo.isTrialing}
      trialDaysLeft={companyInfo.trialDaysLeft}
    />
  );
}

