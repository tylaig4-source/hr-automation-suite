import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Check, Zap, Shield, Star } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { upgradePlan } from "./actions";

export const metadata = {
    title: "Planos e Créditos | SaaS RH",
    description: "Gerencie seu plano e créditos disponíveis.",
};

export default async function PlansPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.companyId) {
        redirect("/dashboard");
    }

    const company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
    });

    if (!company) {
        redirect("/dashboard");
    }

    const plans = [
        {
            id: "STARTER",
            name: "Starter",
            price: "R$ 197",
            description: "Ideal para pequenas empresas e startups.",
            features: ["2 Usuários", "100 Execuções/mês", "50 Créditos Iniciais", "Suporte por Email"],
            icon: Zap,
            color: "text-blue-500",
        },
        {
            id: "PROFESSIONAL",
            name: "Professional",
            price: "R$ 497",
            description: "Para empresas em crescimento que precisam de mais poder.",
            features: ["10 Usuários", "500 Execuções/mês", "500 Créditos Iniciais", "Suporte Prioritário", "Agentes Premium"],
            icon: Star,
            color: "text-purple-500",
            popular: true,
        },
        {
            id: "ENTERPRISE",
            name: "Enterprise",
            price: "Sob Consulta",
            description: "Soluções customizadas para grandes operações.",
            features: ["Usuários Ilimitados", "Execuções Ilimitadas", "Créditos Ilimitados", "Gerente de Conta", "API Dedicada"],
            icon: Shield,
            color: "text-emerald-500",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Planos e Créditos</h1>
                <p className="text-muted-foreground mt-1">
                    Gerencie sua assinatura e saldo de créditos.
                </p>
            </div>

            {/* Current Status */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Plano Atual</p>
                        <div className="flex items-center gap-2 mt-1">
                            <h2 className="text-2xl font-bold">{company.plan}</h2>
                            <Badge variant="outline" className="bg-background">Ativo</Badge>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">Créditos Disponíveis</p>
                        <h2 className="text-3xl font-bold text-primary">{company.credits}</h2>
                    </div>
                </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isCurrent = company.plan === plan.id;

                    return (
                        <Card key={plan.id} className={`flex flex-col relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                    MAIS POPULAR
                                </div>
                            )}
                            <CardHeader>
                                <div className={`p-3 rounded-xl w-fit mb-4 bg-muted ${plan.color.replace('text-', 'bg-')}/10`}>
                                    <Icon className={`h-6 w-6 ${plan.color}`} />
                                </div>
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <form action={async () => {
                                    "use server";
                                    await upgradePlan(plan.id as any);
                                }} className="w-full">
                                    <Button
                                        className="w-full"
                                        variant={isCurrent ? "outline" : (plan.popular ? "default" : "secondary")}
                                        disabled={isCurrent}
                                    >
                                        {isCurrent ? "Plano Atual" : "Fazer Upgrade"}
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
