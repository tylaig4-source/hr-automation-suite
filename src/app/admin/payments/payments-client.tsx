"use client";

import { useState } from "react";
import {
  Receipt,
  Building2,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
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

interface Payment {
  id: string;
  companyId: string;
  value: number;
  netValue: number;
  billingType: string;
  status: string;
  dueDate: Date;
  paymentDate: Date | null;
  invoiceUrl: string | null;
  bankSlipUrl: string | null;
  pixQrCode: string | null;
  pixCopiaECola: string | null;
  creditCardNumber: string | null;
  creditCardBrand: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    plan: string;
  };
}

interface PaymentsClientProps {
  payments: Payment[];
  stats: {
    total: number;
    received: number;
    pending: number;
    totalRevenue: number;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  RECEIVED: { label: "Recebido", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30", icon: CheckCircle },
  CONFIRMED: { label: "Confirmado", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30", icon: CheckCircle },
  PENDING: { label: "Aguardando", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30", icon: Clock },
  OVERDUE: { label: "Vencido", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30", icon: AlertCircle },
  REFUNDED: { label: "Estornado", color: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30", icon: AlertCircle },
};

const billingTypeLabels: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  PIX: "PIX",
  BOLETO: "Boleto",
  DEBIT_CARD: "Cartão de Débito",
};

export function PaymentsClient({ payments: initialPayments, stats }: PaymentsClientProps) {
  const [payments] = useState(initialPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.stripePaymentIntentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.stripeChargeId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie todos os pagamentos do sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recebidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.received}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              R$ {stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa, ID do pagamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-md border bg-background"
            >
              <option value="all">Todos os status</option>
              <option value="RECEIVED">Recebidos</option>
              <option value="CONFIRMED">Confirmados</option>
              <option value="PENDING">Pendentes</option>
              <option value="OVERDUE">Vencidos</option>
              <option value="REFUNDED">Estornados</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pagamentos Recentes</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Empresa</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Valor</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Método</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vencimento</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pagamento</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum pagamento encontrado</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => {
                    const statusInfo = statusConfig[payment.status] || statusConfig.PENDING;
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={payment.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold">
                              {payment.company.name[0]}
                            </div>
                            <div>
                              <p className="font-medium">{payment.company.name}</p>
                              <p className="text-xs text-muted-foreground">{payment.company.plan}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-semibold">
                              R$ {payment.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                            {payment.netValue !== payment.value && (
                              <p className="text-xs text-muted-foreground">
                                Líquido: R$ {payment.netValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {payment.billingType === "CREDIT_CARD" && (
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                            )}
                            {payment.billingType === "PIX" && (
                              <span className="text-lg">📱</span>
                            )}
                            <span className="text-sm">{billingTypeLabels[payment.billingType] || payment.billingType}</span>
                          </div>
                          {payment.creditCardNumber && (
                            <p className="text-xs text-muted-foreground mt-1">
                              •••• {payment.creditCardNumber} ({payment.creditCardBrand})
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </td>
                        <td className="p-4">
                          {payment.paymentDate ? (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {format(new Date(payment.paymentDate), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetails(payment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Detalhes do Pagamento
                </DialogTitle>
                <DialogDescription>
                  Informações completas do pagamento
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Company Info */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Empresa</h3>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedPayment.company.name}</p>
                      <p className="text-sm text-muted-foreground">Plano: {selectedPayment.company.plan}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Valor</h3>
                    <p className="text-2xl font-bold">
                      R$ {selectedPayment.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    {selectedPayment.netValue !== selectedPayment.value && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Líquido: R$ {selectedPayment.netValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Método</h3>
                    <p className="font-medium">{billingTypeLabels[selectedPayment.billingType] || selectedPayment.billingType}</p>
                    {selectedPayment.creditCardNumber && (
                      <p className="text-sm text-muted-foreground mt-1">
                        •••• {selectedPayment.creditCardNumber} ({selectedPayment.creditCardBrand})
                      </p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <Badge variant="outline" className={statusConfig[selectedPayment.status]?.color}>
                    {statusConfig[selectedPayment.status]?.label || selectedPayment.status}
                  </Badge>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Vencimento</h3>
                    <p>{format(new Date(selectedPayment.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  </div>
                  {selectedPayment.paymentDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Data de Pagamento</h3>
                      <p>{format(new Date(selectedPayment.paymentDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    </div>
                  )}
                </div>

                {/* PIX Info */}
                {selectedPayment.billingType === "PIX" && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Informações PIX</h3>
                    {selectedPayment.pixCopiaECola && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Código PIX (Copiar e Colar)</p>
                        <div className="p-2 rounded bg-background border font-mono text-xs break-all">
                          {selectedPayment.pixCopiaECola}
                        </div>
                      </div>
                    )}
                    {selectedPayment.pixQrCode && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">QR Code</p>
                        <img
                          src={selectedPayment.pixQrCode}
                          alt="QR Code PIX"
                          className="w-48 h-48 mx-auto border rounded"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Stripe IDs */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedPayment.stripePaymentIntentId && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Intent ID</h3>
                      <p className="text-xs font-mono break-all">{selectedPayment.stripePaymentIntentId}</p>
                    </div>
                  )}
                  {selectedPayment.stripeChargeId && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Charge ID</h3>
                      <p className="text-xs font-mono break-all">{selectedPayment.stripeChargeId}</p>
                    </div>
                  )}
                </div>

                {/* Links */}
                {(selectedPayment.invoiceUrl || selectedPayment.bankSlipUrl) && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Links</h3>
                    <div className="flex gap-2">
                      {selectedPayment.invoiceUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedPayment.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            Ver Fatura
                          </a>
                        </Button>
                      )}
                      {selectedPayment.bankSlipUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={selectedPayment.bankSlipUrl} target="_blank" rel="noopener noreferrer">
                            Ver Boleto
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Created At */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Criado em</h3>
                  <p className="text-sm">
                    {format(new Date(selectedPayment.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
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

