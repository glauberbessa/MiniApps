const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const account = await prisma.account.findFirst({
        where: { provider: 'google' }
    });

    if (!account || !account.access_token) {
        console.log('No account found with access token');
        return;
    }

    console.log(`Testing token for user ID: ${account.userId}`);
    console.log(`Token: ${account.access_token.substring(0, 10)}...`);

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: account.access_token });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
        console.log('Attempting to list playlists...');
        const response = await youtube.playlists.list({
            part: ['snippet'],
            mine: true
        });
        console.log('Success! Found playlists:', response.data.items?.length);
    } catch (error) {
        console.error('FAILED to call YouTube API:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
