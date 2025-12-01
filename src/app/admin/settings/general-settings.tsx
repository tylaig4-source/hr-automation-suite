"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, CreditCard } from "lucide-react";

export function GeneralSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allowTrialWithoutCard, setAllowTrialWithoutCard] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/general");
      if (response.ok) {
        const data = await response.json();
        setAllowTrialWithoutCard(data.allowTrialWithoutCard ?? true);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações gerais:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowTrialWithoutCard }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Configurações salvas com sucesso!",
        });
        await loadSettings();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowTrialWithoutCard" className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-neon-cyan" />
              Permitir Trial sem Cartão
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Quando desabilitado, usuários precisam assinar um plano para usar os agentes.
              Ações ficam bloqueadas até a assinatura.
            </p>
          </div>
          <Switch
            id="allowTrialWithoutCard"
            checked={allowTrialWithoutCard}
            onCheckedChange={setAllowTrialWithoutCard}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-blue-400">
          <strong>Nota:</strong> As configurações de trial (dias, créditos, execuções) são gerenciadas através do plano TRIAL em <strong>Planos</strong>.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}

