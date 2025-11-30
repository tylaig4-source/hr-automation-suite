"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import type { Agent, Category, InputField } from "../../../../../prompts/types";
import { ExportButtons } from "@/components/agents/export-buttons";
import { TemplateManager } from "@/components/agents/template-manager";
import { useSearchParams } from "next/navigation";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";

interface ProviderInfo {
    id: string;
    name: string;
    available: boolean;
    description: string;
}

interface AgentExecutorProps {
    agent: Agent;
    category?: Category;
}

export function AgentExecutor({ agent, category }: AgentExecutorProps) {
    const searchParams = useSearchParams();
    const templateId = searchParams.get("template");

    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [output, setOutput] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string>("auto");
    const [providers, setProviders] = useState<ProviderInfo[]>([]);
    const [usedProvider, setUsedProvider] = useState<string | null>(null);

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
            const response = await fetch(`/api/execute/${agent.slug}`, {
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

            default:
                return <Input {...commonProps} type="text" maxLength={field.maxLength} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={category ? `/categories/${category.slug}` : "/dashboard"}>
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
                                initialTemplateId={templateId || undefined}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {agent.inputSchema.fields.map((field) => (
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

                {/* Output Section */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-500" />
                            Resultado
                        </h2>
                        {usedProvider && (
                            <Badge variant="outline" className="text-xs font-normal">
                                Gerado via {usedProvider}
                            </Badge>
                        )}
                    </div>

                    {/* Notion-like Page Container */}
                    <div className="flex-1 min-h-[500px] bg-white dark:bg-[#191919] border rounded-xl shadow-sm p-8 relative transition-all">
                        {/* Actions Toolbar (Absolute top-right) */}
                        {output && !isLoading && (
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <ExportButtons
                                    title={agent.name}
                                    subtitle={`Gerado via ${usedProvider?.toUpperCase() || "IA"}`}
                                    content={output}
                                    agentName={agent.name}
                                    disabled={isLoading}
                                />
                                <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={isLoading} className="h-8 px-2 text-muted-foreground hover:text-foreground">
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="group h-full">
                            {isLoading ? (
                                <div className="space-y-4 animate-pulse max-w-2xl mx-auto py-12">
                                    <div className="flex items-center gap-3 mb-8 justify-center text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="text-sm font-medium">A IA está escrevendo...</span>
                                    </div>
                                    {/* Skeleton Lines mimicking text */}
                                    <div className="h-8 bg-muted/50 rounded w-3/4 mb-6" />
                                    <div className="space-y-3">
                                        <div className="h-4 bg-muted/30 rounded w-full" />
                                        <div className="h-4 bg-muted/30 rounded w-5/6" />
                                        <div className="h-4 bg-muted/30 rounded w-4/6" />
                                    </div>
                                    <div className="space-y-3 mt-8">
                                        <div className="h-4 bg-muted/30 rounded w-full" />
                                        <div className="h-4 bg-muted/30 rounded w-11/12" />
                                        <div className="h-4 bg-muted/30 rounded w-3/4" />
                                    </div>
                                </div>
                            ) : output ? (
                                <MarkdownRenderer content={output} />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 space-y-4">
                                    <div className="p-4 rounded-full bg-muted/30">
                                        <Sparkles className="h-8 w-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-foreground/60">Pronto para criar</p>
                                        <p className="text-sm">Preencha os dados ao lado e clique em gerar</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            );
}
