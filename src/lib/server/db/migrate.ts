import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.SUPABASE_DB_URL;
if (!url) {
	console.error('SUPABASE_DB_URL is not set');
	process.exit(1);
}

const client = postgres(url, { max: 1 });
const db = drizzle(client);

console.log('Running migrations...');
await migrate(db, { migrationsFolder: './src/lib/server/db/migrations' });
console.log('Migrations complete.');

await client.end();
