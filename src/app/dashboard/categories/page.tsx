import Link from "next/link";
import {
  Users,
  Rocket,
  GraduationCap,
  BarChart3,
  Heart,
  FileText,
  DollarSign,
  UserMinus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categories, getAgentsByCategory } from "../../../../prompts";

const categoryIcons: Record<string, any> = {
  "recrutamento-selecao": Users,
  "onboarding-integracao": Rocket,
  "treinamento-desenvolvimento": GraduationCap,
  "avaliacao-desempenho": BarChart3,
  "clima-cultura": Heart,
  "departamento-pessoal": FileText,
  "remuneracao-beneficios": DollarSign,
  "desligamento": UserMinus,
};

const categoryColors: Record<string, string> = {
  "recrutamento-selecao": "#6366F1",
  "onboarding-integracao": "#8B5CF6",
  "treinamento-desenvolvimento": "#06B6D4",
  "avaliacao-desempenho": "#10B981",
  "clima-cultura": "#F59E0B",
  "departamento-pessoal": "#EF4444",
  "remuneracao-beneficios": "#14B8A6",
  "desligamento": "#64748B",
};

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
        <p className="text-muted-foreground mt-1">
          Explore todos os módulos de RH e seus agentes especializados
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">8</div>
            <p className="text-sm text-muted-foreground">Módulos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">34</div>
            <p className="text-sm text-muted-foreground">Agentes Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-emerald-500">34</div>
            <p className="text-sm text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-500">0</div>
            <p className="text-sm text-muted-foreground">Em Breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const Icon = categoryIcons[category.slug] || FileText;
          const color = categoryColors[category.slug] || "#6366F1";
          const agents = getAgentsByCategory(category.id);
          const activeAgents = agents.length;

          return (
            <Link key={category.id} href={`/dashboard/categories/${category.slug}`}>
              <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {category.name}
                        </CardTitle>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <CardDescription className="mt-1">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {activeAgents} agente{activeAgents !== 1 ? "s" : ""} ativo{activeAgents !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="flex -space-x-2">
                      {agents.slice(0, 3).map((agent, i) => (
                        <div
                          key={agent.id}
                          className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium"
                          style={{ backgroundColor: `${color}${30 + i * 20}` }}
                          title={agent.name}
                        >
                          {agent.name.charAt(0)}
                        </div>
                      ))}
                      {agents.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                          +{agents.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
