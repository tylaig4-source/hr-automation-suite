"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface WebhookSettingsProps {
  settings: {
    webhookUrl: string;
    webhookSecret: string;
  };
}

export function WebhookSettings({ settings }: WebhookSettingsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(settings.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "URL copiada!",
      description: "A URL do webhook foi copiada para a área de transferência.",
    });
  };

  const handleTestWebhook = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/stripe/webhook/test", {
        method: "POST",
      });

      if (response.ok) {
        setTestResult("success");
        toast({
          title: "Webhook funcionando!",
          description: "O endpoint do webhook está respondendo corretamente.",
        });
      } else {
        setTestResult("error");
        toast({
          title: "Erro no webhook",
          description: "O endpoint não está respondendo corretamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult("error");
      toast({
        title: "Erro no webhook",
        description: "Não foi possível testar o endpoint.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Webhook URL */}
      <div className="space-y-2">
        <Label className="text-gray-300">URL do Webhook</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={settings.webhookUrl}
              readOnly
              className="bg-white/5 border-white/10 text-white pr-10 font-mono text-sm"
            />
            <button
              onClick={handleCopy}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <Button
            onClick={handleTestWebhook}
            disabled={testing}
            variant="outline"
            className={`border-white/10 hover:bg-white/10 ${
              testResult === "success" 
                ? "text-green-400 border-green-400/30" 
                : testResult === "error"
                ? "text-red-400 border-red-400/30"
                : "text-white"
            }`}
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Testar
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Configure esta URL no painel do Stripe em Desenvolvedores → Webhooks
        </p>
      </div>

      {/* Webhook Token Status */}
      <div className="space-y-2">
        <Label className="text-gray-300">Token de Autenticação</Label>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className={`w-3 h-3 rounded-full ${settings.webhookSecret === "Configurado" ? "bg-green-400" : "bg-amber-400"}`} />
          <span className="text-white">{settings.webhookSecret}</span>
        </div>
        <p className="text-sm text-gray-500">
          O secret é usado para validar que as requisições vêm do Stripe. Configure a variável STRIPE_WEBHOOK_SECRET.
        </p>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
        <h4 className="font-medium text-neon-cyan mb-2">Como configurar no Stripe:</h4>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Acesse sua conta no Stripe Dashboard</li>
          <li>Vá em <strong className="text-white">Desenvolvedores → Webhooks</strong></li>
          <li>Clique em <strong className="text-white">Adicionar endpoint</strong></li>
          <li>Cole a URL acima no campo de URL</li>
          <li>Selecione os eventos: <code className="text-xs bg-black/30 px-1 rounded">payment_intent.*</code>, <code className="text-xs bg-black/30 px-1 rounded">invoice.*</code>, <code className="text-xs bg-black/30 px-1 rounded">customer.subscription.*</code></li>
          <li>Copie o <strong className="text-white">Signing secret</strong> e configure a variável STRIPE_WEBHOOK_SECRET</li>
          <li>Salve as configurações</li>
        </ol>
        <div className="mt-4">
          <a
            href="https://docs.stripe.com/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-neon-cyan hover:underline"
          >
            Ver documentação do Stripe
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

