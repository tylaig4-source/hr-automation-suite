"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  BookmarkPlus,
  Loader2,
  Trash2,
  Star,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Template {
  id: string;
  name: string;
  description: string | null;
  inputs: Record<string, any>;
  isDefault: boolean;
  createdAt: string;
  agent?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface TemplateManagerProps {
  agentId: string;
  agentSlug: string;
  currentInputs: Record<string, string>;
  onLoadTemplate: (inputs: Record<string, any>) => void;
  disabled?: boolean;
  initialTemplateId?: string;
}

export function TemplateManager({
  agentId,
  agentSlug,
  currentInputs,
  onLoadTemplate,
  disabled = false,
  initialTemplateId,
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");

  // Carregar templates
  useEffect(() => {
    fetchTemplates();
  }, [agentSlug]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/templates?agentId=${agentSlug}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [initialLoaded, setInitialLoaded] = useState(false);

  // Carregar template inicial
  useEffect(() => {
    if (initialTemplateId && templates.length > 0 && !initialLoaded) {
      const template = templates.find((t) => t.id === initialTemplateId);
      if (template) {
        onLoadTemplate(template.inputs);
        toast({
          title: "Template carregado",
          description: `"${template.name}" foi aplicado automaticamente.`,
        });
      }
      setInitialLoaded(true);
    }
  }, [initialTemplateId, templates, initialLoaded, onLoadTemplate]);

  // Salvar novo template
  const handleSave = async () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o template.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se há inputs preenchidos
    const hasInputs = Object.values(currentInputs).some(
      (v) => v && String(v).trim()
    );
    if (!hasInputs) {
      toast({
        title: "Sem dados",
        description: "Preencha pelo menos um campo antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agentSlug,
          name: newTemplateName,
          inputs: currentInputs,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao salvar");
      }

      const data = await response.json();
      setTemplates((prev) => [data.template, ...prev]);
      setNewTemplateName("");
      setSaveDialogOpen(false);

      toast({
        title: "Template salvo!",
        description: `"${newTemplateName}" foi salvo com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description:
          error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Carregar template
  const handleLoad = (template: Template) => {
    onLoadTemplate(template.inputs);
    toast({
      title: "Template carregado",
      description: `"${template.name}" foi aplicado ao formulário.`,
    });
  };

  // Excluir template
  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`/api/templates/${templateToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir");
      }

      setTemplates((prev) =>
        prev.filter((t) => t.id !== templateToDelete.id)
      );

      toast({
        title: "Template excluído",
        description: `"${templateToDelete.name}" foi removido.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
    } finally {
      setTemplateToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Definir como padrão
  const handleSetDefault = async (template: Template) => {
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar");
      }

      // Atualiza lista local
      setTemplates((prev) =>
        prev.map((t) => ({
          ...t,
          isDefault: t.id === template.id,
        }))
      );

      toast({
        title: "Template padrão definido",
        description: `"${template.name}" será carregado automaticamente.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível definir como padrão.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Dropdown de templates existentes */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            Templates
            {templates.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({templates.length})
              </span>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {templates.length === 0 ? (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              Nenhum template salvo
            </div>
          ) : (
            templates.map((template) => (
              <DropdownMenuItem
                key={template.id}
                className="flex items-center justify-between"
                onClick={() => handleLoad(template)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {template.isDefault && (
                    <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />
                  )}
                  <span className="truncate">{template.name}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!template.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(template);
                      }}
                      title="Definir como padrão"
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTemplateToDelete(template);
                      setDeleteDialogOpen(true);
                    }}
                    title="Excluir"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
          {templates.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem
            onClick={() => setSaveDialogOpen(true)}
            className="gap-2"
          >
            <BookmarkPlus className="h-4 w-4" />
            Salvar inputs atuais
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para salvar novo template */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Template</DialogTitle>
            <DialogDescription>
              Salve os inputs atuais para reutilizar depois.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nome do template</Label>
              <Input
                id="template-name"
                placeholder="Ex: Vaga de Desenvolvedor"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{templateToDelete?.name}&quot;? Esta
              ação não pode ser desfeita.
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

