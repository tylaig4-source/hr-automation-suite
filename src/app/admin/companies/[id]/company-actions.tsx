"use client";

import { useState } from "react";
import { Edit, Plus, Trash2, CreditCard, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
  plan: string;
  credits: number;
  maxUsers: number;
  maxExecutions: number;
}

interface CompanyActionsProps {
  company: Company;
}

export function CompanyActions({ company }: CompanyActionsProps) {
  const router = useRouter();
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [addCreditsOpen, setAddCreditsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [selectedPlan, setSelectedPlan] = useState(company.plan);
  const [creditsToAdd, setCreditsToAdd] = useState("50");

  const handleUpdatePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/${company.id}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      if (response.ok) {
        setEditPlanOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/${company.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: parseInt(creditsToAdd) }),
      });

      if (response.ok) {
        setAddCreditsOpen(false);
        setCreditsToAdd("50");
        router.refresh();
      }
    } catch (error) {
      console.error("Error adding credits:", error);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { id: "STARTER", name: "Starter", price: "R$ 197/mês", users: 2, executions: 100 },
    { id: "PROFESSIONAL", name: "Professional", price: "R$ 497/mês", users: 10, executions: 500 },
    { id: "ENTERPRISE", name: "Enterprise", price: "Sob consulta", users: -1, executions: -1 },
  ];

  return (
    <>
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => setAddCreditsOpen(true)}
          className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Créditos
        </Button>
        <Button 
          onClick={() => setEditPlanOpen(true)}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/10"
        >
          <Edit className="h-4 w-4 mr-2" />
          Alterar Plano
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white">
            <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
              Enviar notificação
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-white/5">
              Ver logs de auditoria
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4 mr-2" />
              Desativar empresa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
        <DialogContent className="bg-[#1a1a24] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription className="text-gray-400">
              Selecione o novo plano para {company.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedPlan === plan.id
                    ? "border-neon-cyan bg-neon-cyan/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{plan.name}</p>
                    <p className="text-sm text-gray-400">{plan.price}</p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <p>{plan.users === -1 ? "Ilimitado" : `${plan.users} usuários`}</p>
                    <p>{plan.executions === -1 ? "Ilimitado" : `${plan.executions} exec/mês`}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditPlanOpen(false)}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdatePlan}
              disabled={loading || selectedPlan === company.plan}
              className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Credits Dialog */}
      <Dialog open={addCreditsOpen} onOpenChange={setAddCreditsOpen}>
        <DialogContent className="bg-[#1a1a24] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Créditos</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adicione créditos para {company.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400">Créditos atuais</p>
              <p className="text-2xl font-bold text-green-400">{company.credits}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits" className="text-gray-300">Quantidade a adicionar</Label>
              <Input
                id="credits"
                type="number"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                min="1"
              />
            </div>
            <div className="mt-4 flex gap-2">
              {[50, 100, 200, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCreditsToAdd(amount.toString())}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    creditsToAdd === amount.toString()
                      ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  +{amount}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddCreditsOpen(false)}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddCredits}
              disabled={loading || !creditsToAdd || parseInt(creditsToAdd) <= 0}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {loading ? "Adicionando..." : `Adicionar ${creditsToAdd} créditos`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

