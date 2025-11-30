"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  Filter,
  Eye,
  Copy,
  FileDown,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";
import { ExportButtons } from "@/components/agents/export-buttons";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { LoadingTable } from "@/components/shared/loading";

interface Execution {
  id: string;
  inputs: Record<string, any>;
  output: string;
  tokensUsed: number | null;
  executionTimeMs: number | null;
  rating: number | null;
  status: string;
  createdAt: string;
  agent: {
    id: string;
    name: string;
    slug: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HistoryPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [executionToDelete, setExecutionToDelete] = useState<Execution | null>(null);

  // Carregar execuções
  const fetchExecutions = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/executions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.executions || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Erro ao carregar execuções:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  // Filtrar localmente (para busca rápida)
  const filteredExecutions = executions.filter((exec) => {
    const matchesSearch =
      !search ||
      exec.agent.name.toLowerCase().includes(search.toLowerCase()) ||
      exec.output.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      exec.agent.category.slug === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Copiar output
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  // Avaliar execução
  const handleRate = async (executionId: string, rating: number) => {
    try {
      const response = await fetch(`/api/executions/${executionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        setExecutions((prev) =>
          prev.map((e) =>
            e.id === executionId ? { ...e, rating } : e
          )
        );
        toast({
          title: "Avaliação salva!",
          description: `Você avaliou com ${rating} estrela${rating > 1 ? "s" : ""}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a avaliação.",
        variant: "destructive",
      });
    }
  };

  // Excluir execução
  const handleDelete = async () => {
    if (!executionToDelete) return;

    try {
      const response = await fetch(`/api/executions/${executionToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setExecutions((prev) =>
          prev.filter((e) => e.id !== executionToDelete.id)
        );
        toast({
          title: "Excluído",
          description: "Execução removida do histórico.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir.",
        variant: "destructive",
      });
    } finally {
      setExecutionToDelete(null);
    }
  };

  // Paginação
  const handlePageChange = (newPage: number) => {
    fetchExecutions(newPage);
  };

  // Categorias únicas para filtro
  const categories = Array.from(
    new Set(executions.map((e) => JSON.stringify(e.agent.category)))
  ).map((c) => JSON.parse(c));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Histórico de Execuções</h1>
          <p className="text-muted-foreground">
            {pagination && `${pagination.total} execuções encontradas`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchExecutions()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por agente ou conteúdo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.slug} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingTable rows={5} />
      ) : filteredExecutions.length === 0 ? (
        <EmptyState
          title="Nenhuma execução encontrada"
          description="Execute um agente para ver o histórico aqui."
          variant="inbox"
          action={{
            label: "Ir para Dashboard",
            onClick: () => window.location.href = "/dashboard",
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredExecutions.map((execution) => (
            <Card
              key={execution.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link
                        href={`/agents/${execution.agent.slug}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {execution.agent.name}
                      </Link>
                      <Badge variant="secondary" className="text-xs">
                        {execution.agent.category.name}
                      </Badge>
                      {execution.status === "COMPLETED" ? (
                        <Badge variant="success" className="text-xs">
                          Concluído
                        </Badge>
                      ) : execution.status === "FAILED" ? (
                        <Badge variant="destructive" className="text-xs">
                          Falhou
                        </Badge>
                      ) : null}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {execution.output.substring(0, 200)}...
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(execution.createdAt)}
                      </span>
                      {execution.tokensUsed && (
                        <span>{execution.tokensUsed} tokens</span>
                      )}
                      {execution.executionTimeMs && (
                        <span>
                          {(execution.executionTimeMs / 1000).toFixed(1)}s
                        </span>
                      )}
                      {execution.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {execution.rating}/5
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Visualizar"
                      onClick={() => setSelectedExecution(execution)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Copiar"
                      onClick={() => handleCopy(execution.output)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Excluir"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setExecutionToDelete(execution)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalhes */}
      <Dialog
        open={!!selectedExecution}
        onOpenChange={() => setSelectedExecution(null)}
      >
        {selectedExecution && (
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedExecution.agent.name}</DialogTitle>
              <DialogDescription>
                {formatDateTime(selectedExecution.createdAt)} •{" "}
                {selectedExecution.agent.category.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Inputs utilizados */}
              <div>
                <h4 className="font-medium mb-2">Inputs utilizados</h4>
                <div className="bg-muted rounded-lg p-3 text-sm">
                  {Object.entries(selectedExecution.inputs).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="font-medium">{key}:</span>{" "}
                      <span className="text-muted-foreground">
                        {String(value).substring(0, 100)}
                        {String(value).length > 100 && "..."}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Resultado</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(selectedExecution.output)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                    <ExportButtons
                      title={selectedExecution.agent.name}
                      content={selectedExecution.output}
                      agentName={selectedExecution.agent.name}
                    />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <MarkdownRenderer content={selectedExecution.output} maxHeight="24rem" />
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-medium mb-2">Avaliação</h4>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(selectedExecution.id, star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= (selectedExecution.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Link para agente */}
              <div className="pt-4 border-t">
                <Link href={`/agents/${selectedExecution.agent.slug}`}>
                  <Button variant="outline" className="w-full">
                    Executar novamente com este agente
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog
        open={!!executionToDelete}
        onOpenChange={() => setExecutionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir execução?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta execução? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
