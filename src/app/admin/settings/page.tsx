import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  Settings, 
  Webhook, 
  Key, 
  Bell,
  Globe,
  Shield,
  Database,
} from "lucide-react";
import { WebhookSettings } from "./webhook-settings";
import { ApiSettings } from "./api-settings";

export const metadata = {
  title: "Configurações | Admin HR Suite",
  description: "Configurações do sistema e integrações",
};

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  // Get current settings from env (in production, these would come from database)
  const settings = {
    asaasApiKey: process.env.ASAAS_API_KEY ? "••••••••" + process.env.ASAAS_API_KEY.slice(-4) : "",
    asaasEnvironment: process.env.ASAAS_ENVIRONMENT || "sandbox",
    webhookUrl: process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/asaas/webhook`
      : "https://seu-dominio.com/api/asaas/webhook",
    webhookToken: process.env.ASAAS_WEBHOOK_TOKEN ? "Configurado" : "Não configurado",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white">Configurações</h1>
        <p className="text-gray-400 mt-1">
          Configure integrações, webhooks e preferências do sistema
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="grid gap-6">
        {/* Asaas Integration */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 border-b border-white/10 p-6">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Integração Asaas</h2>
              <p className="text-sm text-gray-400">Configure a integração com o gateway de pagamentos</p>
            </div>
          </div>
          <div className="p-6">
            <ApiSettings settings={settings} />
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 border-b border-white/10 p-6">
            <div className="p-2 rounded-xl bg-neon-cyan/20">
              <Webhook className="h-5 w-5 text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Webhooks</h2>
              <p className="text-sm text-gray-400">Configure os endpoints de webhook para receber eventos do Asaas</p>
            </div>
          </div>
          <div className="p-6">
            <WebhookSettings settings={settings} />
          </div>
        </div>

        {/* System Info */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 border-b border-white/10 p-6">
            <div className="p-2 rounded-xl bg-neon-magenta/20">
              <Database className="h-5 w-5 text-neon-magenta" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Informações do Sistema</h2>
              <p className="text-sm text-gray-400">Dados técnicos e status do sistema</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Versão</p>
                <p className="text-white font-mono">v0.2.0</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Ambiente</p>
                <p className={`font-medium ${settings.asaasEnvironment === "production" ? "text-green-400" : "text-amber-400"}`}>
                  {settings.asaasEnvironment === "production" ? "Produção" : "Sandbox"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Database</p>
                <p className="text-green-400 font-medium">Conectado</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Admin</p>
                <p className="text-white">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook Events Documentation */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 border-b border-white/10 p-6">
            <div className="p-2 rounded-xl bg-neon-purple/20">
              <Bell className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Eventos Suportados</h2>
              <p className="text-sm text-gray-400">Lista de eventos webhook que o sistema processa</p>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { event: "PAYMENT_RECEIVED", description: "Pagamento confirmado", action: "Ativa/renova assinatura" },
                { event: "PAYMENT_CONFIRMED", description: "Pagamento aprovado", action: "Confirma transação" },
                { event: "PAYMENT_OVERDUE", description: "Pagamento vencido", action: "Marca como inadimplente" },
                { event: "PAYMENT_DELETED", description: "Pagamento cancelado", action: "Cancela cobrança" },
                { event: "PAYMENT_REFUNDED", description: "Pagamento estornado", action: "Processa estorno" },
                { event: "SUBSCRIPTION_CREATED", description: "Assinatura criada", action: "Registra nova assinatura" },
                { event: "SUBSCRIPTION_UPDATED", description: "Assinatura atualizada", action: "Atualiza dados" },
                { event: "SUBSCRIPTION_DELETED", description: "Assinatura cancelada", action: "Cancela acesso" },
              ].map((item) => (
                <div key={item.event} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="font-mono text-sm text-neon-cyan">{item.event}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                  <p className="text-sm text-gray-300">{item.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

