const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
    // Fetch first Google account
    const { data: accounts, error } = await supabase
        .from('Account')
        .select('access_token')
        .eq('provider', 'google')
        .limit(1);

    if (error) {
        console.error('Error fetching account:', error);
        process.exit(1);
    }

    if (!accounts || accounts.length === 0 || !accounts[0].access_token) {
        console.log('No account found');
        return;
    }

    const token = accounts[0].access_token;
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
