"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface UsageData {
    plan: string;
    credits: number;
    maxExecutions: number;
    usedExecutions: number;
    percentage: number;
    isUnlimited: boolean;
}

export function UsageCard() {
    const [data, setData] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUsage = async () => {
        try {
            const res = await fetch("/api/company/usage");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Erro ao carregar uso:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsage();

        // Atualizar a cada 30 segundos ou quando a janela ganhar foco
        const interval = setInterval(fetchUsage, 30000);
        const onFocus = () => fetchUsage();

        window.addEventListener("focus", onFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", onFocus);
        };
    }, []);

    if (loading) {
        return (
            <div className="rounded-lg bg-muted/50 p-4 animate-pulse">
                <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-2" />
                <div className="h-3 w-32 bg-muted-foreground/20 rounded mb-3" />
                <div className="h-2 w-full bg-muted-foreground/20 rounded" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="rounded-lg bg-destructive/10 p-4">
                <p className="text-xs text-destructive">Erro ao carregar uso</p>
            </div>
        );
    }

    const planName = {
        STARTER: "Plano Starter",
        PROFESSIONAL: "Plano Professional",
        ENTERPRISE: "Plano Enterprise",
    }[data.plan] || data.plan;

    return (
        <div className="rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4">
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">{planName}</p>
                {data.isUnlimited && <span className="text-xs font-bold text-primary">∞</span>}
            </div>

            <p className="text-xs text-muted-foreground mb-2">
                {data.isUnlimited
                    ? "Execuções ilimitadas"
                    : `${data.usedExecutions}/${data.maxExecutions} execuções este mês`
                }
            </p>

            {!data.isUnlimited && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${data.percentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}
