import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { categories } from "../../../../prompts";
import * as LucideIcons from "lucide-react";

export const metadata = {
    title: "Categorias | SaaS RH",
    description: "Explore todas as categorias de agentes disponíveis.",
};

export default function CategoriesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
                    <p className="text-muted-foreground">
                        Explore nossos agentes organizados por área de atuação.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                    // Dynamically get the icon component
                    const Icon = (LucideIcons as any)[category.icon || "Circle"] || LucideIcons.Circle;

                    return (
                        <Link key={category.slug} href={`/categories/${category.slug}`}>
                            <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="p-3 rounded-xl transition-colors group-hover:bg-primary/10"
                                            style={{ backgroundColor: `${category.color}15` }}
                                        >
                                            <Icon
                                                className="h-8 w-8"
                                                style={{ color: category.color }}
                                            />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                                {category.name}
                                            </CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <CardDescription className="text-base">
                                        {category.description}
                                    </CardDescription>
                                </CardContent>
                                <div className="p-6 pt-0 mt-auto">
                                    <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/5">
                                        Ver Agentes
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
