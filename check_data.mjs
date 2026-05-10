const pg = await import('pg');
const { Client } = pg.default;

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function checkData() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to DB.');
    
    const products = await client.query('SELECT count(*) FROM products');
    console.log('Products count:', products.rows[0].count);
    
    const brands = await client.query('SELECT count(*) FROM brands');
    console.log('Brands count:', brands.rows[0].count);
    
    const sample = await client.query('SELECT name, price FROM products LIMIT 5');
    console.log('Sample products:', sample.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkData();
