const pg = await import('pg');
const { Client } = pg.default;

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function fixPerms() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected.');
    
    await client.query(`GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;`);
    await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated, authenticator;`);
    await client.query(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, authenticator;`);
    await client.query(`GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, authenticator;`);
    
    // Ensure RLS is actually allowing anon
    await client.query(`ALTER TABLE public.products FORCE ROW LEVEL SECURITY;`); // Just to be sure
    await client.query(`ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;`);
    
    console.log('Permissions granted to anon, authenticated, and authenticator.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixPerms();
