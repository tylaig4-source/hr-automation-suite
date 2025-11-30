"use client";

import { useState } from "react";
import {
  CreditCard,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface Subscription {
  id: string;
  companyId: string;
  stripeSubscriptionId: string | null;
  status: string;
  planId: string;
  billingType: string;
  nextDueDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  company: {
    id: string;
    name: string;
    plan: string;
  };
}

interface SubscriptionsClientProps {
  subscriptions: Subscription[];
  stats: {
    total: number;
    active: number;
    pending: number;
    canceled: number;
    overdue: number;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  ACTIVE: { label: "Ativa", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30", icon: CheckCircle },
  PENDING: { label: "Pendente", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30", icon: Clock },
  CANCELED: { label: "Cancelada", color: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30", icon: XCircle },
  OVERDUE: { label: "Vencida", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30", icon: AlertCircle },
};

const billingTypeLabels: Record<string, string> = {
  MONTHLY: "Mensal",
  YEARLY: "Anual",
};

const planLabels: Record<string, string> = {
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
  TRIAL: "Trial",
};

export function SubscriptionsClient({ subscriptions: initialSubscriptions, stats }: SubscriptionsClientProps) {
  const [subscriptions] = useState(initialSubscriptions);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.stripeSubscriptionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.planId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Assinaturas</h1>
        <p className="text-gray-400 mt-1">
          Gerencie todas as assinaturas ativas do sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{stats.canceled}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por empresa, ID do Stripe ou plano..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
              >
                <option value="all">Todos os status</option>
                <option value="ACTIVE">Ativas</option>
                <option value="PENDING">Pendentes</option>
                <option value="CANCELED">Canceladas</option>
                <option value="OVERDUE">Vencidas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Assinaturas ({filteredSubscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Nenhuma assinatura encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Empresa</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Plano</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Cobrança</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Próximo Vencimento</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Stripe ID</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((subscription) => {
                    const StatusIcon = statusConfig[subscription.status]?.icon || CheckCircle;
                    const statusInfo = statusConfig[subscription.status] || statusConfig.ACTIVE;

                    return (
                      <tr
                        key={subscription.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/admin/companies/${subscription.company.id}`}
                            className="flex items-center gap-2 hover:text-neon-cyan transition-colors"
                          >
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-white font-medium">{subscription.company.name}</span>
                          </Link>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="border-white/20">
                            {planLabels[subscription.planId] || subscription.planId}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`${statusInfo.color} border flex items-center gap-1 w-fit`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-400">
                          {billingTypeLabels[subscription.billingType] || subscription.billingType}
                        </td>
                        <td className="p-4 text-gray-400">
                          {subscription.nextDueDate
                            ? format(new Date(subscription.nextDueDate), "dd/MM/yyyy", { locale: ptBR })
                            : "N/A"}
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400">
                            {subscription.stripeSubscriptionId
                              ? subscription.stripeSubscriptionId.slice(0, 20) + "..."
                              : "N/A"}
                          </code>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetails(subscription)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
        <DialogContent className="max-w-2xl bg-[#0a0a0f] border-white/10 text-white">
          {selectedSubscription && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">Detalhes da Assinatura</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Informações completas da assinatura
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Empresa</h3>
                  <Link
                    href={`/admin/companies/${selectedSubscription.company.id}`}
                    className="text-neon-cyan hover:underline"
                  >
                    {selectedSubscription.company.name}
                  </Link>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Plano</h3>
                  <Badge variant="outline" className="border-white/20">
                    {planLabels[selectedSubscription.planId] || selectedSubscription.planId}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                  <Badge
                    className={`${statusConfig[selectedSubscription.status]?.color || statusConfig.ACTIVE.color} border flex items-center gap-1 w-fit`}
                  >
                    {(() => {
                      const StatusIcon = statusConfig[selectedSubscription.status]?.icon || CheckCircle;
                      return <StatusIcon className="h-3 w-3" />;
                    })()}
                    {statusConfig[selectedSubscription.status]?.label || selectedSubscription.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Tipo de Cobrança</h3>
                  <p className="text-white">
                    {billingTypeLabels[selectedSubscription.billingType] || selectedSubscription.billingType}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Próximo Vencimento</h3>
                  <p className="text-white">
                    {selectedSubscription.nextDueDate
                      ? format(new Date(selectedSubscription.nextDueDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : "N/A"}
                  </p>
                </div>
                {selectedSubscription.endDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Data de Término</h3>
                    <p className="text-white">
                      {format(new Date(selectedSubscription.endDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Stripe Subscription ID</h3>
                  <code className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400 block break-all">
                    {selectedSubscription.stripeSubscriptionId || "N/A"}
                  </code>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Criada em</h3>
                  <p className="text-white">
                    {format(new Date(selectedSubscription.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Atualizada em</h3>
                  <p className="text-white">
                    {format(new Date(selectedSubscription.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

