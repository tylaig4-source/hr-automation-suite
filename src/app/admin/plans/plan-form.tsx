"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const planSchema = z.object({
  planId: z.string().min(1, "Plan ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  monthlyPrice: z.number().nullable(),
  yearlyPrice: z.number().nullable(),
  yearlyTotal: z.number().nullable(),
  maxUsers: z.number().nullable(),
  maxExecutions: z.number().nullable(),
  maxCredits: z.number().nullable(),
  isActive: z.boolean(),
  isPopular: z.boolean(),
  isTrial: z.boolean(),
  isEnterprise: z.boolean(),
  orderIndex: z.number().min(0),
  stripePriceIdMonthly: z.string().optional().nullable(),
  stripePriceIdYearly: z.string().optional().nullable(),
  features: z.array(z.string()),
});

type PlanFormData = z.infer<typeof planSchema>;

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
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  orderIndex: number;
}

interface PlanFormProps {
  plan: Plan;
  isNew?: boolean;
  onSuccess: () => void;
}

export function PlanForm({ plan, isNew = false, onSuccess }: PlanFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [features, setFeatures] = useState<string[]>(
    Array.isArray(plan.features) ? plan.features : []
  );
  const [newFeature, setNewFeature] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      planId: plan.planId || "",
      name: plan.name || "",
      description: plan.description || "",
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      yearlyTotal: plan.yearlyTotal,
      maxUsers: plan.maxUsers,
      maxExecutions: plan.maxExecutions,
      maxCredits: plan.maxCredits,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      isTrial: plan.isTrial,
      isEnterprise: plan.isEnterprise,
      orderIndex: plan.orderIndex,
      stripePriceIdMonthly: plan.stripePriceIdMonthly || "",
      stripePriceIdYearly: plan.stripePriceIdYearly || "",
      features: features,
    },
  });

  const addFeature = () => {
    if (newFeature.trim()) {
      const updated = [...features, newFeature.trim()];
      setFeatures(updated);
      setValue("features", updated);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated);
    setValue("features", updated);
  };

  const onSubmit = async (data: PlanFormData) => {
    setIsLoading(true);
    try {
      const url = isNew ? "/api/admin/plans" : `/api/admin/plans/${plan.id}`;
      const method = isNew ? "POST" : "PATCH";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          features: features,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Erro ao ${isNew ? "criar" : "atualizar"} plano`);
      }

      toast({
        title: "Sucesso",
        description: `Plano ${isNew ? "criado" : "atualizado"} com sucesso!`,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${isNew ? "criar" : "atualizar"} plano`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="planId">Plan ID (Código Único)</Label>
          <Input
            id="planId"
            {...register("planId")}
            className="bg-white/5 border-white/10 text-white"
            disabled={!isNew}
            placeholder="Ex: STARTER, BASIC, PREMIUM"
          />
          {errors.planId && (
            <p className="text-red-400 text-sm mt-1">{errors.planId.message}</p>
          )}
          {!isNew && (
            <p className="text-gray-500 text-xs mt-1">Plan ID não pode ser alterado</p>
          )}
        </div>

        <div>
          <Label htmlFor="name">Nome do Plano</Label>
          <Input
            id="name"
            {...register("name")}
            className="bg-white/5 border-white/10 text-white"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="orderIndex">Ordem de Exibição</Label>
        <Input
          id="orderIndex"
          type="number"
          {...register("orderIndex", { valueAsNumber: true })}
          className="bg-white/5 border-white/10 text-white"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
          className="bg-white/5 border-white/10 text-white"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="monthlyPrice">Preço Mensal (R$)</Label>
          <Input
            id="monthlyPrice"
            type="number"
            step="0.01"
            {...register("monthlyPrice", { valueAsNumber: true })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="yearlyPrice">Preço Anual por Mês (R$)</Label>
          <Input
            id="yearlyPrice"
            type="number"
            step="0.01"
            {...register("yearlyPrice", { valueAsNumber: true })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="yearlyTotal">Total Anual (R$)</Label>
          <Input
            id="yearlyTotal"
            type="number"
            step="0.01"
            {...register("yearlyTotal", { valueAsNumber: true })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="maxUsers">Máximo de Usuários</Label>
          <Input
            id="maxUsers"
            type="number"
            {...register("maxUsers", { valueAsNumber: true })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="null = ilimitado"
          />
        </div>

        <div>
          <Label htmlFor="maxExecutions">Máximo de Execuções/mês</Label>
          <Input
            id="maxExecutions"
            type="number"
            {...register("maxExecutions", { valueAsNumber: true })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="null = ilimitado"
          />
        </div>

        <div>
          <Label htmlFor="maxCredits">Máximo de Créditos</Label>
          <Input
            id="maxCredits"
            type="number"
            {...register("maxCredits", { valueAsNumber: true })}
            className="bg-white/5 border-white/10 text-white"
            placeholder="null = ilimitado"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stripePriceIdMonthly">Stripe Price ID (Mensal)</Label>
          <Input
            id="stripePriceIdMonthly"
            {...register("stripePriceIdMonthly")}
            className="bg-white/5 border-white/10 text-white"
            placeholder="price_..."
          />
        </div>

        <div>
          <Label htmlFor="stripePriceIdYearly">Stripe Price ID (Anual)</Label>
          <Input
            id="stripePriceIdYearly"
            {...register("stripePriceIdYearly")}
            className="bg-white/5 border-white/10 text-white"
            placeholder="price_..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="isActive">Ativo</Label>
          <Switch
            id="isActive"
            checked={watch("isActive")}
            onCheckedChange={(checked) => setValue("isActive", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isPopular">Popular (Badge)</Label>
          <Switch
            id="isPopular"
            checked={watch("isPopular")}
            onCheckedChange={(checked) => setValue("isPopular", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isTrial">Trial</Label>
          <Switch
            id="isTrial"
            checked={watch("isTrial")}
            onCheckedChange={(checked) => setValue("isTrial", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isEnterprise">Enterprise</Label>
          <Switch
            id="isEnterprise"
            checked={watch("isEnterprise")}
            onCheckedChange={(checked) => setValue("isEnterprise", checked)}
          />
        </div>
      </div>

      <div>
        <Label>Features</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFeature();
              }
            }}
            className="bg-white/5 border-white/10 text-white"
            placeholder="Adicionar feature..."
          />
          <Button type="button" onClick={addFeature} variant="outline">
            Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
            >
              <span className="text-white text-sm">{feature}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFeature(index)}
                className="text-red-400 hover:text-red-300"
              >
                Remover
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="border-white/10 text-white hover:bg-white/10"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90"
        >
          {isLoading ? (isNew ? "Criando..." : "Salvando...") : (isNew ? "Criar Plano" : "Salvar Alterações")}
        </Button>
      </div>
    </form>
  );
}

