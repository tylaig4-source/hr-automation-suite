"use client";

import { useState } from "react";
import { CreditCard, QrCode, FileText, Check, Loader2, ChevronRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  totalYearly: number | null;
  features: string[];
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: Plan | null;
  onSuccess?: () => void;
}

type Step = "customer" | "payment" | "processing" | "success";
type BillingCycle = "MONTHLY" | "YEARLY";
type PaymentMethod = "PIX" | "BOLETO" | "CREDIT_CARD";

const PLAN_DATA: Plan[] = [
  {
    id: "PROFESSIONAL",
    name: "Professional",
    monthlyPrice: 597,
    yearlyPrice: 497,
    totalYearly: 5964,
    features: [
      "Até 5 usuários",
      "500 requisições/mês",
      "Todos os 34 agentes",
      "Suporte por chat e e-mail",
    ],
  },
];

export function CheckoutModal({ isOpen, onClose, selectedPlan, onSuccess }: CheckoutModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("customer");
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("YEARLY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  
  // Customer info
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    cpfCnpj: "",
    phone: "",
    postalCode: "",
    address: "",
    addressNumber: "",
    city: "",
    state: "",
  });

  // Credit card info
  const [cardData, setCardData] = useState({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
  });

  const plan = selectedPlan || PLAN_DATA[0];
  const price = billingCycle === "YEARLY" ? (plan.yearlyPrice || 497) : (plan.monthlyPrice || 597);
  const totalPrice = billingCycle === "YEARLY" ? (plan.totalYearly || 5964) : price;
  const savings = billingCycle === "YEARLY" ? 1200 : 0;

  const handleCustomerSubmit = async () => {
    if (!customerData.name || !customerData.email || !customerData.cpfCnpj) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, e-mail e CPF/CNPJ.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/asaas/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar cliente");
      }

      setStep("payment");
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (paymentMethod === "CREDIT_CARD") {
      if (!cardData.holderName || !cardData.number || !cardData.expiryMonth || !cardData.expiryYear || !cardData.ccv) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os dados do cartão.",
          variant: "destructive",
        });
        return;
      }
    }

    setStep("processing");
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        planId: plan.id,
        billingType: paymentMethod,
        billingCycle,
        value: billingCycle === "YEARLY" ? totalPrice : price,
      };

      if (paymentMethod === "CREDIT_CARD") {
        body.creditCard = cardData;
        body.creditCardHolderInfo = {
          name: cardData.holderName,
          email: customerData.email,
          cpfCnpj: customerData.cpfCnpj.replace(/\D/g, ""),
          postalCode: customerData.postalCode?.replace(/\D/g, ""),
          addressNumber: customerData.addressNumber,
          phone: customerData.phone?.replace(/\D/g, ""),
        };
      }

      const response = await fetch("/api/asaas/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar assinatura");
      }

      setStep("success");
      toast({
        title: "Assinatura criada!",
        description: "Sua assinatura foi processada com sucesso.",
      });

      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento",
        variant: "destructive",
      });
      setStep("payment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("customer");
    setLoading(false);
    setCustomerData({
      name: "",
      email: "",
      cpfCnpj: "",
      phone: "",
      postalCode: "",
      address: "",
      addressNumber: "",
      city: "",
      state: "",
    });
    setCardData({
      holderName: "",
      number: "",
      expiryMonth: "",
      expiryYear: "",
      ccv: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {step === "success" ? "Pagamento Confirmado!" : `Assinar ${plan.name}`}
            </DialogTitle>
            <DialogDescription>
              {step === "customer" && "Informe seus dados para continuar"}
              {step === "payment" && "Escolha a forma de pagamento"}
              {step === "processing" && "Processando seu pagamento..."}
              {step === "success" && "Sua assinatura está ativa"}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {["customer", "payment", "success"].map((s, i) => {
              const isActive = step === s || 
                (step === "processing" && s === "payment") ||
                (step === "success" && (s === "customer" || s === "payment"));
              const isCurrent = step === s || (step === "processing" && s === "payment");
              
              return (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isActive
                        ? isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isActive && s !== step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`w-12 h-0.5 ${isActive ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Plan Summary */}
          {step !== "success" && step !== "processing" && (
            <div className="mb-6 p-4 rounded-xl bg-muted/50 border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">Para PMEs e times de RH</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    R$ {price.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">/mês</p>
                </div>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setBillingCycle("YEARLY");
                    setPaymentMethod("CREDIT_CARD");
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    billingCycle === "YEARLY" && paymentMethod === "CREDIT_CARD"
                      ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                      : "border-border bg-background hover:border-muted-foreground/50"
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">💳 Anual Cartão</p>
                  <p className="font-bold">R$ 497</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Economize R$ 1.200</p>
                </button>
                <button
                  onClick={() => {
                    setBillingCycle("MONTHLY");
                    setPaymentMethod("CREDIT_CARD");
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    billingCycle === "MONTHLY" && paymentMethod === "CREDIT_CARD"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:border-muted-foreground/50"
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">🔄 Recorrente</p>
                  <p className="font-bold">R$ 597</p>
                  <p className="text-xs text-muted-foreground mt-1">Mensal</p>
                </button>
                <button
                  onClick={() => {
                    setBillingCycle("MONTHLY");
                    setPaymentMethod("PIX");
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === "PIX"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-border bg-background hover:border-muted-foreground/50"
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-1">📱 Pix Mensal</p>
                  <p className="font-bold">R$ 597</p>
                  <p className="text-xs text-muted-foreground mt-1">Instantâneo</p>
                </button>
              </div>

              {billingCycle === "YEARLY" && (
                <div className="mt-3 p-2 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-center">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Total anual: <span className="font-bold">R$ {totalPrice.toLocaleString("pt-BR")}</span> (12x de R$ {price})
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Customer Step */}
          {step === "customer" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    className="mt-1"
                    placeholder="João da Silva"
                  />
                </div>
                <div>
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    className="mt-1"
                    placeholder="joao@empresa.com"
                  />
                </div>
                <div>
                  <Label>CPF/CNPJ *</Label>
                  <Input
                    value={customerData.cpfCnpj}
                    onChange={(e) => setCustomerData({ ...customerData, cpfCnpj: e.target.value })}
                    className="mt-1"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    className="mt-1"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input
                    value={customerData.postalCode}
                    onChange={(e) => setCustomerData({ ...customerData, postalCode: e.target.value })}
                    className="mt-1"
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <Button
                onClick={handleCustomerSubmit}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continuar para Pagamento
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Payment Step */}
          {step === "payment" && (
            <div className="space-y-6">
              {/* Credit Card Form */}
              {paymentMethod === "CREDIT_CARD" && (
                <div className="space-y-4 p-4 rounded-xl bg-muted/50 border">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Dados do Cartão
                  </h4>
                  <div>
                    <Label>Nome no Cartão</Label>
                    <Input
                      value={cardData.holderName}
                      onChange={(e) => setCardData({ ...cardData, holderName: e.target.value })}
                      className="mt-1"
                      placeholder="NOME COMO NO CARTÃO"
                    />
                  </div>
                  <div>
                    <Label>Número do Cartão</Label>
                    <Input
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      className="mt-1"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Mês</Label>
                      <Input
                        value={cardData.expiryMonth}
                        onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                        className="mt-1"
                        placeholder="MM"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label>Ano</Label>
                      <Input
                        value={cardData.expiryYear}
                        onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                        className="mt-1"
                        placeholder="AA"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input
                        value={cardData.ccv}
                        onChange={(e) => setCardData({ ...cardData, ccv: e.target.value })}
                        className="mt-1"
                        placeholder="123"
                        maxLength={4}
                        type="password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PIX Info */}
              {paymentMethod === "PIX" && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-center">
                  <QrCode className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Após confirmar, você receberá um QR Code PIX para pagamento instantâneo.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("customer")}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Confirmar R$ {billingCycle === "YEARLY" ? totalPrice.toLocaleString("pt-BR") : price.toLocaleString("pt-BR")}
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Pagamento seguro processado por Asaas
              </p>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="py-12 text-center">
              <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">Processando pagamento...</h3>
              <p className="text-muted-foreground">Por favor, aguarde enquanto processamos sua assinatura.</p>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Assinatura Confirmada!</h3>
              <p className="text-muted-foreground mb-6">
                Seu plano {plan.name} está ativo. Você já pode aproveitar todos os recursos.
              </p>
              <Button onClick={handleClose}>
                Começar a usar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export a hook for easier usage
export function useCheckoutModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const openCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsOpen(true);
  };

  const closeCheckout = () => {
    setIsOpen(false);
    setSelectedPlan(null);
  };

  return {
    isOpen,
    selectedPlan,
    openCheckout,
    closeCheckout,
  };
}
