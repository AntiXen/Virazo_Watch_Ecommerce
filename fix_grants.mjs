const pg = await import('pg');
const { Client } = pg.default;

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function fixGrants() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected.');
    
    // Grant full access to authenticated role on public schema
    await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;`);
    await client.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;`);
    await client.query(`GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;`);
    
    // Ensure anon still has select
    await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;`);
    
    // Also check storage permissions if needed, but for now focus on the table error
    console.log('Full privileges granted to "authenticated" role on public tables.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixGrants();
