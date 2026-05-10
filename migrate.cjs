const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.qehzoazkmgneeunqjsgc:AntiXen115127@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

async function migrate() {
    const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
    try {
        console.log('Connecting to database...');
        await client.connect();

        console.log('Dropping and recreating public schema...');
        await client.query('DROP SCHEMA public CASCADE;');
        await client.query('CREATE SCHEMA public;');
        await client.query('GRANT ALL ON SCHEMA public TO postgres;');
        await client.query('GRANT ALL ON SCHEMA public TO public;');

        const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Executing migration: ${file}...`);
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
                await client.query(sql);
            }
        }

        console.log('Migrations completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
