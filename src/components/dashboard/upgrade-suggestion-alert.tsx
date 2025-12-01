"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface UpgradeSuggestion {
  shouldSuggest: boolean;
  daysSinceSubscription: number;
  monthlyPrice: number;
  yearlyPrice: number | null;
  yearlyTotal: number | null;
  savings: number | null;
  savingsPercentage: number | null;
  planId: string;
  planName: string;
}

export function UpgradeSuggestionAlert() {
  const [suggestion, setSuggestion] = useState<UpgradeSuggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSuggestion() {
      try {
        const response = await fetch("/api/subscription/upgrade-suggestion");
        const data = await response.json();
        
        if (data.shouldSuggest) {
          setSuggestion(data);
        }
      } catch (error) {
        console.error("Erro ao buscar sugestão de upgrade:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestion();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    // Salvar no localStorage para não mostrar novamente por algumas horas
    localStorage.setItem("upgrade-suggestion-dismissed", Date.now().toString());
  };

  const handleUpgrade = () => {
    router.push(`/dashboard/plans?upgrade=${suggestion?.planId}&cycle=YEARLY`);
  };

  // Verificar se foi descartado recentemente (últimas 6 horas)
  useEffect(() => {
    const dismissedTime = localStorage.getItem("upgrade-suggestion-dismissed");
    if (dismissedTime) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 6) {
        setDismissed(true);
      }
    }
  }, []);

  if (loading || dismissed || !suggestion || !suggestion.shouldSuggest) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Alert className="border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 mb-6 relative">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Sparkles className="h-6 w-6 text-amber-400" />
        </div>
        
        <div className="flex-1">
          <AlertTitle className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Economize com o Plano Anual!
          </AlertTitle>
          
          <AlertDescription className="space-y-3">
            <p className="text-gray-300">
              Você está no plano <strong className="text-white">{suggestion.planName}</strong> há{" "}
              <strong className="text-white">{suggestion.daysSinceSubscription} dias</strong>.
            </p>

            {suggestion.savings && suggestion.savingsPercentage && (
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-400">
                    {suggestion.savingsPercentage}% OFF
                  </span>
                  <span className="text-sm text-gray-400">no plano anual</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Mensal: </span>
                    <span className="line-through text-gray-500">
                      {formatCurrency(suggestion.monthlyPrice * 12)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Anual: </span>
                    <span className="text-amber-400 font-bold">
                      {suggestion.yearlyTotal ? formatCurrency(suggestion.yearlyTotal) : "—"}
                    </span>
                  </div>
                  <div className="ml-auto">
                    <span className="text-green-400 font-semibold">
                      Economize {formatCurrency(suggestion.savings)}/ano
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleUpgrade}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Fazer Upgrade para Anual
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-300"
              >
                Lembrar depois
              </Button>
            </div>
          </AlertDescription>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-300 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </Alert>
  );
}

