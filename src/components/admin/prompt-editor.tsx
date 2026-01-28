"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAgentPrompt } from "@/app/admin/prompts/actions";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormBuilder, FormField } from "./form-builder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PromptEditorProps {
    agent: {
        id: string;
        name: string;
        systemPrompt: string | null;
        promptTemplate: string;
        inputSchema: any; // Using any for simplicity as it comes from Prisma Json
    };
}

export function PromptEditor({ agent }: PromptEditorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt || "");
    const [promptTemplate, setPromptTemplate] = useState(agent.promptTemplate);

    // Parse inputSchema safely
    const initialFields = (agent.inputSchema as any)?.fields || [];
    const [fields, setFields] = useState<FormField[]>(initialFields);

    const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateAgentPrompt(agent.id, {
                systemPrompt,
                promptTemplate,
                inputSchema: { fields },
            });

            if (result.success) {
                toast({
                    title: "Sucesso",
                    description: "Agente atualizado com sucesso!",
                });
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao atualizar agente.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const insertVariable = (slug: string) => {
        const variable = `{{${slug}}}`;
        if (promptTextareaRef.current) {
            const start = promptTextareaRef.current.selectionStart;
            const end = promptTextareaRef.current.selectionEnd;
            const text = promptTemplate;
            const newText = text.substring(0, start) + variable + text.substring(end);
            setPromptTemplate(newText);

            // Restore focus and cursor position (after insertion)
            setTimeout(() => {
                if (promptTextareaRef.current) {
                    promptTextareaRef.current.focus();
                    promptTextareaRef.current.setSelectionRange(start + variable.length, start + variable.length);
                }
            }, 0);
        } else {
            setPromptTemplate(prev => prev + variable);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} size="lg" className="bg-primary hover:bg-primary/90">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Alterações
                        </>
                    )}
                </Button>
            </div>

            <Tabs defaultValue="prompt" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="prompt">Editor de Prompt</TabsTrigger>
                    <TabsTrigger value="form">Construtor de Formulário</TabsTrigger>
                </TabsList>

                <TabsContent value="prompt" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Prompt</CardTitle>
                            <CardDescription>
                                Instruções globais para o comportamento do agente. (System Message)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="min-h-[200px] font-mono text-sm"
                                placeholder="Você é um especialista em..."
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Prompt Template</CardTitle>
                            <CardDescription className="flex items-center justify-between">
                                <span>O template que recebe os dados. Use as variáveis abaixo:</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Variable Toolbar */}
                            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                                <span className="text-xs font-medium text-muted-foreground flex items-center mr-2">
                                    <Wand2 className="w-3 h-3 mr-1" /> Inserir Variável:
                                </span>
                                {fields.map(field => (
                                    <Badge
                                        key={field.name}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors font-mono"
                                        onClick={() => insertVariable(field.name)}
                                    >
                                        {`{{${field.name}}}`}
                                    </Badge>
                                ))}
                                {fields.length === 0 && (
                                    <span className="text-xs text-muted-foreground italic">Nenhuma variável definida no formulário.</span>
                                )}
                            </div>

                            <Textarea
                                ref={promptTextareaRef}
                                value={promptTemplate}
                                onChange={(e) => setPromptTemplate(e.target.value)}
                                className="min-h-[400px] font-mono text-sm leading-relaxed"
                                placeholder="Escreva o prompt aqui..."
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="form" className="mt-6">
                    <FormBuilder fields={fields} onChange={setFields} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
