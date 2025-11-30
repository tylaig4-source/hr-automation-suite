"use client";

import { useEffect, useState } from "react";
import { Zap, Clock, AlertTriangle, Users, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UsageData {
    plan: string;
    credits: number;
    maxExecutions: number;
    usedExecutions: number;
    executionsPercentage: number;
    maxUsers: number;
    usedUsers: number;
    usersPercentage: number;
    percentage: number; // Mantido para compatibilidade
    isUnlimited: boolean;
    isTrialing: boolean;
    trialEndDate: string | null;
    trialDaysLeft: number;
    trialExpired: boolean;
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
        TRIAL: "Trial Grátis",
        STARTER: "Trial Grátis",
        PROFESSIONAL: "Professional",
        ENTERPRISE: "Enterprise",
    }[data.plan] || data.plan;
    
    // Tratar STARTER como TRIAL para compatibilidade
    const isTrial = data.isTrialing || data.plan === "TRIAL" || data.plan === "STARTER";

    // Se é trial
    if (isTrial) {
        const isExpiringSoon = data.trialDaysLeft <= 1;
        const isExpired = data.trialExpired;

        return (
            <Link href="/dashboard/plans">
                <div className={`rounded-lg p-4 transition-colors cursor-pointer ${
                    isExpired 
                        ? "bg-red-500/10 border border-red-500/30 hover:bg-red-500/20" 
                        : isExpiringSoon
                            ? "bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
                            : "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20"
                }`}>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium flex items-center gap-1">
                            {isExpired ? (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            ) : isExpiringSoon ? (
                                <Clock className="w-4 h-4 text-amber-500" />
                            ) : (
                                <Zap className="w-4 h-4 text-primary" />
                            )}
                            {planName}
                        </p>
                    </div>

                    <p className={`text-xs mb-2 ${
                        isExpired 
                            ? "text-red-500 font-medium" 
                            : isExpiringSoon 
                                ? "text-amber-500 font-medium" 
                                : "text-muted-foreground"
                    }`}>
                        {isExpired 
                            ? "Trial expirado - Assine agora!" 
                            : `${data.trialDaysLeft} dia${data.trialDaysLeft !== 1 ? 's' : ''} restante${data.trialDaysLeft !== 1 ? 's' : ''}`
                        }
                    </p>

                    {/* Créditos/Requisições (são a mesma coisa) */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Créditos Disponíveis
                            </p>
                            <p className="text-xs font-medium">
                                {data.credits}/{data.maxExecutions}
                            </p>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${
                                    isExpired 
                                        ? "bg-red-500" 
                                        : isExpiringSoon 
                                            ? "bg-amber-500" 
                                            : "bg-gradient-to-r from-indigo-500 to-purple-500"
                                }`}
                                style={{ width: `${Math.min((data.credits / data.maxExecutions) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.usedExecutions} requisições usadas este mês
                        </p>
                    </div>

                    {/* Usuários */}
                    <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Usuários
                            </p>
                            <p className="text-xs font-medium">
                                {data.usedUsers}/{data.maxUsers}
                            </p>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${
                                    isExpired 
                                        ? "bg-red-500" 
                                        : isExpiringSoon 
                                            ? "bg-amber-500" 
                                            : "bg-gradient-to-r from-indigo-500 to-purple-500"
                                }`}
                                style={{ width: `${Math.min(data.usersPercentage, 100)}%` }}
                            />
                        </div>
                    </div>

                    {!isExpired && (
                        <Link href="/dashboard/plans">
                            <Button 
                                size="sm" 
                                className="w-full mt-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                            >
                                Fazer Upgrade Agora
                            </Button>
                        </Link>
                    )}
                    {isExpired && (
                        <Link href="/dashboard/plans">
                            <Button 
                                size="sm" 
                                className="w-full mt-3 bg-red-600 hover:bg-red-700"
                            >
                                Assinar Agora
                            </Button>
                        </Link>
                    )}
                </div>
            </Link>
        );
    }

    // Plano normal
    return (
        <Link href="/dashboard/plans">
            <div className="rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 hover:from-indigo-500/20 hover:to-purple-500/20 transition-colors cursor-pointer">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium">{planName}</p>
                    {data.isUnlimited ? (
                        <span className="text-xs font-bold text-primary">∞</span>
                    ) : (
                        <Zap className="w-4 h-4 text-primary" />
                    )}
                </div>

                {/* Créditos/Requisições (são a mesma coisa) */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Créditos Disponíveis
                        </p>
                        <p className="text-xs font-medium">
                            {data.isUnlimited ? "∞" : `${data.credits}/${data.maxExecutions}`}
                        </p>
                    </div>
                    {!data.isUnlimited && (
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${Math.min((data.credits / data.maxExecutions) * 100, 100)}%` }}
                            />
                        </div>
                    )}
                    {!data.isUnlimited && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.usedExecutions} requisições usadas este mês
                        </p>
                    )}
                </div>

                {/* Usuários */}
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Usuários
                        </p>
                        <p className="text-xs font-medium">
                            {data.isUnlimited ? "∞" : `${data.usedUsers}/${data.maxUsers}`}
                        </p>
                    </div>
                    {!data.isUnlimited && (
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${Math.min(data.usersPercentage, 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
