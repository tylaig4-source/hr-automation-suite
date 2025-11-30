"use client";

import { useState } from "react";
import { Check, Zap, Shield, Building2, CreditCard, Users, Activity, Calendar, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckoutModal } from "@/components/checkout/checkout-modal";
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
        color: "#ff00ff",
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
        color: "#8b5cf6",
        popular: false,
    },
];

const statusLabels: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "Ativo", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    PENDING: { label: "Aguardando Pagamento", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    OVERDUE: { label: "Vencido", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    CANCELED: { label: "Cancelado", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
};

export function PlansClient({ company }: PlansClientProps) {
    const router = useRouter();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

    const handleSelectPlan = (plan: typeof plans[0]) => {
        if (plan.id === "ENTERPRISE") {
            // Open contact form or redirect
            window.location.href = "mailto:contato@meusuper.app?subject=Interesse%20no%20plano%20Enterprise";
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

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Planos e Créditos</h1>
                <p className="text-gray-400 mt-1">
                    Gerencie sua assinatura e saldo de créditos.
                </p>
            </div>

            {/* Current Status */}
            <div className="glass rounded-2xl p-6 border border-white/10">
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-neon-cyan/20">
                            <CreditCard className="h-6 w-6 text-neon-cyan" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Plano Atual</p>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">{company.plan}</h2>
                                {subscriptionStatus && (
                                    <Badge variant="outline" className={subscriptionStatus.color}>
                                        {subscriptionStatus.label}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-green-500/20">
                            <Activity className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Créditos</p>
                            <h2 className="text-xl font-bold text-green-400">{company.credits}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                            <Users className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Usuários</p>
                            <h2 className="text-xl font-bold text-white">
                                {company._count.users}
                                <span className="text-sm text-gray-500 font-normal">/{company.maxUsers}</span>
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-amber-500/20">
                            <Calendar className="h-6 w-6 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-400">Próxima Cobrança</p>
                            <h2 className="text-lg font-bold text-white">
                                {subscription?.nextDueDate
                                    ? format(new Date(subscription.nextDueDate), "dd 'de' MMM", { locale: ptBR })
                                    : "—"}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Savings Badge */}
            <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-green-500/30 bg-green-500/10 text-green-400">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold">Economize R$ 1.200/ano no plano anual</span>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isCurrent = company.plan === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`relative glass rounded-2xl p-6 border transition-all hover:scale-[1.02] ${
                                plan.popular 
                                    ? "border-neon-magenta/50 bg-neon-magenta/5" 
                                    : "border-white/10 hover:border-white/20"
                            } ${isCurrent ? "ring-2 ring-green-500" : ""}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-neon-cyan to-neon-magenta text-black">
                                    MAIS POPULAR
                                </div>
                            )}
                            {isCurrent && (
                                <div className="absolute -top-3 right-4 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                                    ATUAL
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div 
                                    className="p-3 rounded-xl"
                                    style={{ backgroundColor: plan.color + "20" }}
                                >
                                    <Icon className="w-6 h-6" style={{ color: plan.color }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <p className="text-sm text-gray-400">{plan.description}</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                {plan.yearlyPrice ? (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">A partir de</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm text-gray-400">R$</span>
                                            <span className="text-4xl font-display font-bold" style={{ color: plan.color }}>
                                                {plan.yearlyPrice}
                                            </span>
                                            <span className="text-gray-400">/mês</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">no plano anual (12x sem juros)</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-3xl font-display font-bold text-white">Customizado</div>
                                        <p className="text-sm text-gray-400 mt-1">Solução sob medida para sua operação</p>
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: plan.color + "20" }}
                                        >
                                            <Check className="w-3 h-3" style={{ color: plan.color }} />
                                        </div>
                                        <span className="text-sm text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Button
                                className={`w-full rounded-xl py-3 font-semibold transition-all ${
                                    isCurrent
                                        ? "bg-white/10 text-white border border-white/20"
                                        : plan.popular
                                            ? "bg-gradient-to-r from-neon-cyan to-neon-magenta text-black hover:opacity-90"
                                            : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                }`}
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
                        </div>
                    );
                })}
            </div>

            {/* Payment Options Table */}
            <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-white text-center mb-6">Compare as formas de pagamento</h3>
                <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-sm font-medium text-gray-400">Forma de pagamento</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-400">Valor/mês</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-400">Total/ano</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-400">Economia</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/5 bg-green-500/5">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">💳</span>
                                        <div>
                                            <p className="font-medium text-white">Anual no Cartão</p>
                                            <p className="text-xs text-gray-500">(12x)</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center p-4 text-white font-semibold">R$ 497</td>
                                <td className="text-center p-4 text-white">R$ 5.964</td>
                                <td className="text-center p-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                                        R$ 1.200 ✓
                                    </span>
                                </td>
                            </tr>
                            <tr className="border-b border-white/5">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">🔄</span>
                                        <div>
                                            <p className="font-medium text-white">Cartão Recorrente</p>
                                            <p className="text-xs text-gray-500">(mensal)</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center p-4 text-white">R$ 597</td>
                                <td className="text-center p-4 text-gray-400">R$ 7.164</td>
                                <td className="text-center p-4 text-gray-500">-</td>
                            </tr>
                            <tr>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">📱</span>
                                        <div>
                                            <p className="font-medium text-white">Mensal no Pix</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center p-4 text-white">R$ 597</td>
                                <td className="text-center p-4 text-gray-400">R$ 7.164</td>
                                <td className="text-center p-4 text-gray-500">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Additional Info */}
                <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm">
                    <div className="glass rounded-xl p-4 border border-white/10">
                        <p className="text-gray-300">
                            <span className="text-white font-medium">Usuário adicional:</span> R$ 97/mês
                        </p>
                    </div>
                    <div className="glass rounded-xl p-4 border border-white/10">
                        <p className="text-gray-300">
                            <span className="text-white font-medium">Requisição excedente:</span> R$ 0,50 por requisição
                        </p>
                    </div>
                </div>
            </div>

            {/* Subscription Info */}
            {subscription && subscription.status === "ACTIVE" && (
                <div className="glass rounded-2xl p-6 border border-white/10 max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold text-white mb-4">Informações da Assinatura</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-400">Valor</p>
                            <p className="text-lg font-semibold text-white">
                                R$ {subscription.value.toLocaleString("pt-BR")}
                                <span className="text-sm text-gray-500 font-normal">
                                    /{subscription.billingType === "YEARLY" ? "ano" : "mês"}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Próximo Vencimento</p>
                            <p className="text-lg font-semibold text-white">
                                {subscription.nextDueDate
                                    ? format(new Date(subscription.nextDueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Ciclo</p>
                            <p className="text-lg font-semibold text-white">
                                {subscription.billingType === "YEARLY" ? "Anual" : "Mensal"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                selectedPlan={selectedPlan}
                onSuccess={handleCheckoutSuccess}
            />
        </div>
    );
}
