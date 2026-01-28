"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, DollarSign, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_MODEL_PRICING } from "@/lib/model-pricing";

interface ModelPricing {
  model: string;
  provider: "openai" | "anthropic" | "google";
  inputPrice: number;
  outputPrice: number;
}

export function ModelPricingSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricing, setPricing] = useState<Record<string, ModelPricing>>({});

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const response = await fetch("/api/admin/settings/model-pricing");
      if (response.ok) {
        const data = await response.json();
        setPricing(data.pricing || DEFAULT_MODEL_PRICING);
      } else {
        // Se não encontrar, usar padrões
        setPricing(DEFAULT_MODEL_PRICING);
      }
    } catch (error) {
      console.error("Erro ao carregar preços:", error);
      setPricing(DEFAULT_MODEL_PRICING);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/model-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Preços dos modelos salvos com sucesso!",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar preços",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = (model: string, field: "inputPrice" | "outputPrice", value: string) => {
    setPricing((prev) => ({
      ...prev,
      [model]: {
        ...prev[model],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const models = Object.values(pricing).sort((a, b) => {
    if (a.provider !== b.provider) {
      return a.provider.localeCompare(b.provider);
    }
    return a.model.localeCompare(b.model);
  });

  const groupedByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelPricing[]>);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-neon-cyan" />
          <h3 className="text-lg font-semibold text-white">Preços dos Modelos de IA</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Configure os preços por token para cada modelo. Valores em USD por 1.000 tokens.
          Os valores padrão são baseados nos preços oficiais de 2024.
        </p>
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-200">
              <strong>Nota:</strong> Os custos são calculados automaticamente baseados no uso real de tokens.
              A proporção padrão é 70% input / 30% output. Você pode ajustar os valores conforme necessário.
            </p>
          </div>
        </div>
      </div>

      {Object.entries(groupedByProvider).map(([provider, providerModels]) => (
        <div key={provider} className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            {provider === "openai" ? "OpenAI" : provider === "anthropic" ? "Anthropic" : "Google"}
          </h4>
          <div className="grid gap-4">
            {providerModels.map((model) => (
              <div
                key={model.model}
                className="p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-white font-medium">{model.model}</Label>
                    <p className="text-xs text-gray-400 mt-1">
                      {model.provider === "openai" && "GPT Model"}
                      {model.provider === "anthropic" && "Claude Model"}
                      {model.provider === "google" && "Gemini Model"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-400">Input (por 1K tokens)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">$</span>
                      <Input
                        type="number"
                        step="0.00001"
                        min="0"
                        value={model.inputPrice}
                        onChange={(e) => updatePrice(model.model, "inputPrice", e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-400">Output (por 1K tokens)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">$</span>
                      <Input
                        type="number"
                        step="0.00001"
                        min="0"
                        value={model.outputPrice}
                        onChange={(e) => updatePrice(model.model, "outputPrice", e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-500">
                    Custo médio por token: $
                    {((model.inputPrice * 0.7 + model.outputPrice * 0.3) / 1000).toFixed(8)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Preços
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

