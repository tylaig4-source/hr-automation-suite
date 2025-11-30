"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteTemplate(id: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    await prisma.userTemplate.delete({
        where: {
            id,
            userId: session.user.id, // Ensure user owns the template
        },
    });

    revalidatePath("/templates");
}
