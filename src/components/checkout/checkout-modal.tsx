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
  defaultBillingCycle?: "MONTHLY" | "YEARLY"; // Ciclo de cobrança padrão
}

type Step = "customer" | "payment" | "processing" | "success" | "pix";
type BillingCycle = "MONTHLY" | "YEARLY";
type PaymentMethod = "PIX" | "BOLETO" | "CREDIT_CARD";

export function CheckoutModal({ isOpen, onClose, selectedPlan, onSuccess, defaultBillingCycle = "YEARLY" }: CheckoutModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("customer");
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(defaultBillingCycle);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [pixData, setPixData] = useState<{
    qrCode?: string;
    copiaECola?: string;
    expiresAt?: number;
  } | null>(null);
  
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

  if (!selectedPlan) {
    return null;
  }

  const plan = selectedPlan;
  const price = billingCycle === "YEARLY" 
    ? (plan.yearlyPrice || (plan.totalYearly ? plan.totalYearly / 12 : null) || 497)
    : (plan.monthlyPrice || 597);
  const totalPrice = billingCycle === "YEARLY" 
    ? (plan.totalYearly || (plan.yearlyPrice ? plan.yearlyPrice * 12 : null) || 5964)
    : price;
  const savings = billingCycle === "YEARLY" && plan.monthlyPrice && plan.yearlyPrice
    ? (plan.monthlyPrice * 12) - (plan.yearlyPrice * 12)
    : 0;

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
      const response = await fetch("/api/stripe/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customerData.email,
          name: customerData.name,
          phone: customerData.phone,
        }),
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
    // Para cartão de crédito, usar Stripe Checkout
    if (paymentMethod === "CREDIT_CARD") {
      setStep("processing");
      setLoading(true);

      try {
        // Criar Checkout Session
        const response = await fetch("/api/stripe/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: plan.id,
            billingCycle,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao criar sessão de checkout");
        }

        // Redirecionar para o Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("URL de checkout não retornada");
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao processar pagamento",
          variant: "destructive",
        });
        setStep("payment");
        setLoading(false);
      }
      return;
    }

    // Para PIX, manter o fluxo antigo (já que PIX não funciona bem com Checkout Session)
    if (paymentMethod === "PIX") {
      setStep("processing");
      setLoading(true);

      try {
        const response = await fetch("/api/stripe/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: plan.id,
            billingCycle,
            paymentMethodType: "PIX",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao criar assinatura");
        }

        // Se for PIX, mostrar QR Code
        if (data.pix) {
          setPixData(data.pix);
          setStep("pix");
          toast({
            title: "QR Code PIX gerado!",
            description: "Escaneie o QR Code ou copie o código para pagar.",
          });
        } else {
          throw new Error("Dados PIX não retornados");
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
    }
  };

  const handleClose = () => {
    setStep("customer");
    setLoading(false);
    setPixData(null);
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
              {step === "pix" && "Escaneie o QR Code ou copie o código para pagar"}
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
              {/* Credit Card Info */}
              {paymentMethod === "CREDIT_CARD" && (
                <div className="space-y-4 p-4 rounded-xl bg-muted/50 border">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Pagamento com Cartão
                  </h4>
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Você será redirecionado para a página segura do Stripe para inserir os dados do seu cartão.
                      O Stripe processa o pagamento de forma segura e não armazena os dados em nossos servidores.
                    </p>
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
                Pagamento seguro processado por Stripe
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

          {/* PIX Step */}
          {step === "pix" && pixData && (
            <div className="py-8">
              <div className="text-center mb-6">
                <QrCode className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Pague com PIX</h3>
                <p className="text-muted-foreground mb-4">
                  Escaneie o QR Code ou copie o código para pagar
                </p>
              </div>

              {/* QR Code */}
              {pixData.qrCode && (
                <div className="mb-6 p-6 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  {pixData.qrCode.startsWith("data:image") || pixData.qrCode.startsWith("http") ? (
                    <img 
                      src={pixData.qrCode} 
                      alt="QR Code PIX" 
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <div className="text-center">
                      <QrCode className="w-32 h-32 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">QR Code disponível no código abaixo</p>
                    </div>
                  )}
                </div>
              )}

              {/* Copia e Cola */}
              {pixData.copiaECola && (
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-2 block">Código PIX (Copia e Cola)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={pixData.copiaECola}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.copiaECola!);
                        toast({
                          title: "Copiado!",
                          description: "Código PIX copiado para a área de transferência.",
                        });
                      }}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⏰ O código PIX expira em {pixData.expiresAt ? new Date(pixData.expiresAt).toLocaleString("pt-BR") : "alguns minutos"}. 
                  Após o pagamento, sua assinatura será ativada automaticamente.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    // Verificar status do pagamento
                    window.location.reload();
                  }}
                  className="flex-1"
                >
                  Verificar Pagamento
                </Button>
              </div>
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
