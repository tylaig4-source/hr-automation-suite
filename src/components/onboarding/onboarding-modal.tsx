"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Check, Zap, Users, FileText, BarChart3, Sparkles, Clock, CreditCard, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  isTrialing?: boolean;
  trialDaysLeft?: number;
}

const steps = [
  {
    id: 1,
    title: "Bem-vindo ao HR Suite! 🎉",
    description: "Vamos te mostrar como automatizar seu RH em minutos",
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Bem-vindo!</h3>
          <p className="text-muted-foreground">
            Você tem acesso a <strong>34 agentes de IA</strong> especializados em RH
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">34</div>
            <div className="text-xs text-muted-foreground">Agentes</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">8</div>
            <div className="text-xs text-muted-foreground">Categorias</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">95%</div>
            <div className="text-xs text-muted-foreground">Economia</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Como funciona?",
    description: "3 passos simples para automatizar tarefas",
    icon: Rocket,
    content: (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold">1</span>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Escolha o Agente</h4>
            <p className="text-sm text-muted-foreground">
              Navegue pelas categorias e selecione o agente que precisa
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold">2</span>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Preencha o Formulário</h4>
            <p className="text-sm text-muted-foreground">
              Complete os campos com as informações necessárias
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold">3</span>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Receba o Resultado</h4>
            <p className="text-sm text-muted-foreground">
              A IA gera o documento pronto em segundos. Copie, exporte ou edite!
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Principais Funcionalidades",
    description: "Explore o que você pode fazer",
    icon: Zap,
    content: (
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <Users className="w-8 h-8 text-primary mb-2" />
          <h4 className="font-semibold mb-1">Recrutamento</h4>
          <p className="text-xs text-muted-foreground">
            Descrições de vagas, análise de CVs, roteiros de entrevista
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <Rocket className="w-8 h-8 text-primary mb-2" />
          <h4 className="font-semibold mb-1">Onboarding</h4>
          <p className="text-xs text-muted-foreground">
            Planos de integração, checklists, trilhas de aprendizado
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <BarChart3 className="w-8 h-8 text-primary mb-2" />
          <h4 className="font-semibold mb-1">Avaliação</h4>
          <p className="text-xs text-muted-foreground">
            Feedbacks estruturados, avaliações 360°, metas SMART
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <FileText className="w-8 h-8 text-primary mb-2" />
          <h4 className="font-semibold mb-1">Documentos</h4>
          <p className="text-xs text-muted-foreground">
            Políticas, comunicados, documentos oficiais
          </p>
        </div>
      </div>
    ),
  },
];

export function OnboardingModal({ isOpen, onComplete, isTrialing = false, trialDaysLeft = 3 }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    router.push("/dashboard");
  };

  const handleSkip = () => {
    onComplete();
    router.push("/dashboard");
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Icon className="w-6 h-6 text-primary" />
              {currentStepData.title}
            </DialogTitle>
            <DialogDescription>
              {currentStepData.description}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i <= currentStep
                      ? i === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}

          {/* Trial Info - Only on first step */}
          {isTrialing && currentStep === 0 && (
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">
                    Trial Grátis de 3 Dias Ativo!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Você tem <strong>{trialDaysLeft} dia{trialDaysLeft !== 1 ? 's' : ''}</strong> para explorar todas as funcionalidades.
                    <br />
                    <strong>50 créditos</strong> e <strong>10 requisições</strong> disponíveis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Pular
            </Button>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? (
                  <>
                    Começar
                    <Check className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

