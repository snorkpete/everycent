/**
 * One-time seed script for the everycent_cypress test database.
 * Run with: npm run cypress:seed-db
 *
 * Prerequisites:
 *   createdb everycent_cypress
 *   rails db:schema:load DATABASE_URL=postgresql://localhost/everycent_cypress
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const TEST_EMAIL = 'cypress@test.com';
const TEST_PASSWORD = 'CypressTest123!';
const HOUSEHOLD_NAME = 'Cypress Test Household';

const pool = new Pool({
  database: 'everycent_cypress',
  host: 'localhost',
  port: 5432,
});

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if household already exists
    const existingHousehold = await client.query(
      "SELECT id FROM households WHERE name = $1 LIMIT 1",
      [HOUSEHOLD_NAME],
    );

    let householdId: number;
    if (existingHousehold.rows.length > 0) {
      householdId = existingHousehold.rows[0].id as number;
      console.log(`Household already exists (id=${householdId}), skipping creation.`);
    } else {
      const now = new Date().toISOString();
      const { rows } = await client.query(
        'INSERT INTO households (name, created_at, updated_at) VALUES ($1, $2, $2) RETURNING id',
        [HOUSEHOLD_NAME, now],
      );
      householdId = rows[0].id as number;
      console.log(`Created household (id=${householdId})`);
    }

    // Check if test user already exists
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1 LIMIT 1",
      [TEST_EMAIL],
    );

    if (existingUser.rows.length > 0) {
      const userId = existingUser.rows[0].id as number;
      console.log(`Test user already exists (id=${userId}), skipping creation.`);
    } else {
      const encryptedPassword = bcrypt.hashSync(TEST_PASSWORD, 10);
      const now = new Date().toISOString();
      const { rows } = await client.query(
        `INSERT INTO users
           (provider, uid, email, encrypted_password, confirmed_at,
            household_id, created_at, updated_at)
         VALUES ('email', $1, $1, $2, $3, $4, $3, $3) RETURNING id`,
        [TEST_EMAIL, encryptedPassword, now, householdId],
      );
      const userId = rows[0].id as number;
      console.log(`Created test user (id=${userId}) with email=${TEST_EMAIL}`);
    }

    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
