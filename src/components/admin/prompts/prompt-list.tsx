"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Search, Filter, Clock, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Agent {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    isPremium: boolean;
    estimatedTimeSaved: number;
    totalExecutions: number;
    category: {
        name: string;
        slug: string;
    };
}

interface PromptListProps {
    initialAgents: Agent[];
    categories: Category[];
}

export function PromptList({ initialAgents, categories }: PromptListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const filteredAgents = initialAgents.filter((agent) => {
        const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || agent.category.slug === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            {/* Filters Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar agente por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filtrar por Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Categorias</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                    <Card key={agent.id} className="flex flex-col hover:border-primary/50 transition-colors group">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                    {agent.category.name}
                                </Badge>
                                {agent.isPremium && (
                                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                                        Premium
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {agent.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                                {agent.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="mt-auto">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{agent.estimatedTimeSaved} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Zap className="h-3.5 w-3.5" />
                                    <span>{agent.totalExecutions} execuções</span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-0">
                            <Button asChild className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground" variant="secondary">
                                <Link href={`/admin/prompts/${agent.id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar Prompt
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredAgents.length === 0 && (
                <div className="text-center py-20 bg-muted/10 rounded-lg border-2 border-dashed border-muted">
                    <p className="text-muted-foreground">Nenhum agente encontrado com os filtros atuais.</p>
                    <Button
                        variant="link"
                        onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
                        className="mt-2"
                    >
                        Limpar Filtros
                    </Button>
                </div>
            )}
        </div>
    );
}
