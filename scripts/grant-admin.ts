#!/usr/bin/env ts-node
/**
 * Grant admin access to specified email addresses
 * Usage: npx ts-node scripts/grant-admin.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
    'mceeloh@gmail.com',
    'sydten.co@gmail.com',
];

async function main() {
    console.log('Granting admin access...');

    for (const email of ADMIN_EMAILS) {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                console.log(`❌ User not found: ${email}`);
                continue;
            }

            await prisma.user.update({
                where: { email },
                data: { isAdmin: true },
            });

            console.log(`✅ Granted admin access to: ${email}`);
        } catch (error) {
            console.error(`❌ Error granting admin to ${email}:`, error);
        }
    }

    console.log('\nDone!');
}

main()
    .catch((e) => {
        console.error('Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
