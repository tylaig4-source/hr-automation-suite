"use client";

import { useState, useEffect } from "react";
import { X, Check, Zap, Building2, Clock, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface PlanSelectionModalProps {
  isOpen: boolean;
  plans: Plan[];
}

export function PlanSelectionModal({ isOpen, plans }: PlanSelectionModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");

  // Filtrar apenas planos ativos e não enterprise (Enterprise é via formulário separado)
  const availablePlans = plans.filter(p => p.isActive && !p.isEnterprise);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleActivatePlan = async () => {
    if (!selectedPlan) return;

    setIsActivating(true);
    try {
      if (selectedPlan.isTrial) {
        // Ativar trial
        const response = await fetch("/api/company/activate-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: selectedPlan.planId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Erro ao ativar trial");
        }

        toast({
          title: "Trial ativado!",
          description: "Seu trial foi ativado com sucesso. Bem-vindo!",
        });

        // Recarregar página para atualizar estado
        window.location.href = getAbsoluteUrl("/dashboard");
      } else {
        // Redirecionar para checkout
        window.location.href = getAbsoluteUrl(`/dashboard/plans?plan=${selectedPlan.planId}&billing=${billingCycle}`);
      }
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

  const trialPlan = availablePlans.find(p => p.isTrial);
  const paidPlans = availablePlans.filter(p => !p.isTrial);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-[#0a0a0f] border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 border-b border-white/10">
          <DialogTitle className="text-2xl flex items-center gap-2 text-white">
            <CreditCard className="w-6 h-6 text-neon-cyan" />
            Escolha seu Plano
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Selecione um plano para começar a usar a plataforma. Você pode começar com o trial grátis ou escolher um plano pago.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Trial Plan */}
          {trialPlan && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Comece Grátis
              </h3>
              <div
                className={`rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                  selectedPlan?.id === trialPlan.id
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
                      {getFeatures(trialPlan).slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
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
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      billingCycle === "MONTHLY"
                        ? "bg-neon-cyan text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setBillingCycle("YEARLY")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      billingCycle === "YEARLY"
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
                  const price = billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;
                  
                  return (
                    <div
                      key={plan.id}
                      className={`rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                        selectedPlan?.id === plan.id
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
                            {price ? formatPrice(price).replace("R$", "").trim() : "Customizado"}
                          </span>
                          <span className="text-sm text-gray-400">/mês</span>
                        </div>
                        {billingCycle === "YEARLY" && plan.yearlyPrice && plan.monthlyPrice && (
                          <p className="text-xs text-green-400 mt-1">
                            Economia de R$ {((plan.monthlyPrice - plan.yearlyPrice) * 12).toLocaleString("pt-BR")}/ano
                          </p>
                        )}
                      </div>
                      <ul className="space-y-2 mb-4">
                        {getFeatures(plan).slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
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
          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button
              onClick={handleActivatePlan}
              disabled={!selectedPlan || isActivating}
              className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90 min-w-[200px]"
            >
              {isActivating ? (
                "Processando..."
              ) : selectedPlan?.isTrial ? (
                <>
                  Ativar Trial Grátis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Continuar para Pagamento
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

