"use client";

import { useState } from "react";
import { CreditCard, Edit, Trash2, CheckCircle, XCircle, Star, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PlanForm } from "./plan-form";

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
  features: any; // JSON array
  isActive: boolean;
  isPopular: boolean;
  isTrial: boolean;
  isEnterprise: boolean;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PlansClientProps {
  plans: Plan[];
}

export function PlansClient({ plans }: PlansClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

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

  const syncWithStripe = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/admin/plans/sync-stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Body vazio é válido
      });

      if (!response.ok) {
        let errorMessage = "Erro ao sincronizar com Stripe";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      toast({
        title: "Sincronização concluída!",
        description: data.message || "Planos sincronizados com sucesso",
      });

      // Recarregar página para mostrar os IDs atualizados
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("[Sync Stripe Frontend] Erro:", error);
      toast({
        title: "Erro ao sincronizar",
        description: error.message || "Erro ao sincronizar planos com Stripe. Verifique os logs do servidor.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Criar plano vazio para novo plano
  const emptyPlan: Plan = {
    id: "",
    planId: "",
    name: "",
    description: null,
    monthlyPrice: null,
    yearlyPrice: null,
    yearlyTotal: null,
    maxUsers: null,
    maxExecutions: null,
    maxCredits: null,
    features: [],
    isActive: true,
    isPopular: false,
    isTrial: false,
    isEnterprise: false,
    stripePriceIdMonthly: null,
    stripePriceIdYearly: null,
    orderIndex: plans.length > 0 ? Math.max(...plans.map(p => p.orderIndex)) + 1 : 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="space-y-4">
      {/* Botões de Ação */}
      <div className="flex justify-between items-center">
        <Dialog open={isNewPlanOpen} onOpenChange={setIsNewPlanOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl bg-[#0a0a0f] border-white/10 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Criar Novo Plano</DialogTitle>
              <DialogDescription className="text-gray-400">
                Preencha os dados do novo plano
              </DialogDescription>
            </DialogHeader>
            <PlanForm
              plan={emptyPlan}
              isNew={true}
              onSuccess={() => {
                setIsNewPlanOpen(false);
                window.location.reload();
              }}
            />
          </DialogContent>
        </Dialog>

        <Button
          onClick={syncWithStripe}
          disabled={isSyncing}
          className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Sincronizando..." : "Sincronizar com Stripe"}
        </Button>
      </div>

      {plans.map((plan) => (
        <div
          key={plan.id}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                {plan.isPopular && (
                  <Badge className="bg-neon-magenta/20 text-neon-magenta border-neon-magenta/30">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {plan.isTrial && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    Trial
                  </Badge>
                )}
                {plan.isEnterprise && (
                  <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                    Enterprise
                  </Badge>
                )}
                {plan.isActive ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inativo
                  </Badge>
                )}
              </div>

              {plan.description && (
                <p className="text-gray-400 mb-4">{plan.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Preço Mensal</p>
                  <p className="text-lg font-semibold text-white">
                    {formatPrice(plan.monthlyPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Preço Anual</p>
                  <p className="text-lg font-semibold text-white">
                    {formatPrice(plan.yearlyPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Usuários</p>
                  <p className="text-lg font-semibold text-white">
                    {formatLimit(plan.maxUsers)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Execuções/mês</p>
                  <p className="text-lg font-semibold text-white">
                    {formatLimit(plan.maxExecutions)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Features:</p>
                <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                  {getFeatures(plan).slice(0, 4).map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                  {getFeatures(plan).length > 4 && (
                    <li className="text-gray-500">
                      +{getFeatures(plan).length - 4} mais...
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">ID: {plan.planId}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">Ordem: {plan.orderIndex}</span>
                {plan.stripePriceIdMonthly && (
                  <>
                    <span className="text-gray-500">•</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Stripe Configurado
                    </Badge>
                  </>
                )}
                {!plan.stripePriceIdMonthly && !plan.isTrial && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                    Não sincronizado
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Dialog open={isFormOpen && selectedPlan?.id === plan.id} onOpenChange={(open) => {
                setIsFormOpen(open);
                if (!open) setSelectedPlan(null);
              }}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsFormOpen(true);
                    }}
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl bg-[#0a0a0f] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Editar Plano</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Atualize as informações do plano {plan.name}
                    </DialogDescription>
                  </DialogHeader>
                  {selectedPlan && (
                    <PlanForm
                      plan={selectedPlan}
                      onSuccess={() => {
                        setIsFormOpen(false);
                        setSelectedPlan(null);
                        window.location.reload();
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      ))}

      {plans.length === 0 && (
        <div className="text-center py-12 rounded-2xl border border-white/10 bg-white/5">
          <CreditCard className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Nenhum plano cadastrado</p>
          <p className="text-sm text-gray-500 mt-2">
            Execute o seed para criar os planos iniciais: npm run db:seed
          </p>
        </div>
      )}
    </div>
  );
}

