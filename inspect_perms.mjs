const pg = await import('pg');
const { Client } = pg.default;

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function inspectPerms() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected.');
    
    console.log('--- Table Privileges ---');
    const res = await client.query(`
      SELECT grantee, privilege_type 
      FROM information_schema.role_table_grants 
      WHERE table_name = 'products' AND table_schema = 'public';
    `);
    console.table(res.rows);

    console.log('--- RLS Status ---');
    const rls = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE nspname = 'public' AND relname = 'products';
    `);
    console.table(rls.rows);

    console.log('--- Policies ---');
    const policies = await client.query(`
      SELECT policyname, roles, cmd, qual 
      FROM pg_policies 
      WHERE tablename = 'products' AND schemaname = 'public';
    `);
    console.table(policies.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

inspectPerms();
