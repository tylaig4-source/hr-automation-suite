"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Zap, DollarSign, Activity, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TokenUsageData {
  today: {
    tokens: number;
    executions: number;
    avgPerExecution: number;
  };
  thisMonth: {
    tokens: number;
    executions: number;
    avgPerExecution: number;
  };
  lastMonth: {
    tokens: number;
  };
  estimated: {
    monthlyTokens: number;
    monthlyCost: number;
  };
  growth: number;
  hourlyUsage: Array<{ hour: number; tokens: number }>;
  recentExecutions: Array<{
    id: string;
    tokens: number;
    agentName: string;
    createdAt: string;
  }>;
}

export function TokenUsageWidget() {
  const [data, setData] = useState<TokenUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/company/token-usage");
      if (!response.ok) {
        throw new Error("Erro ao buscar dados");
      }
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Card className="glass border-neon-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-cyan" />
            Uso de Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="glass border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-400" />
            Uso de Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400 text-sm">{error}</p>
          <Button onClick={fetchData} variant="outline" size="sm" className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toLocaleString("pt-BR");
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  return (
    <Card className="glass border-neon-cyan/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-neon-cyan" />
              Uso de Tokens em Tempo Real
            </CardTitle>
            <CardDescription className="mt-1">
              Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}
            </CardDescription>
          </div>
          <Button
            onClick={fetchData}
            variant="ghost"
            size="icon"
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
            <p className="text-xs text-gray-400 mb-1">Hoje</p>
            <p className="text-2xl font-bold text-neon-cyan">
              {formatNumber(data.today.tokens)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.today.executions} execuções
            </p>
          </div>
          <div className="p-4 rounded-xl bg-neon-magenta/10 border border-neon-magenta/20">
            <p className="text-xs text-gray-400 mb-1">Este Mês</p>
            <p className="text-2xl font-bold text-neon-magenta">
              {formatNumber(data.thisMonth.tokens)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.thisMonth.executions} execuções
            </p>
          </div>
        </div>

        {/* Crescimento */}
        {data.growth !== 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {data.growth > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm text-gray-300">
              {data.growth > 0 ? "+" : ""}
              {data.growth.toFixed(1)}% comparado ao mês passado
            </span>
          </div>
        )}

        {/* Estimativa Mensal */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <p className="text-sm font-medium text-gray-300">Estimativa Mensal</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">
              {formatNumber(data.estimated.monthlyTokens)}
            </p>
            <p className="text-sm text-gray-400">tokens</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Custo estimado: {formatCurrency(data.estimated.monthlyCost)}
          </p>
        </div>

        {/* Média por Execução */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border">
            <p className="text-xs text-gray-400 mb-1">Média hoje</p>
            <p className="text-lg font-semibold text-white">
              {formatNumber(data.today.avgPerExecution)}
            </p>
            <p className="text-xs text-gray-500">tokens/execução</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border">
            <p className="text-xs text-gray-400 mb-1">Média mensal</p>
            <p className="text-lg font-semibold text-white">
              {formatNumber(data.thisMonth.avgPerExecution)}
            </p>
            <p className="text-xs text-gray-500">tokens/execução</p>
          </div>
        </div>

        {/* Gráfico de Uso por Hora */}
        {data.hourlyUsage.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-300">Uso por Hora (Hoje)</p>
            </div>
            <div className="flex items-end gap-1 h-24">
              {data.hourlyUsage.map((item) => {
                const maxTokens = Math.max(...data.hourlyUsage.map((h) => h.tokens));
                const height = maxTokens > 0 ? (item.tokens / maxTokens) * 100 : 0;
                return (
                  <div key={item.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-neon-cyan/60 to-neon-cyan/30 transition-all hover:from-neon-cyan/80 hover:to-neon-cyan/50"
                      style={{ height: `${height}%` }}
                      title={`${item.hour}h: ${formatNumber(item.tokens)} tokens`}
                    />
                    <span className="text-xs text-gray-500">{item.hour}h</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Últimas Execuções */}
        {data.recentExecutions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Últimas Execuções</p>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {data.recentExecutions.slice(0, 5).map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs"
                >
                  <span className="text-gray-400 truncate flex-1">{execution.agentName}</span>
                  <span className="text-neon-cyan font-medium ml-2">
                    {formatNumber(execution.tokens)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

