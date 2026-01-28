"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Target,
  CreditCard,
  Sparkles,
  Users,
  Briefcase,
  TrendingUp,
  Zap,
} from "lucide-react";
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
import { PlanSelectionStep } from "./plan-selection-step";

interface OnboardingData {
  companyName: string;
  companySize: string;
  industry: string;
  goals: string[];
  specificNeeds: string;
}

interface Plan {
  id: string;
  planId: string;
  name: string;
  description: string | null;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  yearlyTotal: number | null;
  maxUsers: number | null;
  maxExecutions: number | null;
  maxCredits: number | null;
  features: any;
  isActive: boolean;
  isPopular: boolean;
  isTrial: boolean;
  isEnterprise: boolean;
  orderIndex: number;
}

interface MultiStepOnboardingProps {
  plans: Plan[];
  initialCompanyName?: string;
}

const STEPS = [
  { id: 1, title: "Bem-vindo", icon: Sparkles },
  { id: 2, title: "Sua Empresa", icon: Building2 },
  { id: 3, title: "Objetivos", icon: Target },
  { id: 4, title: "Escolha o Plano", icon: CreditCard },
];

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 funcionários" },
  { value: "11-50", label: "11-50 funcionários" },
  { value: "51-200", label: "51-200 funcionários" },
  { value: "201-500", label: "201-500 funcionários" },
  { value: "500+", label: "Mais de 500 funcionários" },
];

const INDUSTRIES = [
  "Tecnologia",
  "Varejo",
  "Saúde",
  "Educação",
  "Financeiro",
  "Manufatura",
  "Serviços",
  "Consultoria",
  "Outro",
];

const GOALS = [
  { id: "recruitment", label: "Recrutamento e Seleção", icon: Users },
  { id: "performance", label: "Avaliação de Desempenho", icon: TrendingUp },
  { id: "onboarding", label: "Onboarding de Novos Funcionários", icon: Zap },
  { id: "development", label: "Desenvolvimento de Talentos", icon: Briefcase },
  { id: "compliance", label: "Conformidade Legal", icon: Check },
  { id: "analytics", label: "Análise de Dados de RH", icon: Target },
];

export function MultiStepOnboarding({
  plans,
  initialCompanyName = "",
}: MultiStepOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    companyName: initialCompanyName,
    companySize: "",
    industry: "",
    goals: [],
    specificNeeds: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Salvar dados no localStorage para persistência
  useEffect(() => {
    const saved = localStorage.getItem("onboarding_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Erro ao carregar dados do onboarding:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("onboarding_data", JSON.stringify(data));
  }, [data]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      // Salvar informações da empresa antes de prosseguir
      setIsSaving(true);
      try {
        await fetch("/api/company/update-onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: data.companyName,
            companySize: data.companySize,
            industry: data.industry,
          }),
        });
      } catch (error) {
        console.error("Erro ao salvar informações:", error);
      } finally {
        setIsSaving(false);
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Boas-vindas sempre pode prosseguir
      case 2:
        return data.companyName.trim().length > 0 && data.companySize && data.industry;
      case 3:
        return data.goals.length > 0;
      case 4:
        return false; // Gerenciado pelo componente de seleção de plano
      default:
        return false;
    }
  };

  const toggleGoal = (goalId: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((id) => id !== goalId)
        : [...prev.goals, goalId],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const stepNumber = index + 1;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? "bg-neon-cyan border-neon-cyan text-black"
                          : isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "bg-white/5 border-white/20 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {stepNumber < STEPS.length && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${
                        isCompleted ? "bg-green-500" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass rounded-3xl border border-white/10 p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <WelcomeStep />}
              {currentStep === 2 && (
                <CompanyInfoStep
                  data={data}
                  updateData={updateData}
                  companySizes={COMPANY_SIZES}
                  industries={INDUSTRIES}
                />
              )}
              {currentStep === 3 && (
                <GoalsStep data={data} toggleGoal={toggleGoal} goals={GOALS} />
              )}
              {currentStep === 4 && (
                <PlanSelectionStep
                  plans={plans}
                  onboardingData={data}
                  onComplete={() => {
                    // Limpar dados do localStorage após conclusão
                    localStorage.removeItem("onboarding_data");
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSaving}
                className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90 min-w-[200px]"
              >
                {isSaving ? (
                  "Salvando..."
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 1: Welcome
function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta mb-6"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>
      <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
        Bem-vindo ao HR Suite! 🎉
      </h2>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto">
        Estamos muito felizes em ter você aqui! Vamos configurar sua conta em poucos passos
        simples para você começar a usar nossa plataforma de IA para RH.
      </p>
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <Zap className="w-8 h-8 text-neon-cyan mb-2" />
          <h3 className="font-semibold text-white mb-1">Rápido</h3>
          <p className="text-sm text-gray-400">Configure em menos de 2 minutos</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <Target className="w-8 h-8 text-neon-magenta mb-2" />
          <h3 className="font-semibold text-white mb-1">Personalizado</h3>
          <p className="text-sm text-gray-400">Recomendações baseadas no seu perfil</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <Check className="w-8 h-8 text-green-400 mb-2" />
          <h3 className="font-semibold text-white mb-1">Simples</h3>
          <p className="text-sm text-gray-400">Apenas algumas perguntas rápidas</p>
        </div>
      </div>
    </div>
  );
}

// Step 2: Company Info
interface CompanyInfoStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  companySizes: { value: string; label: string }[];
  industries: string[];
}

function CompanyInfoStep({
  data,
  updateData,
  companySizes,
  industries,
}: CompanyInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Building2 className="w-12 h-12 text-neon-cyan mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
          Conte-nos sobre sua empresa
        </h2>
        <p className="text-gray-400">
          Essas informações nos ajudam a personalizar sua experiência
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-white">
            Nome da Empresa *
          </Label>
          <Input
            id="companyName"
            value={data.companyName}
            onChange={(e) => updateData({ companyName: e.target.value })}
            placeholder="Ex: Minha Empresa Ltda"
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companySize" className="text-white">
              Tamanho da Empresa *
            </Label>
            <Select
              value={data.companySize}
              onValueChange={(value) => updateData({ companySize: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/20">
                {companySizes.map((size) => (
                  <SelectItem
                    key={size.value}
                    value={size.value}
                    className="text-white hover:bg-white/10"
                  >
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="text-white">
              Setor *
            </Label>
            <Select
              value={data.industry}
              onValueChange={(value) => updateData({ industry: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/20">
                {industries.map((industry) => (
                  <SelectItem
                    key={industry}
                    value={industry}
                    className="text-white hover:bg-white/10"
                  >
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Goals
interface GoalsStepProps {
  data: OnboardingData;
  toggleGoal: (goalId: string) => void;
  goals: { id: string; label: string; icon: any }[];
}

function GoalsStep({ data, toggleGoal, goals }: GoalsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="w-12 h-12 text-neon-magenta mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
          Quais são seus principais objetivos?
        </h2>
        <p className="text-gray-400">
          Selecione todas as opções que se aplicam (pode escolher várias)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = data.goals.includes(goal.id);

          return (
            <motion.button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-neon-cyan bg-neon-cyan/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? "bg-neon-cyan text-black"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{goal.label}</h3>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

