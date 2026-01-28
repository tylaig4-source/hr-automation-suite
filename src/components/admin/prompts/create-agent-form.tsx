"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { createAgent } from "@/app/admin/prompts/actions";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
}

interface CreateAgentFormProps {
    categories: Category[];
}

export function CreateAgentForm({ categories }: CreateAgentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        categoryId: "",
        isPremium: false,
        estimatedTimeSaved: 60,
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        // Auto-generate slug from name if slug hasn't been manually edited (simple heuristic)
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        setFormData((prev) => ({ ...prev, name, slug }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!formData.name || !formData.slug || !formData.categoryId) {
            toast({
                title: "Erro de validação",
                description: "Preencha todos os campos obrigatórios.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            const result = await createAgent(formData);

            if (result.success && result.agentId) {
                toast({
                    title: "Sucesso!",
                    description: "Agente criado. Redirecionando para o editor...",
                });
                // Redirect to the edit page
                router.push(`/admin/prompts/${result.agentId}`);
            } else {
                toast({
                    title: "Erro",
                    description: result.error || "Erro ao criar agente.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro",
                description: "Ocorreu um erro inesperado.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/prompts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Criar Novo Agente</h1>
                    <p className="text-muted-foreground">Defina os detalhes básicos antes de configurar o prompt.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Agente *</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Criador de Job Description"
                            value={formData.name}
                            onChange={handleNameChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL) *</Label>
                        <Input
                            id="slug"
                            placeholder="ex: criador-job-description"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Categoria *</Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            placeholder="O que este agente faz?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="time">Tempo Economizado (min)</Label>
                            <Input
                                id="time"
                                type="number"
                                min="0"
                                value={formData.estimatedTimeSaved}
                                onChange={(e) => setFormData({ ...formData, estimatedTimeSaved: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                                id="premium"
                                checked={formData.isPremium}
                                onCheckedChange={(checked: boolean | "indeterminate") => setFormData({ ...formData, isPremium: !!checked })}
                            />
                            <Label htmlFor="premium" className="cursor-pointer">
                                Agente Premium?
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Link href="/admin/prompts">
                        <Button variant="outline" type="button">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando...
                            </>
                        ) : (
                            "Criar e Configurar Prompt"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
