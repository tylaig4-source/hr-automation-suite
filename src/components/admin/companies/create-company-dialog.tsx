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
import { Building2, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { createCompany, searchUsers } from "@/app/admin/actions";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const companySchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    slug: z.string().min(2, "Slug deve ter pelo menos 2 caracteres"),
    plan: z.string().min(1, "Plano é obrigatório"),
    maxUsers: z.string(),
    credits: z.string(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function CreateCompanyDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ownerOpen, setOwnerOpen] = useState(false);
    const [owner, setOwner] = useState<{ id: string; name: string | null; email: string } | null>(null);
    const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([]);
    const { toast } = useToast();

    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: "",
            slug: "",
            plan: "TRIAL",
            maxUsers: "5",
            credits: "50",
        },
    });

    async function handleSearchUsers(query: string) {
        if (query.length < 2) return;
        const results = await searchUsers(query);
        setUsers(results);
    }

    // Auto-generate slug from name
    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value;
        form.setValue("name", name);
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        form.setValue("slug", slug);
    }

    async function onSubmit(data: CompanyFormValues) {
        setLoading(true);
        try {
            if (!owner) {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Você deve selecionar um dono para a empresa.",
                });
                setLoading(false);
                return;
            }

            const payload = {
                ...data,
                ownerId: owner.id,
            };

            const result = await createCompany(payload);

            if (result.success) {
                toast({
                    title: "Empresa criada",
                    description: "A empresa foi criada com sucesso.",
                });
                setOpen(false);
                form.reset();
                setOwner(null);
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error || "Falha ao criar empresa",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro inesperado",
                description: "Ocorreu um erro ao tentar criar a empresa.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-neon-cyan to-neon-magenta text-white dark:text-black font-semibold hover:opacity-90">
                    <Building2 className="h-4 w-4 mr-2" />
                    Nova Empresa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Criar Nova Empresa</DialogTitle>
                    <DialogDescription>
                        Preencha os dados abaixo para criar uma nova empresa e definir seu administrador.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Empresa</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Empresa Bacana Lda"
                                {...form.register("name")}
                                onChange={handleNameChange}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (URL)</Label>
                            <Input
                                id="slug"
                                placeholder="empresa-bacana"
                                {...form.register("slug")}
                            />
                            {form.formState.errors.slug && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.slug.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Dono da Empresa (Usuário Existente)</Label>
                        <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={ownerOpen}
                                    className="w-full justify-between"
                                >
                                    {owner
                                        ? `${owner.name || "Sem nome"} (${owner.email})`
                                        : "Selecione um usuário..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Buscar usuário por nome ou email..."
                                        onValueChange={handleSearchUsers}
                                    />
                                    <CommandList>
                                        <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                                        <CommandGroup>
                                            {users.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={user.id}
                                                    onSelect={() => {
                                                        setOwner(user);
                                                        setOwnerOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            owner?.id === user.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{user.name || "Sem nome"}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="plan">Plano</Label>
                            <Select
                                onValueChange={(value) => form.setValue("plan", value)}
                                defaultValue={form.getValues("plan")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Plano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TRIAL">Trial</SelectItem>
                                    <SelectItem value="STARTER">Starter</SelectItem>
                                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxUsers">Max Usuários</Label>
                            <Input
                                id="maxUsers"
                                type="number"
                                {...form.register("maxUsers")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="credits">Créditos</Label>
                            <Input
                                id="credits"
                                type="number"
                                {...form.register("credits")}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-neon-cyan text-black hover:bg-neon-cyan/80 w-full"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Empresa
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
