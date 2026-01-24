const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const account = await prisma.account.findFirst({
        where: { provider: 'google' }
    });

    if (!account || !account.refresh_token) {
        console.log('No account found with refresh token');
        return;
    }

    console.log(`Attempting to refresh token for user: ${account.userId}`);

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
        refresh_token: account.refresh_token
    });

    try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        console.log('Refresh SUCCESS!');
        console.log('New Access Token:', credentials.access_token.substring(0, 10) + '...');
        console.log('New Expiry:', new Date(credentials.expiry_date).toISOString());

        // Update DB
        await prisma.account.update({
            where: { id: account.id },
            data: {
                access_token: credentials.access_token,
                expires_at: Math.floor(credentials.expiry_date / 1000)
            }
        });
        console.log('Database updated.');
    } catch (error) {
        console.error('Refresh FAILED:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
