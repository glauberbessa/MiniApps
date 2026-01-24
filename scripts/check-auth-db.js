const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: {
            accounts: true
        }
    });

    console.log('Users found:', users.length);
    users.forEach(user => {
        console.log(`User: ${user.email} (ID: ${user.id}) [Updated: ${user.updatedAt}]`);
        user.accounts.forEach(account => {
            const now = Math.floor(Date.now() / 1000);
            const expired = account.expires_at ? account.expires_at < now : 'Unknown';
            console.log(`  Account: ${account.provider} (ID: ${account.id})`);
            console.log(`    Scope: ${account.scope}`);
            console.log(`    Has Access Token: ${!!account.access_token}`);
            console.log(`    Has Refresh Token: ${!!account.refresh_token}`);
            console.log(`    Token Length: ${account.access_token?.length}`);
            console.log(`    Expires At: ${account.expires_at} (Now: ${now}, Expired: ${expired})`);
        });
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
