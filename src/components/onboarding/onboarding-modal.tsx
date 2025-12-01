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
import { getAbsoluteUrl } from "@/lib/url";

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
          <h3 className="text-2xl font-bold mb-2 text-white">Bem-vindo!</h3>
          <p className="text-gray-400">
            Você tem acesso a <strong className="text-neon-cyan">34 agentes de IA</strong> especializados em RH
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-neon-cyan">34</div>
            <div className="text-xs text-gray-400">Agentes</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-neon-magenta">8</div>
            <div className="text-xs text-gray-400">Categorias</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-2xl font-bold text-neon-purple">95%</div>
            <div className="text-xs text-gray-400">Economia</div>
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center flex-shrink-0 border border-neon-cyan/30">
            <span className="text-neon-cyan font-bold">1</span>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-white">Escolha o Agente</h4>
            <p className="text-sm text-gray-400">
              Navegue pelas categorias e selecione o agente que precisa
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center flex-shrink-0 border border-neon-cyan/30">
            <span className="text-neon-cyan font-bold">2</span>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-white">Preencha o Formulário</h4>
            <p className="text-sm text-gray-400">
              Complete os campos com as informações necessárias
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center flex-shrink-0 border border-neon-cyan/30">
            <span className="text-neon-cyan font-bold">3</span>
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-white">Receba o Resultado</h4>
            <p className="text-sm text-gray-400">
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
        <div className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
          <Users className="w-8 h-8 text-neon-cyan mb-2" />
          <h4 className="font-semibold mb-1 text-white">Recrutamento</h4>
          <p className="text-xs text-gray-400">
            Descrições de vagas, análise de CVs, roteiros de entrevista
          </p>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
          <Rocket className="w-8 h-8 text-neon-magenta mb-2" />
          <h4 className="font-semibold mb-1 text-white">Onboarding</h4>
          <p className="text-xs text-gray-400">
            Planos de integração, checklists, trilhas de aprendizado
          </p>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
          <BarChart3 className="w-8 h-8 text-neon-purple mb-2" />
          <h4 className="font-semibold mb-1 text-white">Avaliação</h4>
          <p className="text-xs text-gray-400">
            Feedbacks estruturados, avaliações 360°, metas SMART
          </p>
        </div>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
          <FileText className="w-8 h-8 text-green-400 mb-2" />
          <h4 className="font-semibold mb-1 text-white">Documentos</h4>
          <p className="text-xs text-gray-400">
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
    const absoluteUrl = getAbsoluteUrl("/dashboard");
    window.location.href = absoluteUrl;
  };

  const handleSkip = () => {
    onComplete();
    const absoluteUrl = getAbsoluteUrl("/dashboard");
    window.location.href = absoluteUrl;
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <>
      {/* Overlay com blur - impede interação com fundo */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md" />
      )}
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="max-w-2xl p-0 overflow-hidden bg-[#0a0a0f] border-white/10 z-[101] [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-neon-cyan/10 via-neon-magenta/10 to-neon-purple/10 p-6 border-b border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-white">
              <Icon className="w-6 h-6 text-neon-cyan" />
              {currentStepData.title}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
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
                        ? "bg-gradient-to-r from-neon-cyan to-neon-magenta text-white"
                        : "bg-neon-cyan/20 text-neon-cyan"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  {i < currentStep ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${i < currentStep ? "bg-gradient-to-r from-neon-cyan to-neon-magenta" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#0a0a0f]">
          {currentStepData.content}

          {/* Trial Info - Only on first step */}
          {isTrialing && currentStep === 0 && (
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">
                    Trial Grátis de 3 Dias Ativo!
                  </p>
                  <p className="text-sm text-gray-400">
                    Você tem <strong className="text-white">{trialDaysLeft} dia{trialDaysLeft !== 1 ? 's' : ''}</strong> para explorar todas as funcionalidades.
                    <br />
                    <strong className="text-white">50 créditos</strong> e <strong className="text-white">50 requisições</strong> disponíveis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end mt-8">
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-neon-cyan to-neon-magenta hover:opacity-90 text-white"
              >
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
    </>
  );
}

