"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Building2, CreditCard, Users, Activity, Calendar, ArrowRight, DollarSign, Clock, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { EnterpriseFormModal } from "@/components/enterprise/enterprise-form-modal";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Company {
    id: string;
    name: string;
    plan: string;
    credits: number;
    maxUsers: number;
    maxExecutions: number;
    subscription: {
        id: string;
        status: string;
        planId: string;
        value: number;
        nextDueDate: Date | null;
        billingType: string;
    } | null;
    _count: {
        users: number;
        executions: number;
    };
}

interface PlansClientProps {
    company: Company;
}

const plans = [
    {
        id: "TRIAL",
        name: "Trial",
        monthlyPrice: 0,
        yearlyPrice: 0,
        totalYearly: 0,
        description: "Teste grátis por 3 dias",
        features: [
            "1 usuário",
            "10 requisições",
            "50 créditos",
            "Todos os 34 agentes",
            "Todas as 8 categorias",
            "Exportação PDF",
            "Histórico de 30 dias",
            "Suporte por e-mail",
        ],
        icon: Clock,
        color: "#06b6d4",
        popular: false,
    },
    {
        id: "PROFESSIONAL",
        name: "Professional",
        monthlyPrice: 597,
        yearlyPrice: 497,
        totalYearly: 5964,
        description: "Para PMEs e times de RH",
        features: [
            "Até 5 usuários",
            "500 requisições por mês",
            "Todos os 34 agentes de IA",
            "Todas as 8 categorias",
            "Exportação PDF e Word",
            "Histórico de 12 meses",
            "Suporte por chat e e-mail",
            "Templates ilimitados",
        ],
        icon: Zap,
        color: "#8b5cf6",
        popular: true,
    },
    {
        id: "ENTERPRISE",
        name: "Enterprise",
        monthlyPrice: null,
        yearlyPrice: null,
        totalYearly: null,
        description: "Para grandes empresas e multinacionais",
        features: [
            "Usuários ilimitados",
            "Requisições ilimitadas",
            "Agentes customizados para sua empresa",
            "Integrações (ATS, HRIS, ERP)",
            "SSO e autenticação corporativa",
            "API dedicada",
            "Gerente de conta exclusivo",
            "SLA garantido + Treinamento",
        ],
        icon: Building2,
        color: "#06b6d4",
        popular: false,
    },
];

