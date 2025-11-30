"use client";

import { useState } from "react";
import { Eye, EyeOff, RefreshCw, Check, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ApiSettingsProps {
  settings: {
    stripeSecretKey: string;
    stripePublishableKey: string;
    stripeEnvironment: string;
  };
}

export function ApiSettings({ settings }: ApiSettingsProps) {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"success" | "error" | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);

    try {
      const response = await fetch("/api/stripe/test-connection", {
        method: "POST",
      });

      if (response.ok) {
        setConnectionStatus("success");
        toast({
          title: "Conexão bem-sucedida!",
          description: "A integração com o Stripe está funcionando corretamente.",
        });
      } else {
        const data = await response.json();
        setConnectionStatus("error");
        toast({
          title: "Erro na conexão",
          description: data.error || "Não foi possível conectar ao Stripe.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus("error");
      toast({
        title: "Erro na conexão",
        description: "Não foi possível testar a conexão.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Environment */}
      <div className="space-y-2">
        <Label className="text-gray-300">Ambiente</Label>
        <div className="flex gap-4">
          <div
            className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${
              settings.stripeEnvironment === "test"
                ? "border-amber-400/50 bg-amber-400/10"
                : "border-white/10 bg-white/5 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${settings.stripeEnvironment === "test" ? "bg-amber-400" : "bg-gray-500"}`} />
              <div>
                <p className="font-medium text-white">Teste</p>
                <p className="text-xs text-gray-400">Ambiente de testes</p>
              </div>
            </div>
          </div>
          <div
            className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${
              settings.stripeEnvironment === "production"
                ? "border-green-400/50 bg-green-400/10"
                : "border-white/10 bg-white/5 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${settings.stripeEnvironment === "production" ? "bg-green-400" : "bg-gray-500"}`} />
              <div>
                <p className="font-medium text-white">Produção</p>
                <p className="text-xs text-gray-400">Ambiente real</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          O ambiente é detectado automaticamente pela chave API (sk_test_ = teste, sk_live_ = produção)
        </p>
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <Label className="text-gray-300">API Key</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type={showApiKey ? "text" : "password"}
              value={settings.stripeSecretKey || "Não configurada"}
              readOnly
              className="bg-white/5 border-white/10 text-white pr-10 font-mono"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <Button
            onClick={handleTestConnection}
            disabled={testing || !settings.stripeSecretKey}
            className={`${
              connectionStatus === "success"
                ? "bg-green-500 hover:bg-green-600"
                : connectionStatus === "error"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gradient-to-r from-neon-cyan to-neon-magenta hover:opacity-90"
            } text-white`}
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : connectionStatus === "success" ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Conectado
              </>
            ) : connectionStatus === "error" ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Erro
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Testar Conexão
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Configure a variável STRIPE_SECRET_KEY com sua chave secreta da API
        </p>
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <div
          className={`p-4 rounded-xl border ${
            connectionStatus === "success"
              ? "border-green-400/30 bg-green-400/10"
              : "border-red-400/30 bg-red-400/10"
          }`}
        >
          <div className="flex items-center gap-3">
            {connectionStatus === "success" ? (
              <Check className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
            <div>
              <p className={`font-medium ${connectionStatus === "success" ? "text-green-400" : "text-red-400"}`}>
                {connectionStatus === "success" ? "Conexão estabelecida" : "Falha na conexão"}
              </p>
              <p className="text-sm text-gray-400">
                {connectionStatus === "success"
                  ? "A API do Stripe está respondendo corretamente."
                  : "Verifique se a chave secreta está correta e se o ambiente está configurado."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-neon-purple/5 border border-neon-purple/20">
        <h4 className="font-medium text-neon-purple mb-2">Como obter suas chaves do Stripe:</h4>
        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
          <li>Acesse sua conta no Stripe Dashboard</li>
          <li>Vá em <strong className="text-white">Desenvolvedores → Chaves de API</strong></li>
          <li>Copie a <strong className="text-white">Chave secreta</strong> (Secret key)</li>
          <li>Copie a <strong className="text-white">Chave publicável</strong> (Publishable key)</li>
          <li>Configure as variáveis de ambiente</li>
        </ol>
        <div className="mt-4 flex gap-4">
          <a
            href="https://dashboard.stripe.com/test/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:underline"
          >
            Chaves de Teste
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-400 hover:underline"
          >
            Chaves de Produção
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Environment Variables Reference */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <h4 className="font-medium text-white mb-3">Variáveis de Ambiente Necessárias:</h4>
        <div className="font-mono text-sm space-y-2">
          <div className="p-2 rounded bg-black/30">
            <span className="text-gray-400">STRIPE_SECRET_KEY=</span>
            <span className="text-neon-cyan">sk_test_...</span>
          </div>
          <div className="p-2 rounded bg-black/30">
            <span className="text-gray-400">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=</span>
            <span className="text-amber-400">pk_test_...</span>
          </div>
          <div className="p-2 rounded bg-black/30">
            <span className="text-gray-400">STRIPE_WEBHOOK_SECRET=</span>
            <span className="text-neon-magenta">whsec_...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

