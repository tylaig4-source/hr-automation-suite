"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { syncStaticAgents } from "@/app/admin/prompts/actions";
import { toast } from "@/hooks/use-toast";

export function SyncAgentsButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSync = async () => {
        setIsLoading(true);
        try {
            const result = await syncStaticAgents();
            if (result.success) {
                toast({
                    title: "Sincronização Concluída",
                    description: `${result.count} agentes sincronizados com sucesso.`,
                });
                // Recarregar a página para mostrar os novos agentes
                window.location.reload();
            } else {
                throw new Error("Falha na sincronização");
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível sincronizar os agentes.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={handleSync} disabled={isLoading} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Sincronizar Agentes
        </Button>
    );
}
