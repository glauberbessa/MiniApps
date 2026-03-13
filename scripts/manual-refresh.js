const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
    // Fetch first Google account with refresh token
    const { data: accounts, error } = await supabase
        .from('Account')
        .select('id, userId, refresh_token')
        .eq('provider', 'google')
        .not('refresh_token', 'is', null)
        .limit(1);

    if (error) {
        console.error('Error fetching account:', error);
        process.exit(1);
    }

    if (!accounts || accounts.length === 0) {
        console.log('No account found with refresh token');
        return;
    }

    const account = accounts[0];
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
        const { error: updateError } = await supabase
            .from('Account')
            .update({
                access_token: credentials.access_token,
                expires_at: Math.floor(credentials.expiry_date / 1000)
            })
            .eq('id', account.id);

        if (updateError) {
            console.error('Database update failed:', updateError);
            process.exit(1);
        }
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

main().catch(console.error);
