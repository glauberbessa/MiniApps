const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const https = require('https');

async function main() {
    const account = await prisma.account.findFirst({
        where: { provider: 'google' }
    });

    if (!account || !account.access_token) {
        console.log('No account found');
        return;
    }

    const token = account.access_token;
    console.log(`Checking token: ${token.substring(0, 10)}...`);

    const url = `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Token Info Result:');
            console.log(JSON.stringify(JSON.parse(data), null, 2));
        });
    }).on('error', (err) => {
        console.error('Error:', err.message);
    });
}

main().catch(console.error).finally(() => { /* we'll wait for the async https call */ });
