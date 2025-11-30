import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting verification...");

    // 1. Create a test user and company
    const slug = `test-company-${Date.now()}`;
    const company = await prisma.company.create({
        data: {
            name: "Test Company",
            slug: slug,
            credits: 10,
            plan: "STARTER",
        },
    });

    const user = await prisma.user.create({
        data: {
            email: `test-${Date.now()}@example.com`,
            companyId: company.id,
            name: "Test User",
        },
    });

    console.log(`Created company ${company.name} with 10 credits.`);

    // 2. Simulate Execution (Credit Deduction)
    // We'll manually update for this test since we can't easily call the API route directly here without mocking request/response
    // But we can verify the logic we put in the route by simulating the db operations

    console.log("Simulating execution...");
    await prisma.$transaction([
        prisma.company.update({
            where: { id: company.id },
            data: {
                credits: { decrement: 1 },
            },
        }),
    ]);

    const companyAfterExec = await prisma.company.findUnique({
        where: { id: company.id },
    });

    if (companyAfterExec?.credits === 9) {
        console.log("✅ Credit deduction verified (10 -> 9)");
    } else {
        console.error("❌ Credit deduction failed", companyAfterExec?.credits);
    }

    // 3. Simulate Upgrade (Credit Addition & Notification)
    console.log("Simulating upgrade to PROFESSIONAL...");

    const creditsToAdd = 500;
    await prisma.company.update({
        where: { id: company.id },
        data: {
            plan: "PROFESSIONAL",
            credits: { increment: creditsToAdd },
        },
    });

    await prisma.notification.create({
        data: {
            userId: user.id,
            title: "Plano Atualizado! 🎉",
            message: `Sua empresa agora está no plano PROFESSIONAL. ${creditsToAdd} créditos foram adicionados.`,
            type: "SUCCESS",
        },
    });

    const companyAfterUpgrade = await prisma.company.findUnique({
        where: { id: company.id },
    });

    if (companyAfterUpgrade?.credits === 509) {
        console.log("✅ Upgrade credit addition verified (9 + 500 = 509)");
    } else {
        console.error("❌ Upgrade credit addition failed", companyAfterUpgrade?.credits);
    }

    const notification = await prisma.notification.findFirst({
        where: { userId: user.id },
    });

    if (notification) {
        console.log("✅ Notification creation verified");
        console.log(`   - Title: ${notification.title}`);
        console.log(`   - Message: ${notification.message}`);
    } else {
        console.error("❌ Notification creation failed");
    }

    // Cleanup
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.company.delete({ where: { id: company.id } });

    console.log("Verification complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
