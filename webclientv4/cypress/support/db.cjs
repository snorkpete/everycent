const { Pool } = require('pg');

const HOUSEHOLD_NAME = 'Cypress Test Household';

// Support both separate cypress DB and shared dev DB via env var
const DATABASE_NAME = process.env.CYPRESS_DATABASE_NAME || 'everycent_cypress';

const pool = new Pool({
  database: DATABASE_NAME,
  host: 'localhost',
  port: 5432,
});

const DATA_TABLES = [
  'transactions',
  'allocations',
  'sink_fund_allocations',
  'bank_accounts',
  'institutions',
  'allocation_categories',
  'settings',
  'budgets',
  'incomes',
  'special_events',
];

async function getHouseholdId() {
  const { rows } = await pool.query(
    'SELECT id FROM households WHERE name = $1 LIMIT 1',
    [HOUSEHOLD_NAME],
  );
  if (rows.length === 0) {
    const seedScript = process.env.CYPRESS_DATABASE_NAME ? 'cypress:seed-dev-db' : 'cypress:seed-db';
    throw new Error(
      `Test household "${HOUSEHOLD_NAME}" not found. Run: npm run ${seedScript}`,
    );
  }
  return rows[0].id;
}

const dbTasks = {
  'db:reset': async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const householdId = await getHouseholdId();
      // Delete data for the test household only (safe for shared databases)
      for (const table of DATA_TABLES) {
        await client.query(
          `DELETE FROM ${table} WHERE household_id = $1`,
          [householdId],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    return null;
  },

  'db:getHouseholdId': async () => {
    return getHouseholdId();
  },

  'db:seed:institutions': async (institutions) => {
    const householdId = await getHouseholdId();
    const now = new Date().toISOString();
    const ids = [];
    for (const inst of institutions) {
      const { rows } = await pool.query(
        `INSERT INTO institutions (name, household_id, created_at, updated_at)
         VALUES ($1, $2, $3, $3) RETURNING id`,
        [inst.name, householdId, now],
      );
      ids.push(rows[0].id);
    }
    return ids;
  },

  'db:seed:bankAccounts': async (accounts) => {
    const householdId = await getHouseholdId();
    const now = new Date().toISOString();
    const ids = [];
    for (const acct of accounts) {
      const { rows } = await pool.query(
        `INSERT INTO bank_accounts
           (name, account_type, account_category, is_cash, institution_id,
            account_no, opening_balance, import_format, status, household_id,
            created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING id`,
        [
          acct.name,
          acct.account_type ?? 'normal',
          acct.account_category ?? 'asset',
          acct.is_cash ?? true,
          acct.institution_id ?? null,
          acct.account_no ?? '',
          acct.opening_balance ?? 0,
          acct.import_format ?? '',
          acct.status ?? 'open',
          householdId,
          now,
        ],
      );
      ids.push(rows[0].id);
    }
    return ids;
  },

  'db:seed:allocationCategories': async (categories) => {
    const householdId = await getHouseholdId();
    const now = new Date().toISOString();
    const ids = [];
    for (const cat of categories) {
      const { rows } = await pool.query(
        `INSERT INTO allocation_categories (name, percentage, household_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $4) RETURNING id`,
        [cat.name, cat.percentage ?? 0, householdId, now],
      );
      ids.push(rows[0].id);
    }
    return ids;
  },

  'db:seed:settings': async (settings) => {
    const householdId = await getHouseholdId();
    const now = new Date().toISOString();
    await pool.query('DELETE FROM settings WHERE household_id = $1', [householdId]);
    await pool.query(
      `INSERT INTO settings
         (household_id, family_type, husband, wife, single_person,
          primary_budget_account_id,
          default_allocation_category_id_for_special_events,
          bank_charges_allocation_name, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9)`,
      [
        householdId,
        settings.family_type ?? 'couple',
        settings.husband ?? 'Husband',
        settings.wife ?? 'Wife',
        settings.single_person ?? null,
        settings.primary_budget_account_id ?? null,
        settings.default_allocation_category_id_for_special_events ?? null,
        settings.bank_charges_allocation_name ?? null,
        now,
      ],
    );
    return null;
  },
};

module.exports = { dbTasks };
