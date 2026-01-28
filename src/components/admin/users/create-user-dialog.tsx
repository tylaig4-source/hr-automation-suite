"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, Loader2 } from "lucide-react";
import { createUser } from "@/app/admin/actions";

const userSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    role: z.string().min(1, "Role é obrigatório"),
    companyId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface CreateUserDialogProps {
    companies: { id: string; name: string }[];
}

export function CreateUserDialog({ companies }: CreateUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "EMPLOYEE",
            companyId: "none",
        },
    });

    async function onSubmit(data: UserFormValues) {
        setLoading(true);
        try {
            const payload = {
                ...data,
                companyId: data.companyId === "none" ? undefined : data.companyId,
            };

            const result = await createUser(payload);

            if (result.success) {
                toast({
                    title: "Usuário criado",
                    description: "O usuário foi criado com sucesso.",
                });
                setOpen(false);
                form.reset();
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error || "Falha ao criar usuário",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro inesperado",
                description: "Ocorreu um erro ao tentar criar o usuário.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Usuário
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                    <DialogDescription>
                        Preencha os dados abaixo para adicionar um novo usuário ao sistema.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            placeholder="João Silva"
                            {...form.register("name")}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="joao@empresa.com"
                            {...form.register("email")}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...form.register("password")}
                        />
                        {form.formState.errors.password && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Função</Label>
                            <Select
                                onValueChange={(value) => form.setValue("role", value)}
                                defaultValue={form.getValues("role")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="COMPANY_ADMIN">Admin Empresa</SelectItem>
                                    <SelectItem value="HR_MANAGER">Gerente RH</SelectItem>
                                    <SelectItem value="HR_ANALYST">Analista RH</SelectItem>
                                    <SelectItem value="MANAGER">Gestor</SelectItem>
                                    <SelectItem value="EMPLOYEE">Colaborador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Empresa</Label>
                            <Select
                                onValueChange={(value) => form.setValue("companyId", value)}
                                defaultValue={form.getValues("companyId")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhuma</SelectItem>
                                    {companies.map((company) => (
                                        <SelectItem key={company.id} value={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-neon-cyan text-black hover:bg-neon-cyan/80 w-full"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Usuário
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
