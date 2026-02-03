import { PrismaClient } from "@prisma/client";
import { syncPlanToStripe } from "../src/lib/stripe";
import fs from 'fs';
import path from 'path';

// Load .env manually since dotenv is not available
const envFiles = ['.env.local', '.env'];
let loaded = false;

for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
        console.log(`Loading env from: ${envPath}`);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split(/\r?\n/).forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#')) return;

            const match = trimmedLine.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove wrapping quotes if present
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
        loaded = true;
    }
}

if (!loaded) {
    console.warn("WARNING: No .env or .env.local file found!");
}

console.log(`DATABASE_URL is set: ${!!process.env.DATABASE_URL}`); // Do not log full url for security
console.log(`STRIPE_SECRET_KEY is set: ${!!process.env.STRIPE_SECRET_KEY}`);

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log("🔄 Starting Stripe Plan Synchronization...");

    try {
        // Fetch all active plans
        const plans = await prisma.plan.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                orderIndex: 'asc',
            },
        });

        console.log(`FOUND: ${plans.length} active plans to sync.`);

        for (const plan of plans) {
            console.log(`\n-----------------------------------`);
            console.log(`PROCESSING: ${plan.name} (${plan.planId})`);

            // Skip synchronization for free/trial plans that might not need Stripe prices? 
            // Actually, TRIAL usually has price 0 or no price in Stripe if no CC required.
            // But if we want to subscribe them to a free product in Stripe, we can sync it.
            // Our logic checks for > 0 prices. If 0, it won't create prices, but will create product.

            try {
                const result = await syncPlanToStripe({
                    planId: plan.planId,
                    name: plan.name,
                    description: plan.description || undefined,
                    monthlyPrice: plan.monthlyPrice,
                    yearlyPrice: plan.yearlyPrice,
                    yearlyTotal: plan.yearlyTotal,
                });

                console.log(`✅ SYNCED: ${plan.name}`);
                console.log(`   Product ID: ${result.productId}`);
                console.log(`   Monthly Price ID: ${result.monthlyPriceId || 'N/A'}`);
                console.log(`   Yearly Price ID: ${result.yearlyPriceId || 'N/A'}`);

                // Update database with Stripe IDs
                await prisma.plan.update({
                    where: { id: plan.id },
                    data: {
                        stripePriceIdMonthly: result.monthlyPriceId,
                        stripePriceIdYearly: result.yearlyPriceId,
                    },
                });
                console.log(`💾 DATABASE UPDATED`);

            } catch (error: any) {
                console.error(`❌ FAILED to sync ${plan.name}:`, error.message);
            }
        }

    } catch (error) {
        console.error("FATAL ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
