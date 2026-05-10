import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

const brands = [
  { name: "Rolex", slug: "rolex" },
  { name: "Casio", slug: "casio" },
  { name: "Fossil", slug: "fossil" },
  { name: "Citizen", slug: "citizen" },
  { name: "Seiko", slug: "seiko" },
  { name: "Curren", slug: "curren" },
  { name: "Naviforce", slug: "naviforce" },
  { name: "Tissot", slug: "tissot" },
  { name: "G-Shock", slug: "g-shock" }
];

const products = [
  { name: "Heritage Skeleton Automatic", brand: "Rolex", price: 1599, discount: 1299, rating: 4.9, reviews: 128, image: "/src/assets/watch-1.jpg", tags: ["best-seller", "deal"] },
  { name: "Chronograph Noir Edition", brand: "Tissot", price: 549, discount: null, rating: 4.7, reviews: 86, image: "/src/assets/watch-2.jpg", tags: ["best-seller", "popular"] },
  { name: "Mercer Rose Gold Dress", brand: "Fossil", price: 289, discount: 229, rating: 4.6, reviews: 204, image: "/src/assets/watch-3.jpg", tags: ["best-seller", "new"] },
  { name: "G-Shock Tactical GA-2100", brand: "G-Shock", price: 159, discount: null, rating: 4.8, reviews: 512, image: "/src/assets/watch-4.jpg", tags: ["popular", "best-seller"] },
  { name: "Azure Diver Professional", brand: "Seiko", price: 799, discount: 689, rating: 4.9, reviews: 167, image: "/src/assets/watch-5.jpg", tags: ["new", "deal"] },
  { name: "Heritage Roman Classic", brand: "Citizen", price: 349, discount: null, rating: 4.5, reviews: 92, image: "/src/assets/watch-6.jpg", tags: ["popular"] },
  { name: "Stealth Lume Field", brand: "Naviforce", price: 119, discount: null, rating: 4.4, reviews: 318, image: "/src/assets/watch-7.jpg", tags: ["new"] },
  { name: "Minimalist Rose 36", brand: "Curren", price: 139, discount: 99, rating: 4.3, reviews: 421, image: "/src/assets/watch-8.jpg", tags: ["new", "popular"] }
];

async function seed() {
  const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    
    // Insert brands and get their IDs
    for (const b of brands) {
      await client.query(`
        INSERT INTO public.brands (name, slug) 
        VALUES ($1, $2)
        ON CONFLICT (slug) DO NOTHING;
      `, [b.name, b.slug]);
    }

    const { rows: dbBrands } = await client.query('SELECT id, name FROM public.brands');

    // Insert categories
    const defaultCategoryId = await client.query(`
      INSERT INTO public.categories (name, slug) 
      VALUES ('Men Watches', 'men-watches')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const catId = defaultCategoryId.rows[0].id;

    // Insert products
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const brandId = dbBrands.find(b => b.name === p.brand)?.id;
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      await client.query(`
        INSERT INTO public.products (
          name, slug, sku, brand_id, category_id, 
          price, discount_price, stock, rating, reviews_count, images, tags, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, 
          $6, $7, 50, $8, $9, $10, $11, true
        ) ON CONFLICT (slug) DO NOTHING;
      `, [
        p.name, slug, 'SKU-' + (1000 + i), brandId, catId,
        p.price, p.discount, p.rating, p.reviews, [p.image], p.tags
      ]);
    }
    
    console.log("Seeding complete!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

seed();
