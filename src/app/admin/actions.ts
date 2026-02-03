"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(data: any) {
    try {
        const { name, email, password, role, companyId } = data;

        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { success: false, error: "Este email já está em uso." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                companyId: companyId || null,
                image: `https://ui-avatars.com/api/?name=${name}&background=random`,
            },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return { success: false, error: "Falha ao criar usuário." };
    }
}

export async function createCompany(data: any) {
    try {
        const { name, slug, plan, maxUsers, credits, ownerId } = data;

        // Verificar se slug já existe
        const existingSlug = await prisma.company.findUnique({
            where: { slug },
        });

        if (existingSlug) {
            return { success: false, error: "Este slug já está em uso." };
        }

        // Criar empresa
        const company = await prisma.company.create({
            data: {
                name,
                slug,
                plan,
                maxUsers: parseInt(maxUsers),
                credits: parseInt(credits),
            },
        });

        // Se houver owner ownerId, atualizar o usuário para ser da empresa e ter role adequado (se não for admin)
        if (ownerId) {
            // Verificar role atual do usuário
            const owner = await prisma.user.findUnique({ where: { id: ownerId } });

            if (owner) {
                const newRole = (owner.role === "ADMIN" || owner.role === "COMPANY_ADMIN") ? owner.role : "COMPANY_ADMIN";

                await prisma.user.update({
                    where: { id: ownerId },
                    data: {
                        companyId: company.id,
                        role: newRole
                    }
                });
            }
        }

        revalidatePath("/admin/companies");
        return { success: true };
    } catch (error) {
        console.error("Erro ao criar empresa:", error);
        return { success: false, error: "Falha ao criar empresa." };
    }
}

export async function searchUsers(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            take: 5,
        });
        return users;
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return [];
    }
}

export async function updateUser(userId: string, data: any) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data,
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return { success: false, error: "Falha ao atualizar usuário." };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId },
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        return { success: false, error: "Falha ao excluir usuário." };
    }
}

export async function searchCompanies(query: string) {
    if (!query) return [];

    try {
        const companies = await prisma.company.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { slug: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
            take: 10,
        });
        return companies;
    } catch (error) {
        console.error("Erro ao buscar empresas:", error);
        return [];
    }
}
