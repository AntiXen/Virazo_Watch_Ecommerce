const pg = await import('pg');
const { Client } = pg.default;

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function checkGrants() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT grantee, privilege_type 
      FROM information_schema.role_table_grants 
      WHERE table_name = 'products' AND table_schema = 'public';
    `);
    console.table(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkGrants();
