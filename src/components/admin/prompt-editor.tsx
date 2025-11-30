"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateAgentPrompt } from "@/app/admin/prompts/actions";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface PromptEditorProps {
    agent: {
        id: string;
        name: string;
        systemPrompt: string | null;
        promptTemplate: string;
    };
}

export function PromptEditor({ agent }: PromptEditorProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt || "");
    const [promptTemplate, setPromptTemplate] = useState(agent.promptTemplate);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateAgentPrompt(agent.id, {
                systemPrompt,
                promptTemplate,
            });

            if (result.success) {
                toast({
                    title: "Sucesso",
                    description: "Prompt atualizado com sucesso!",
                });
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao atualizar prompt.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>System Prompt</CardTitle>
                    <CardDescription>
                        Instruções globais para o comportamento do agente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                        placeholder="Você é um especialista em RH..."
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Prompt Template</CardTitle>
                    <CardDescription>
                        O template que recebe as variáveis do formulário. Use {"{{variavel}}"} para inserir dados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={promptTemplate}
                        onChange={(e) => setPromptTemplate(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} size="lg">
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
        </div>
    );
}
