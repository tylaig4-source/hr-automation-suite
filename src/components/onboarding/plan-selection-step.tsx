"use client";

import { useState } from "react";
import { Check, Zap, Building2, Clock, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAbsoluteUrl } from "@/lib/url";

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

interface OnboardingData {
  companyName: string;
  companySize: string;
  industry: string;
  goals: string[];
  specificNeeds: string;
}

interface PlanSelectionStepProps {
  plans: Plan[];
  onboardingData: OnboardingData;
  onComplete: () => void;
}

export function PlanSelectionStep({
  plans,
  onboardingData,
  onComplete,
}: PlanSelectionStepProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");

  // Filtrar apenas planos ativos e não enterprise
  const availablePlans = plans.filter((p) => p.isActive && !p.isEnterprise);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleActivatePlan = async () => {
    if (!selectedPlan) return;

    setIsActivating(true);
    try {
      // Salvar dados finais do onboarding
      await fetch("/api/company/update-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: onboardingData.goals,
          specificNeeds: onboardingData.specificNeeds,
        }),
      });

      // Redirecionar para checkout (agora o trial também exige cartão e checkout no Stripe)
      // Passamos o billingCycle como 'MONTHLY' por padrão para trial se não estiver definido
      const billing = billingCycle || "MONTHLY";

      onComplete();
      window.location.href = getAbsoluteUrl(
        `/dashboard/plans?plan=${selectedPlan.planId}&billing=${billing}&trial=true`
      );
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao ativar plano",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "Customizado";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatLimit = (limit: number | null) => {
    if (limit === null) return "Ilimitado";
    return limit.toLocaleString("pt-BR");
  };

  const getFeatures = (plan: Plan): string[] => {
    if (Array.isArray(plan.features)) {
      return plan.features;
    }
    return [];
  };

  const trialPlan = availablePlans.find((p) => p.isTrial);
  const paidPlans = availablePlans.filter((p) => !p.isTrial);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <CreditCard className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
          Escolha seu Plano
        </h2>
        <p className="text-gray-400">
          Com base nas informações que você forneceu, recomendamos os planos abaixo
        </p>
      </div>

      {/* Trial Plan */}
      {trialPlan && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Comece Grátis
          </h3>
          <div
            className={`rounded-2xl border-2 p-6 cursor-pointer transition-all ${selectedPlan?.id === trialPlan.id
              ? "border-neon-cyan bg-neon-cyan/10"
              : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            onClick={() => handleSelectPlan(trialPlan)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold text-white">{trialPlan.name}</h4>
                  {trialPlan.isPopular && (
                    <span className="px-3 py-1 rounded-full bg-neon-magenta/20 text-neon-magenta text-xs font-semibold border border-neon-magenta/30">
                      Popular
                    </span>
                  )}
                </div>
                {trialPlan.description && (
                  <p className="text-gray-400 mb-4">{trialPlan.description}</p>
                )}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Usuários</p>
                    <p className="text-lg font-semibold text-white">
                      {formatLimit(trialPlan.maxUsers)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Execuções/mês</p>
                    <p className="text-lg font-semibold text-white">
                      {formatLimit(trialPlan.maxExecutions)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Créditos</p>
                    <p className="text-lg font-semibold text-white">
                      {formatLimit(trialPlan.maxCredits)}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {getFeatures(trialPlan)
                    .slice(0, 5)
                    .map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="ml-4">
                {selectedPlan?.id === trialPlan.id && (
                  <div className="w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paid Plans */}
      {paidPlans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-magenta" />
              Planos Pagos
            </h3>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === "MONTHLY"
                  ? "bg-neon-cyan text-black"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle("YEARLY")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === "YEARLY"
                  ? "bg-neon-cyan text-black"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                Anual
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {paidPlans.map((plan) => {
              const Icon = plan.isEnterprise ? Building2 : Zap;
              const price =
                billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 p-6 cursor-pointer transition-all ${selectedPlan?.id === plan.id
                    ? "border-neon-cyan bg-neon-cyan/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5 text-neon-cyan" />
                        <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                      </div>
                      {plan.isPopular && (
                        <span className="inline-block px-2 py-1 rounded-full bg-neon-magenta/20 text-neon-magenta text-xs font-semibold border border-neon-magenta/30">
                          Popular
                        </span>
                      )}
                    </div>
                    {selectedPlan?.id === plan.id && (
                      <div className="w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-gray-400">R$</span>
                      <span className="text-3xl font-bold text-white">
                        {price
                          ? formatPrice(price).replace("R$", "").trim()
                          : "Customizado"}
                      </span>
                      <span className="text-sm text-gray-400">/mês</span>
                    </div>
                    {billingCycle === "YEARLY" &&
                      plan.yearlyPrice &&
                      plan.monthlyPrice && (
                        <p className="text-xs text-green-400 mt-1">
                          Economia de R${" "}
                          {((plan.monthlyPrice - plan.yearlyPrice) * 12).toLocaleString(
                            "pt-BR"
                          )}
                          /ano
                        </p>
                      )}
                    <div className="mt-2 text-xs font-medium">
                      {billingCycle === "MONTHLY" ? (
                        <p className="text-neon-cyan flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          7 dias grátis com cartão vinculado
                        </p>
                      ) : (
                        <p className="text-amber-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Sem período de teste
                        </p>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {getFeatures(plan)
                      .slice(0, 4)
                      .map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center pt-6 border-t border-white/10">
        <Button
          onClick={handleActivatePlan}
          disabled={!selectedPlan || isActivating}
          className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90 min-w-[200px] h-12 text-lg"
        >
          {isActivating ? (
            "Processando..."
          ) : selectedPlan?.isTrial ? (
            <>
              Ativar Trial Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            <>
              Continuar para Pagamento
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

