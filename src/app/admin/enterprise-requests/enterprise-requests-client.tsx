"use client";

import { useState } from "react";
import { Building2, Mail, Phone, Users, Calendar, MessageSquare, CheckCircle, XCircle, Clock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface EnterpriseRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  employees: number | null;
  currentPlan: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  companyId: string | null;
  company: {
    id: string;
    name: string;
    plan: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EnterpriseRequestsClientProps {
  requests: EnterpriseRequest[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Aguardando", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30", icon: Clock },
  CONTACTED: { label: "Contatado", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30", icon: CheckCircle },
  IN_PROGRESS: { label: "Em Negociação", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30", icon: Clock },
  APPROVED: { label: "Aprovado", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30", icon: CheckCircle },
  REJECTED: { label: "Rejeitado", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30", icon: XCircle },
  CLOSED: { label: "Fechado", color: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30", icon: XCircle },
};

export function EnterpriseRequestsClient({ requests: initialRequests }: EnterpriseRequestsClientProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<EnterpriseRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/enterprise-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status");
      }

      const updated = await response.json();
      setRequests(requests.map(r => r.id === requestId ? updated.request : r));
      setSelectedRequest(null);
      setNotes("");
      
      toast({
        title: "Status atualizado!",
        description: "A solicitação foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da solicitação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (request: EnterpriseRequest) => {
    setSelectedRequest(request);
    setNotes(request.notes || "");
    setStatus(request.status);
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "PENDING").length,
    contacted: requests.filter(r => r.status === "CONTACTED").length,
    approved: requests.filter(r => r.status === "APPROVED").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Solicitações Enterprise</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie solicitações do plano Enterprise
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aguardando</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Contatados</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.contacted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação Enterprise ainda.</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => {
            const statusInfo = statusConfig[request.status] || statusConfig.PENDING;
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.companyName}</h3>
                        <Badge variant="outline" className={statusInfo.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{request.email}</span>
                        </div>
                        {request.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{request.phone}</span>
                          </div>
                        )}
                        {request.employees && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{request.employees} funcionários</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(request.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      </div>

                      {request.message && (
                        <div className="mt-4 p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground line-clamp-2">{request.message}</p>
                        </div>
                      )}

                      {request.company && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Empresa cadastrada: {request.company.name} ({request.company.plan})
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetails(request)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {selectedRequest.companyName}
                </DialogTitle>
                <DialogDescription>
                  Solicitação criada em {format(new Date(selectedRequest.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Nome do Contato</Label>
                    <p className="font-medium">{selectedRequest.contactName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">E-mail</Label>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                  {selectedRequest.phone && (
                    <div>
                      <Label className="text-muted-foreground">Telefone</Label>
                      <p className="font-medium">{selectedRequest.phone}</p>
                    </div>
                  )}
                  {selectedRequest.employees && (
                    <div>
                      <Label className="text-muted-foreground">Funcionários</Label>
                      <p className="font-medium">{selectedRequest.employees}</p>
                    </div>
                  )}
                </div>

                {/* Message */}
                {selectedRequest.message && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Mensagem
                    </Label>
                    <div className="mt-2 p-4 rounded-lg bg-muted/50">
                      <p className="text-sm whitespace-pre-wrap">{selectedRequest.message}</p>
                    </div>
                  </div>
                )}

                {/* Current Plan */}
                {selectedRequest.currentPlan && (
                  <div>
                    <Label className="text-muted-foreground">Plano Atual</Label>
                    <p className="font-medium">{selectedRequest.currentPlan}</p>
                  </div>
                )}

                {/* Status Update */}
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label>Status</Label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-md border bg-background"
                    >
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Notas</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Adicione notas sobre esta solicitação..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(null)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(selectedRequest.id, status)}
                      disabled={loading}
                      className="flex-1"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

