const pg = await import('pg');
const { Client } = pg.default;

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function fixRLS() {
  const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    console.log('Connected. Fixing RLS policies for public reads...');

    // Drop old restrictive policies and create truly public ones for read access
    const publicTables = [
      { table: 'products', policy: 'public read active products', condition: 'is_active = true' },
      { table: 'brands', policy: 'public read brands', condition: 'true' },
      { table: 'categories', policy: 'public read categories', condition: 'true' },
      { table: 'banners', policy: 'public read active banners', condition: 'is_active = true' },
      { table: 'deals', policy: 'public read active deals', condition: 'is_active = true' },
      { table: 'reviews', policy: 'public read approved reviews', condition: 'approved = true' },
      { table: 'content_blocks', policy: 'public read content', condition: 'true' },
    ];

    for (const { table, policy, condition } of publicTables) {
      // Drop the old policy
      await client.query(`DROP POLICY IF EXISTS "${policy}" ON public.${table};`);
      // Create a new policy that works for anon users (no auth required)
      await client.query(`
        CREATE POLICY "${policy}" ON public.${table}
        FOR SELECT
        TO anon, authenticated
        USING (${condition});
      `);
      console.log(`  ✓ Fixed: ${table}`);
    }

    // Also ensure anon role can read from these tables
    await client.query(`GRANT USAGE ON SCHEMA public TO anon;`);
    await client.query(`GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;`);

    console.log('All RLS policies fixed for public storefront access!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixRLS();
