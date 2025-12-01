import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
import { GeneralSettings } from "./general-settings";

export const metadata = {
  title: "Configurações | Admin HR Suite",
  description: "Configurações do sistema e integrações",
};

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Buscar role diretamente do banco de dados
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Settings agora são carregados do banco via componente
  const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/webhook`
    : "https://seu-dominio.com/api/stripe/webhook";
  
  const settings = {
    webhookUrl,
    webhookSecret: "Configurado no banco", // Placeholder
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
        {/* General Settings */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 border-b border-white/10 p-6">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Settings className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Configurações Gerais</h2>
              <p className="text-sm text-gray-400">Configure opções gerais do sistema</p>
            </div>
          </div>
          <div className="p-6">
            <GeneralSettings />
          </div>
        </div>

        {/* Stripe Integration */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 border-b border-white/10 p-6">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Integração Stripe</h2>
              <p className="text-sm text-gray-400">Configure a integração com o gateway de pagamentos Stripe</p>
            </div>
          </div>
          <div className="p-6">
            <ApiSettings />
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 border-b border-white/10 p-6">
            <div className="p-2 rounded-xl bg-neon-cyan/20">
              <Webhook className="h-5 w-5 text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Webhooks Stripe</h2>
              <p className="text-sm text-gray-400">Configure os endpoints de webhook para receber eventos do Stripe</p>
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
                <p className="text-gray-300 font-medium">
                  Configurado no painel
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
                { event: "payment_intent.succeeded", description: "Pagamento confirmado", action: "Ativa/renova assinatura" },
                { event: "payment_intent.payment_failed", description: "Pagamento falhou", action: "Marca como falho" },
                { event: "invoice.payment_succeeded", description: "Fatura paga", action: "Confirma transação" },
                { event: "invoice.payment_failed", description: "Fatura não paga", action: "Marca como inadimplente" },
                { event: "charge.refunded", description: "Estorno realizado", action: "Processa estorno" },
                { event: "customer.subscription.created", description: "Assinatura criada", action: "Registra nova assinatura" },
                { event: "customer.subscription.updated", description: "Assinatura atualizada", action: "Atualiza dados" },
                { event: "customer.subscription.deleted", description: "Assinatura cancelada", action: "Cancela acesso" },
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

