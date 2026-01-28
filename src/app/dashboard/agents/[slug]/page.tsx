"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Loader2, Sparkles, Copy, RotateCcw, Check, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getAgentBySlug, getCategoryById } from "../../../../../prompts";
import type { InputField } from "../../../../../prompts/types";
import { ExportButtons } from "@/components/agents/export-buttons";
import { TemplateManager } from "@/components/agents/template-manager";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

interface ProviderInfo {
  id: string;
  name: string;
  available: boolean;
  description: string;
}

export default function AgentPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Estado para o agente carregado dinamicamente
  const [agent, setAgent] = useState<any | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("auto");
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [usedProvider, setUsedProvider] = useState<string | null>(null);

  // Carregar agente da API
  useEffect(() => {
    setLoadingAgent(true);
    fetch(`/api/agents/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Falha ao carregar agente");
        return res.json();
      })
      .then(data => {
        setAgent(data);
      })
      .catch(err => {
        console.error("Erro ao carregar agente:", err);
        // Fallback: tentar carregar estático se API falhar, ou mostrar erro
        const staticAgent = getAgentBySlug(slug);
        if (staticAgent) setAgent(staticAgent);
        else setError("Agente não encontrado");
      })
      .finally(() => setLoadingAgent(false));
  }, [slug]);

  // Carrega providers disponíveis
  useEffect(() => {
    fetch("/api/providers")
      .then((res) => res.json())
      .then((data) => {
        setProviders(data.providers || []);
        if (data.default) {
          setSelectedProvider("auto");
        }
      })
      .catch(console.error);
  }, []);

  if (loadingAgent) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Agente não encontrado.</p>
        <Link href="/dashboard">
          <Button className="mt-4">Voltar ao Dashboard</Button>
        </Link>
      </div>
    );
  }

  const category = getCategoryById(agent.categoryId);

  const handleInputChange = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoadTemplate = (templateInputs: Record<string, any>) => {
    setInputs(templateInputs);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setUsedProvider(null);

    try {
      const response = await fetch(`/api/execute/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, provider: selectedProvider }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao executar agente");
      }

      setOutput(result.output);
      setUsedProvider(result.provider);
      toast({
        title: "Sucesso!",
        description: `Gerado em ${result.executionTimeMs}ms via ${result.provider.toUpperCase()}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Copiado!", description: "Texto copiado para a área de transferência." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    handleSubmit();
  };

  const renderField = (field: InputField) => {
    const commonProps = {
      id: field.name,
      placeholder: field.placeholder,
      value: inputs[field.name] || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleInputChange(field.name, e.target.value),
      disabled: isLoading,
    };

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            rows={field.rows || 4}
            className="resize-none"
          />
        );

      case "select":
        return (
          <Select
            value={inputs[field.name] || ""}
            onValueChange={(value) => handleInputChange(field.name, value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Selecione..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return <Input {...commonProps} type="date" />;

      case "number":
        return <Input {...commonProps} type="number" min={field.min} max={field.max} />;

      case "file":
        return (
          <div className="space-y-2">
            <Input
              id={field.name}
              type="file"
              onChange={(e) => {
                // TODO: Implement actual file handling (upload/read)
                // For now just storing the filename to not break the form
                if (e.target.files && e.target.files[0]) {
                  handleInputChange(field.name, e.target.files[0].name);
                }
              }}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Upload de arquivos ainda em desenvolvimento. O nome do arquivo será enviado como texto.
            </p>
          </div>
        );

      default:
        return <Input {...commonProps} type="text" maxLength={field.maxLength} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={category ? `/dashboard/categories/${category.slug}` : "/dashboard"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            {agent.isPremium && <Badge variant="secondary">Premium</Badge>}
          </div>
          <p className="text-muted-foreground">{agent.description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Economiza ~{agent.estimatedTimeSaved} min</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">📝 Preencha os Dados</CardTitle>
                <CardDescription>
                  Campos marcados com * são obrigatórios
                </CardDescription>
              </div>
              <TemplateManager
                agentId={agent.id}
                agentSlug={agent.slug}
                currentInputs={inputs}
                onLoadTemplate={handleLoadTemplate}
                disabled={isLoading}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {agent.inputSchema.fields.map((field: InputField) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
                {field.helperText && (
                  <p className="text-xs text-muted-foreground">{field.helperText}</p>
                )}
              </div>
            ))}

            {/* Provider Selection */}
            {providers.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  Modelo de IA
                </Label>
                <Select
                  value={selectedProvider}
                  onValueChange={setSelectedProvider}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.filter(p => p.available).map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex flex-col">
                          <span>{provider.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {provider.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Resultado
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">📄 Resultado</CardTitle>
              {usedProvider && (
                <Badge variant="secondary" className="text-xs">
                  via {usedProvider.toUpperCase()}
                </Badge>
              )}
            </div>
            {output && (
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
                <ExportButtons
                  title={agent.name}
                  subtitle={`Gerado via ${usedProvider?.toUpperCase() || "IA"}`}
                  content={output}
                  agentName={agent.name}
                  disabled={isLoading}
                />
                <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={isLoading}>
                  <RotateCcw className="h-4 w-4" />
                  Regenerar
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {output ? (
              <MarkdownRenderer content={output} className="min-h-[200px]" />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                <p>Preencha o formulário e clique em &quot;Gerar&quot;</p>
                <p className="text-sm">O resultado aparecerá aqui</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

