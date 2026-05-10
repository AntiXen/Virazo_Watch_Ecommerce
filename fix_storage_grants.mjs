const pg = await import('pg');
const { Client } = pg.default;

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function fixStorageGrants() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected.');
    
    // Grant access to storage schema
    await client.query(`GRANT USAGE ON SCHEMA storage TO authenticated, anon;`);
    await client.query(`GRANT ALL PRIVILEGES ON TABLE storage.objects TO authenticated;`);
    await client.query(`GRANT ALL PRIVILEGES ON TABLE storage.buckets TO authenticated;`);
    await client.query(`GRANT SELECT ON TABLE storage.objects TO anon;`);
    await client.query(`GRANT SELECT ON TABLE storage.buckets TO anon;`);
    
    console.log('Storage grants fixed.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixStorageGrants();
