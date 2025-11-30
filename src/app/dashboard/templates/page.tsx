"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Search,
  Trash2,
  Star,
  Clock,
  ArrowRight,
  Loader2,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatRelativeTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingTable } from "@/components/shared/loading";

interface Template {
  id: string;
  name: string;
  inputs: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  agent: {
    id: string;
    name: string;
    slug: string;
    category: {
      name: string;
      slug: string;
    };
  };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os templates.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`/api/templates/${templateToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id));
        toast({
          title: "Template excluído",
          description: "O template foi removido com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
    } finally {
      setTemplateToDelete(null);
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        setTemplates((prev) =>
          prev.map((t) => ({
            ...t,
            isDefault: t.id === templateId,
          }))
        );
        toast({
          title: "Template padrão definido",
          description: "Este template será carregado automaticamente.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível definir como padrão.",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.agent.name.toLowerCase().includes(search.toLowerCase())
  );

  // Agrupar por agente
  const groupedTemplates = filteredTemplates.reduce(
    (acc, template) => {
      const agentSlug = template.agent.slug;
      if (!acc[agentSlug]) {
        acc[agentSlug] = {
          agent: template.agent,
          templates: [],
        };
      }
      acc[agentSlug].templates.push(template);
      return acc;
    },
    {} as Record<string, { agent: Template["agent"]; templates: Template[] }>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="h-6 w-6" />
            Meus Templates
          </h1>
          <p className="text-muted-foreground">
            Templates salvos para preenchimento rápido de formulários
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTemplates}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar templates por nome ou agente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingTable rows={4} />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          title="Nenhum template encontrado"
          description="Salve preenchimentos de formulários como templates para reutilizar depois."
          variant="folder"
          action={{
            label: "Ir para Dashboard",
            onClick: () => (window.location.href = "/dashboard"),
          }}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([agentSlug, group]) => (
            <div key={agentSlug}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">{group.agent.name}</h2>
                  <Badge variant="secondary">{group.agent.category.name}</Badge>
                </div>
                <Link href={`/dashboard/agents/${agentSlug}`}>
                  <Button variant="ghost" size="sm">
                    Usar Agente
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`hover:shadow-md transition-shadow ${
                      template.isDefault ? "border-primary" : ""
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {template.name}
                            {template.isDefault && (
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(template.updatedAt)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground mb-4">
                        {Object.keys(template.inputs).length} campos preenchidos
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/agents/${agentSlug}?template=${template.id}`}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            Usar
                          </Button>
                        </Link>
                        {!template.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(template.id)}
                            title="Definir como padrão"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setTemplateToDelete(template)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={() => setTemplateToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template &quot;{templateToDelete?.name}&quot;? 
              Esta ação não pode ser desfeita.
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

