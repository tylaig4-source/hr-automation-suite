"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Clock, CreditCard, Save } from "lucide-react";

interface TrialSettings {
  trialDays: number;
  trialCredits: number;
  allowTrialWithoutCard: boolean;
}

export function TrialSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<TrialSettings>({
    trialDays: 3,
    trialCredits: 50,
    allowTrialWithoutCard: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/trial");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações de trial:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (settings.trialDays < 1 || settings.trialDays > 365) {
      toast({
        title: "Erro",
        description: "Dias de trial devem estar entre 1 e 365",
        variant: "destructive",
      });
      return;
    }

    if (settings.trialCredits < 1) {
      toast({
        title: "Erro",
        description: "Créditos de trial devem ser pelo menos 1",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Configurações de trial salvas com sucesso!",
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
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="trialDays" className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-neon-cyan" />
            Dias de Trial
          </Label>
          <Input
            id="trialDays"
            type="number"
            min="1"
            max="365"
            value={settings.trialDays}
            onChange={(e) =>
              setSettings({ ...settings, trialDays: parseInt(e.target.value) || 3 })
            }
            className="bg-white/5 border-white/10 text-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Número de dias que o trial ficará ativo (1-365)
          </p>
        </div>

        <div>
          <Label htmlFor="trialCredits" className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-neon-magenta" />
            Créditos de Trial
          </Label>
          <Input
            id="trialCredits"
            type="number"
            min="1"
            value={settings.trialCredits}
            onChange={(e) =>
              setSettings({ ...settings, trialCredits: parseInt(e.target.value) || 50 })
            }
            className="bg-white/5 border-white/10 text-white"
          />
          <p className="text-xs text-gray-500 mt-1">
            Quantidade de créditos disponíveis durante o trial
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowTrialWithoutCard" className="text-base font-semibold">
              Permitir Trial sem Cartão
            </Label>
            <p className="text-sm text-gray-400 mt-1">
              Quando desabilitado, usuários precisam assinar um plano para usar os agentes.
              Ações ficam bloqueadas até a assinatura.
            </p>
          </div>
          <Switch
            id="allowTrialWithoutCard"
            checked={settings.allowTrialWithoutCard}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, allowTrialWithoutCard: checked })
            }
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-black font-semibold hover:opacity-90"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}

