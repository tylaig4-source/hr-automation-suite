"use client";

import { useState } from "react";
import { CreditCard, Edit, Trash2, CheckCircle, XCircle, Star } from "lucide-react";
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

  return (
    <div className="space-y-4">
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

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>ID: {plan.planId}</span>
                <span>•</span>
                <span>Ordem: {plan.orderIndex}</span>
                {plan.stripePriceIdMonthly && (
                  <>
                    <span>•</span>
                    <span>Stripe: {plan.stripePriceIdMonthly.slice(0, 20)}...</span>
                  </>
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

