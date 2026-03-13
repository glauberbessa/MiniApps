const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
    // Fetch first Google account with access token
    const { data: accounts, error } = await supabase
        .from('Account')
        .select('userId, access_token')
        .eq('provider', 'google')
        .not('access_token', 'is', null)
        .limit(1);

    if (error) {
        console.error('Error fetching account:', error);
        process.exit(1);
    }

    if (!accounts || accounts.length === 0) {
        console.log('No account found with access token');
        return;
    }

    const account = accounts[0];
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

main().catch(console.error);