const statusLabels: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "Ativo", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30" },
    PENDING: { label: "Aguardando Pagamento", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30" },
    OVERDUE: { label: "Vencido", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30" },
    CANCELED: { label: "Cancelado", color: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30" },
};

interface UsageData {
    plan: string;
    credits: number;
    maxExecutions: number;
    usedExecutions: number;
    executionsPercentage: number;
    maxUsers: number;
    usedUsers: number;
    usersPercentage: number;
    isUnlimited: boolean;
    isTrialing: boolean;
    trialEndDate: string | null;
    trialDaysLeft: number;
    trialExpired: boolean;
}

export function PlansClient({ company }: PlansClientProps) {
    const router = useRouter();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [enterpriseFormOpen, setEnterpriseFormOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("YEARLY");
    const [usageData, setUsageData] = useState<UsageData | null>(null);
    const [loadingUsage, setLoadingUsage] = useState(true);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const res = await fetch("/api/company/usage");
                if (res.ok) {
                    const data = await res.json();
                    setUsageData(data);
                }
            } catch (error) {
                console.error("Erro ao carregar uso:", error);
            } finally {
                setLoadingUsage(false);
            }
        };
        fetchUsage();
    }, []);

    const handleSelectPlan = (plan: typeof plans[0]) => {
        if (plan.id === "ENTERPRISE") {
            setEnterpriseFormOpen(true);
            return;
        }
        if (plan.id === "TRIAL") {
            // Trial não pode ser selecionado, apenas visualizado
            return;
        }
        setSelectedPlan(plan);
        setCheckoutOpen(true);
    };

    const handleCheckoutSuccess = () => {
        setCheckoutOpen(false);
        router.refresh();
    };

    const subscription = company.subscription;
    const subscriptionStatus = subscription?.status ? statusLabels[subscription.status] : null;
    const isCurrentPlan = (planId: string) => company.plan === planId;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Planos e Créditos</h1>
                <p className="text-muted-foreground mt-1">
                    Gerencie sua assinatura e saldo de créditos.
                </p>
            </div>

            {/* Current Plan Card with Usage */}
            <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-primary/20">
                                <CreditCard className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Plano Atual</p>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold">{company.plan}</h2>
                                    {subscriptionStatus && (
                                        <Badge variant="outline" className={subscriptionStatus.color}>
                                            {subscriptionStatus.label}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        {subscription?.nextDueDate && (
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">Próxima Cobrança</p>
                                <p className="text-lg font-bold">
                                    {format(new Date(subscription.nextDueDate), "dd 'de' MMM", { locale: ptBR })}
                                </p>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {usageData ? (
                        <div className="space-y-6">
                            {/* Créditos/Requisições (são a mesma coisa) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-green-600 dark:text-green-500" />
                                        <span className="text-sm font-medium">Créditos Disponíveis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-green-600 dark:text-green-500">
                                            {usageData.credits}
                                            {!usageData.isUnlimited && `/${usageData.maxExecutions}`}
                                        </span>
                                        {usageData.isUnlimited && (
                                            <Badge variant="outline" className="text-xs">Ilimitado</Badge>
                                        )}
                                    </div>
                                </div>
                                {!usageData.isUnlimited && (
                                    <>
                                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${
                                                    (usageData.credits / usageData.maxExecutions) * 100 <= 10
                                                        ? "bg-red-500"
                                                        : (usageData.credits / usageData.maxExecutions) * 100 <= 30
                                                        ? "bg-amber-500"
                                                        : "bg-gradient-to-r from-green-500 to-emerald-500"
                                                }`}
                                                style={{ width: `${Math.min((usageData.credits / usageData.maxExecutions) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {usageData.usedExecutions} requisições usadas este mês
                                            {(usageData.credits / usageData.maxExecutions) * 100 <= 10 && (
                                                <span className="text-red-500 font-medium ml-2 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Créditos baixos
                                                </span>
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Usuários */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-medium">Usuários</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">
                                            {usageData.usedUsers}
                                            {!usageData.isUnlimited && `/${usageData.maxUsers}`}
                                        </span>
                                        {usageData.isUnlimited && (
                                            <Badge variant="outline" className="text-xs">Ilimitado</Badge>
                                        )}
                                    </div>
                                </div>
                                {!usageData.isUnlimited && (
                                    <>
                                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${
                                                    usageData.usersPercentage >= 90
                                                        ? "bg-red-500"
                                                        : usageData.usersPercentage >= 70
                                                        ? "bg-amber-500"
                                                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                                                }`}
                                                style={{ width: `${Math.min(usageData.usersPercentage, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {usageData.usersPercentage.toFixed(1)}% utilizado
                                            {usageData.usersPercentage >= 90 && (
                                                <span className="text-red-500 font-medium ml-2 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Próximo do limite
                                                </span>
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Trial Info */}
                            {usageData.isTrialing && (
                                <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Trial Grátis
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {usageData.trialExpired
                                                    ? "Trial expirado - Assine agora para continuar"
                                                    : `${usageData.trialDaysLeft} dia${usageData.trialDaysLeft !== 1 ? 's' : ''} restante${usageData.trialDaysLeft !== 1 ? 's' : ''}`
                                                }
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => router.push("/dashboard/plans")}
                                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                        >
                                            Fazer Upgrade
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            Carregando informações de uso...
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-muted/50 border">
                    <button
                        onClick={() => setBillingCycle("YEARLY")}
                        className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                            billingCycle === "YEARLY"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Anual
                        {billingCycle === "YEARLY" && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-bold">
                                -R$ 1.200
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setBillingCycle("MONTHLY")}
                        className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                            billingCycle === "MONTHLY"
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        Mensal
                    </button>
                </div>
            </div>

            {/* Savings Badge - Only for Annual */}
            {billingCycle === "YEARLY" && (
                <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-semibold">Economize R$ 1.200/ano no plano anual</span>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isCurrent = isCurrentPlan(plan.id);

                    return (
                        <Card
                            key={plan.id}
                            className={`relative transition-all hover:shadow-lg ${
                                plan.popular 
                                    ? "border-primary shadow-md shadow-primary/10" 
                                    : ""
                            } ${isCurrent ? "ring-2 ring-green-500" : ""} ${
                                plan.id === "TRIAL" ? "opacity-75" : ""
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold bg-primary text-primary-foreground">
                                    MAIS POPULAR
                                </div>
                            )}
                            {isCurrent && (
                                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    ATUAL
                                </div>
                            )}

                            <CardHeader>
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div 
                                        className="p-3 rounded-xl"
                                        style={{ backgroundColor: plan.color + "20" }}
                                    >
                                        <Icon className="w-6 h-6" style={{ color: plan.color }} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    {plan.yearlyPrice === null ? (
                                        <div>
                                            <div className="text-3xl font-bold">Customizado</div>
                                            <p className="text-sm text-muted-foreground mt-1">Solução sob medida para sua operação</p>
                                        </div>
                                    ) : plan.id === "TRIAL" ? (
                                        <div>
                                            <div className="text-3xl font-bold text-primary">Grátis</div>
                                            <p className="text-sm text-muted-foreground mt-1">3 dias para testar</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">A partir de</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm text-muted-foreground">R$</span>
                                                <span className="text-4xl font-bold" style={{ color: plan.color }}>
                                                    {billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice}
                                                </span>
                                                <span className="text-muted-foreground">/mês</span>
                                            </div>
                                            {billingCycle === "YEARLY" ? (
                                                <p className="text-sm text-muted-foreground mt-1">no plano anual (12x sem juros)</p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground mt-1">cobrança mensal recorrente</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Features */}
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3">
                                            <div
                                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: plan.color + "20" }}
                                            >
                                                <Check className="w-3 h-3" style={{ color: plan.color }} />
                                            </div>
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                {plan.id === "TRIAL" ? (
                                    <div className="pt-4">
                                        <p className="text-xs text-center text-muted-foreground">
                                            {isCurrent 
                                                ? "Seu trial está ativo" 
                                                : "Trial disponível apenas para novos usuários"
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <Button
                                        className={`w-full ${
                                            isCurrent
                                                ? ""
                                                : plan.popular
                                                    ? "bg-primary hover:bg-primary/90"
                                                    : ""
                                        }`}
                                        variant={isCurrent ? "outline" : (plan.popular ? "default" : "secondary")}
                                        disabled={isCurrent}
                                        onClick={() => handleSelectPlan(plan)}
                                    >
                                        {isCurrent ? (
                                            "Plano Atual"
                                        ) : plan.id === "ENTERPRISE" ? (
                                            <>
                                                Falar com consultor
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                Ver opções de pagamento
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Payment Options Table */}
            <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-center mb-6">Compare as formas de pagamento</h3>
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Forma de pagamento</th>
                                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Valor/mês</th>
                                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Total/ano</th>
                                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Economia</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b bg-green-50 dark:bg-green-500/5">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">💳</span>
                                            <div>
                                                <p className="font-medium">Anual no Cartão</p>
                                                <p className="text-xs text-muted-foreground">(12x)</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center p-4 font-semibold">R$ 497</td>
                                    <td className="text-center p-4">R$ 5.964</td>
                                    <td className="text-center p-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
                                            R$ 1.200 ✓
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">🔄</span>
                                            <div>
                                                <p className="font-medium">Cartão Recorrente</p>
                                                <p className="text-xs text-muted-foreground">(mensal)</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center p-4">R$ 597</td>
                                    <td className="text-center p-4 text-muted-foreground">R$ 7.164</td>
                                    <td className="text-center p-4 text-muted-foreground">-</td>
                                </tr>
                                <tr>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">📱</span>
                                            <div>
                                                <p className="font-medium">Mensal no Pix</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center p-4">R$ 597</td>
                                    <td className="text-center p-4 text-muted-foreground">R$ 7.164</td>
                                    <td className="text-center p-4 text-muted-foreground">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
                    <Card>
                        <CardContent className="p-4">
                            <p>
                                <span className="font-medium">Usuário adicional:</span> R$ 97/mês
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p>
                                <span className="font-medium">Requisição excedente:</span> R$ 0,50 por requisição
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Subscription Info */}
            {subscription && subscription.status === "ACTIVE" && (
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle>Informações da Assinatura</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Valor</p>
                                <p className="text-lg font-semibold">
                                    R$ {subscription.value.toLocaleString("pt-BR")}
                                    <span className="text-sm text-muted-foreground font-normal">
                                        /{subscription.billingType === "YEARLY" ? "ano" : "mês"}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Próximo Vencimento</p>
                                <p className="text-lg font-semibold">
                                    {subscription.nextDueDate
                                        ? format(new Date(subscription.nextDueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                        : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Ciclo</p>
                                <p className="text-lg font-semibold">
                                    {subscription.billingType === "YEARLY" ? "Anual" : "Mensal"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                selectedPlan={selectedPlan}
                onSuccess={handleCheckoutSuccess}
            />

            {/* Enterprise Form Modal */}
            <EnterpriseFormModal
                isOpen={enterpriseFormOpen}
                onClose={() => setEnterpriseFormOpen(false)}
                currentPlan={company.plan}
            />
        </div>
    );
}
