"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, RefreshCw, Check, AlertCircle, ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface StripeSettings {
  secretKey: { configured: boolean; preview?: string };
  publishableKey: { configured: boolean; preview?: string };
  webhookSecret: { configured: boolean; preview?: string };
}

export function ApiSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"success" | "error" | null>(null);
  
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showPublishableKey, setShowPublishableKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  
  const [secretKey, setSecretKey] = useState("");
  const [publishableKey, setPublishableKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  
  const [settings, setSettings] = useState<StripeSettings | null>(null);

  // Detectar ambiente baseado na chave
  const environment = secretKey?.includes("sk_live_") ? "production" : "test";

  // Carregar configurações
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/stripe");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        
        // Se já estiver configurado, mostrar preview
        if (data.settings.secretKey.configured && data.settings.secretKey.preview) {
          setSecretKey(data.settings.secretKey.preview);
        }
        if (data.settings.publishableKey.configured && data.settings.publishableKey.preview) {
          setPublishableKey(data.settings.publishableKey.preview);
        }
        if (data.settings.webhookSecret?.configured && data.settings.webhookSecret.preview) {
          setWebhookSecret(data.settings.webhookSecret.preview);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!secretKey || !publishableKey) {
      toast({
        title: "Campos obrigatórios",
        description: "Chave secreta e chave pública são obrigatórias",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secretKey: secretKey.trim(),
          publishableKey: publishableKey.trim(),
          webhookSecret: webhookSecret.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Configurações do Stripe salvas com sucesso!",
        });
        await loadSettings();
        setConnectionStatus(null); // Reset status
      } else {
        const data = await response.json();
        throw new Error(data.error || "Erro ao salvar");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Environment */}
      <div className="space-y-2">
        <Label className="text-gray-300">Ambiente</Label>
        <div className="flex gap-4">
          <div
            className={`flex-1 p-4 rounded-xl border transition-all ${
              environment === "test"
                ? "border-amber-400/50 bg-amber-400/10"
                : "border-white/10 bg-white/5 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${environment === "test" ? "bg-amber-400" : "bg-gray-500"}`} />
              <div>
                <p className="font-medium text-white">Teste</p>
                <p className="text-xs text-gray-400">Ambiente de testes</p>
              </div>
            </div>
          </div>
          <div
            className={`flex-1 p-4 rounded-xl border transition-all ${
              environment === "production"
                ? "border-green-400/50 bg-green-400/10"
                : "border-white/10 bg-white/5 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${environment === "production" ? "bg-green-400" : "bg-gray-500"}`} />
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

      {/* Secret Key */}
      <div className="space-y-2">
        <Label className="text-gray-300">Chave Secreta (Secret Key) *</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type={showSecretKey ? "text" : "password"}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_... ou sk_live_..."
              className="bg-white/5 border-white/10 text-white pr-10 font-mono"
            />
            <button
              onClick={() => setShowSecretKey(!showSecretKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showSecretKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {settings?.secretKey.configured
            ? "Chave configurada e salva no banco de dados"
            : "Configure sua chave secreta do Stripe"}
        </p>
      </div>

      {/* Publishable Key */}
      <div className="space-y-2">
        <Label className="text-gray-300">Chave Pública (Publishable Key) *</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type={showPublishableKey ? "text" : "password"}
              value={publishableKey}
              onChange={(e) => setPublishableKey(e.target.value)}
              placeholder="pk_test_... ou pk_live_..."
              className="bg-white/5 border-white/10 text-white pr-10 font-mono"
            />
            <button
              onClick={() => setShowPublishableKey(!showPublishableKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPublishableKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {settings?.publishableKey.configured
            ? "Chave configurada e salva no banco de dados"
            : "Configure sua chave pública do Stripe"}
        </p>
      </div>

      {/* Webhook Secret */}
      <div className="space-y-2">
        <Label className="text-gray-300">Webhook Secret (Opcional)</Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type={showWebhookSecret ? "text" : "password"}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="whsec_..."
              className="bg-white/5 border-white/10 text-white pr-10 font-mono"
            />
            <button
              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showWebhookSecret ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Configure o secret do webhook para validar eventos do Stripe
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving || !secretKey || !publishableKey}
          className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
        <Button
          onClick={handleTestConnection}
          disabled={testing || !secretKey}
          className={`${
            connectionStatus === "success"
              ? "bg-green-500 hover:bg-green-600"
              : connectionStatus === "error"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-white/10 hover:bg-white/20"
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
          <li>Cole aqui e clique em <strong className="text-white">Salvar Configurações</strong></li>
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
    </div>
  );
}
