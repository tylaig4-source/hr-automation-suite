"use client";

import { useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface ExportButtonsProps {
  title: string;
  subtitle?: string;
  content: string;
  agentName: string;
  disabled?: boolean;
}

export function ExportButtons({
  title,
  subtitle,
  content,
  agentName,
  disabled = false,
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<"pdf" | "docx" | null>(null);

  const handleExport = async (format: "pdf" | "docx") => {
    if (!content) {
      toast({
        title: "Sem conteúdo",
        description: "Gere um resultado antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(format);

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          content,
          agentName,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao exportar");
      }

      // Baixar arquivo
      const blob = await response.blob();
      const filename = response.headers.get("Content-Disposition")
        ?.split("filename=")[1]
        ?.replace(/"/g, "") || `documento.${format}`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Exportado!",
        description: `Arquivo ${format.toUpperCase()} baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || !content || isExporting !== null}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isExporting !== null}
        >
          <FileDown className="mr-2 h-4 w-4 text-red-500" />
          <div className="flex flex-col">
            <span>PDF</span>
            <span className="text-xs text-muted-foreground">
              Documento portátil
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("docx")}
          disabled={isExporting !== null}
        >
          <FileText className="mr-2 h-4 w-4 text-blue-500" />
          <div className="flex flex-col">
            <span>Word (DOCX)</span>
            <span className="text-xs text-muted-foreground">
              Editável no Word
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

