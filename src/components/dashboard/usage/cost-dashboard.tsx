"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Coins, Zap, Users } from "lucide-react";

interface UsageData {
    userName: string;
    email: string;
    totalExecutions: number;
    totalTokens: number;
    estimatedCost: number;
}

interface CostDashboardProps {
    totalTokens: number;
    totalCost: number;
    executionsCount: number;
    usageList: UsageData[];
}

export function CostDashboard({
    totalTokens,
    totalCost,
    executionsCount,
    usageList,
}: CostDashboardProps) {
    // Formatar moeda
    const formatMoney = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 4,
        }).format(val);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("pt-BR").format(num);
    };

    return (
        <div className="space-y-8">
            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Custo Estimado (Total)
                        </CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMoney(totalCost)}</div>
                        <p className="text-xs text-muted-foreground">
                            Baseado nos modelos utilizados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tokens Consumidos
                        </CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(totalTokens)}</div>
                        <p className="text-xs text-muted-foreground">
                            Input + Output combinados
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Execuções</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(executionsCount)}</div>
                        <p className="text-xs text-muted-foreground">
                            Gerações de IA realizadas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela detalhada */}
            <Card>
                <CardHeader>
                    <CardTitle>Uso por Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Execuções</TableHead>
                                <TableHead className="text-right">Tokens</TableHead>
                                <TableHead className="text-right">Custo Est.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usageList.map((user) => (
                                <TableRow key={user.email}>
                                    <TableCell className="font-medium">{user.userName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="text-right">{formatNumber(user.totalExecutions)}</TableCell>
                                    <TableCell className="text-right">{formatNumber(user.totalTokens)}</TableCell>
                                    <TableCell className="text-right text-green-600 font-medium">
                                        {formatMoney(user.estimatedCost)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
