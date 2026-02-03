"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
    MoreVertical,
    Edit,
    Trash2,
    Shield,
    Building2,
    Check,
    ChevronsUpDown,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateUser, deleteUser, searchCompanies } from "../actions";

// Remapeando para usar updateUser para company assignment se necessário, ou criar a função se não existir.
// No actions.ts eu adicionei updateUser, deleteUser, searchCompanies. 
// assignUserToCompany pode ser feito via updateUser(id, { companyId: id })
const assignUserToCompanyAction = async (userId: string, companyId: string | null) => {
    return await updateUser(userId, { companyId });
};


interface UserActionsProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
        companyId: string | null;
        company: {
            id: string;
            name: string;
        } | null;
    };
}

const ROLES = [
    { value: "ADMIN", label: "Administrador (Sistema)" },
    { value: "COMPANY_ADMIN", label: "Admin da Empresa" },
    { value: "HR_MANAGER", label: "Gerente de RH" },
    { value: "HR_ANALYST", label: "Analista de RH" },
    { value: "MANAGER", label: "Gestor/Líder" },
    { value: "EMPLOYEE", label: "Colaborador" },
];

export function UserActions({ user }: UserActionsProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Estados dos Diálogos
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showCompanyDialog, setShowCompanyDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Form States
    const [editName, setEditName] = useState(user.name || "");
    const [editEmail, setEditEmail] = useState(user.email || "");
    const [selectedRole, setSelectedRole] = useState(user.role);

    // Company Search State
    const [companyOpen, setCompanyOpen] = useState(false);
    const [companySearch, setCompanySearch] = useState("");
    const [companies, setCompanies] = useState<{ id: string, name: string, slug: string }[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(user.companyId);
    const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(user.company?.name || null);
    const [isSearchingCompany, setIsSearchingCompany] = useState(false);

    const handleEditUser = async () => {
        try {
            setIsLoading(true);
            const result = await updateUser(user.id, { name: editName, email: editEmail });

            if (result.success) {
                toast({
                    title: "Usuário atualizado",
                    description: "As informações foram salvas com sucesso.",
                });
                setShowEditDialog(false);
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error || "Falha ao atualizar usuário.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro inesperado.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeRole = async () => {
        try {
            setIsLoading(true);
            const result = await updateUser(user.id, { role: selectedRole });

            if (result.success) {
                toast({
                    title: "Permissão atualizada",
                    description: `O usuário agora é ${selectedRole}.`,
                });
                setShowRoleDialog(false);
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error || "Falha ao atualizar permissão.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro inesperado.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        try {
            setIsLoading(true);
            const result = await deleteUser(user.id);

            if (result.success) {
                toast({
                    title: "Usuário removido",
                    description: "O usuário foi excluído permanentemente.",
                });
                setShowDeleteDialog(false);
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error || "Falha ao remover usuário.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro inesperado.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchCompanies = async (query: string) => {
        setCompanySearch(query);
        if (query.length > 1) {
            setIsSearchingCompany(true);
            const results = await searchCompanies(query);
            // Ensure results have slug (searchCompanies should return it)
            setCompanies(results as { id: string, name: string, slug: string }[]);
            setIsSearchingCompany(false);
        }
    };

    const handleAssignCompany = async () => {
        try {
            setIsLoading(true);
            const result = await updateUser(user.id, { companyId: selectedCompanyId });

            if (result.success) {
                toast({
                    title: "Empresa atualizada",
                    description: selectedCompanyId ? "Usuário vinculado à empresa." : "Usuário desvinculado da empresa.",
                });
                setShowCompanyDialog(false);
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Erro",
                    description: result.error || "Falha ao atualizar empresa.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Ocorreu um erro inesperado.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a1a24] border-white/10 text-white min-w-[200px]">
                    <DropdownMenuItem
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white"
                        onSelect={() => setShowEditDialog(true)}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white"
                        onSelect={() => setShowRoleDialog(true)}
                    >
                        <Shield className="h-4 w-4 mr-2" />
                        Alterar role
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white"
                        onSelect={() => setShowCompanyDialog(true)}
                    >
                        <Building2 className="h-4 w-4 mr-2" />
                        Alterar empresa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                        className="cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
                        onSelect={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir usuário
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="bg-[#1a1a24] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Faça alterações nas informações básicas do usuário.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowEditDialog(false)} className="text-gray-400 hover:text-white hover:bg-white/10">Cancelar</Button>
                        <Button onClick={handleEditUser} disabled={isLoading} className="bg-neon-cyan text-black hover:bg-neon-cyan/90">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent className="bg-[#1a1a24] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Alterar Permissão</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Selecione o novo nível de acesso para este usuário.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="mb-2 block">Role</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Selecione uma role" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                                {ROLES.map((role) => (
                                    <SelectItem key={role.value} value={role.value} className="focus:bg-white/5 focus:text-white">
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowRoleDialog(false)} className="text-gray-400 hover:text-white hover:bg-white/10">Cancelar</Button>
                        <Button onClick={handleChangeRole} disabled={isLoading} className="bg-neon-cyan text-black hover:bg-neon-cyan/90">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Salvar Alteração
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Company Dialog */}
            <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
                <DialogContent className="bg-[#1a1a24] border-white/10 text-white overflow-visible">
                    <DialogHeader>
                        <DialogTitle>Vincular Empresa</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Pesquise e selecione a empresa para este usuário. Deixe vazio para remover o vínculo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex flex-col gap-2">
                            <Label>Empresa Atual</Label>
                            <div className="p-2 rounded bg-white/5 border border-white/10 text-sm">
                                {selectedCompanyName || "Nenhuma empresa vinculada"}
                            </div>
                            {selectedCompanyId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setSelectedCompanyId(null); setSelectedCompanyName(null); }}
                                    className="self-start text-red-400 hover:text-red-300 h-auto p-0"
                                >
                                    Remover vínculo
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Pesquisar Nova Empresa</Label>
                            <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={companyOpen}
                                        className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                                    >
                                        {companySearch || "Buscar empresa..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0 bg-[#1a1a24] border-white/10">
                                    <Command className="bg-[#1a1a24] text-white">
                                        <CommandInput
                                            placeholder="Buscar por nome ou slug..."
                                            className="text-white"
                                            onValueChange={handleSearchCompanies}
                                        />
                                        <CommandList>
                                            <CommandEmpty>{isSearchingCompany ? "Buscando..." : "Nenhuma empresa encontrada."}</CommandEmpty>
                                            <CommandGroup>
                                                {companies.map((company) => (
                                                    <CommandItem
                                                        key={company.id}
                                                        value={company.name}
                                                        onSelect={() => {
                                                            setSelectedCompanyId(company.id);
                                                            setSelectedCompanyName(company.name);
                                                            setCompanyOpen(false);
                                                        }}
                                                        className="text-white hover:bg-white/5 cursor-pointer data-[selected=true]:bg-white/10"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedCompanyId === company.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {company.name} <span className="text-gray-500 ml-2">({company.slug})</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setShowCompanyDialog(false)} className="text-gray-400 hover:text-white hover:bg-white/10">Cancelar</Button>
                        <Button onClick={handleAssignCompany} disabled={isLoading} className="bg-neon-cyan text-black hover:bg-neon-cyan/90">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Salvar Vínculo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* Delete/Deactivate Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-[#1a1a24] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-400">Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o usuário
                            <span className="font-bold text-white"> {user.email} </span>
                            e todos os dados associados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600 border-none text-white">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
