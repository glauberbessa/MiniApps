const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
    // Fetch all users with their accounts
    const { data: users, error: userError } = await supabase
        .from('User')
        .select(`
            id,
            email,
            updatedAt,
            Account(
                id,
                provider,
                scope,
                access_token,
                refresh_token,
                expires_at
            )
        `);

    if (userError) {
        console.error('Error fetching users:', userError);
        process.exit(1);
    }

    console.log('Users found:', users?.length || 0);

    if (users) {
        users.forEach(user => {
            console.log(`User: ${user.email} (ID: ${user.id}) [Updated: ${user.updatedAt}]`);
            if (Array.isArray(user.Account)) {
                user.Account.forEach(account => {
                    const now = Math.floor(Date.now() / 1000);
                    const expired = account.expires_at ? account.expires_at < now : 'Unknown';
                    console.log(`  Account: ${account.provider} (ID: ${account.id})`);
                    console.log(`    Scope: ${account.scope}`);
                    console.log(`    Has Access Token: ${!!account.access_token}`);
                    console.log(`    Has Refresh Token: ${!!account.refresh_token}`);
                    console.log(`    Token Length: ${account.access_token?.length}`);
                    console.log(`    Expires At: ${account.expires_at} (Now: ${now}, Expired: ${expired})`);
                });
            }
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
