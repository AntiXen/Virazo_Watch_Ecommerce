const pg = await import('pg');
const { Client } = pg.default;

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function fixAllTableGrants() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected.');
    
    // Grant full access to authenticated role on public schema
    await client.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;`);
    await client.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;`);
    
    // Grant specific insert access to anon for orders, order_items, and reviews
    await client.query(`GRANT INSERT, SELECT ON TABLE public.orders TO anon;`);
    await client.query(`GRANT INSERT, SELECT ON TABLE public.order_items TO anon;`);
    await client.query(`GRANT INSERT, SELECT ON TABLE public.reviews TO anon;`);
    
    // Grant select on everything else to anon
    await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;`);
    
    console.log('Comprehensive table grants fixed.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixAllTableGrants();
