---
name: spending-analysis
description: Use when the user wants to analyse Everycent spending data via ad-hoc SQL queries. Loads database context (schema, conventions, cents-to-dollars) so the user can direct investigation. Fires on /spending-analysis or "analyse spending".
version: 1.0.0
---

# Spending Analysis

You are helping the user analyse their Everycent spending data. Load this context and make it available throughout the session. The user will direct what they want to investigate.

## Database context

- DB: `everycent_dev_5` (local PostgreSQL, user `kion`, no password)
- Connect: `psql -d everycent_dev_4 -c "..."`
- Amounts are stored as **integers in cents** — always divide by `100.0`
- Exclude manual adjustments: `is_manual_adjustment = false`
- `withdrawal_amount > 0` for spending; `deposit_amount > 0` for income
- Note: dev DB has test noise. User will provide a fresh production DB for real analysis — update the DB name when that happens.

## Key schema

```
transactions → allocations (via allocation_id)
allocations  → allocation_categories (via allocation_category_id)
allocations  → budgets (via budget_id)
budgets      → start_date / end_date
transactions → transaction_date, withdrawal_amount, deposit_amount, payee_name, description
```

## Query patterns

### Date range
```sql
SELECT COUNT(*), MIN(transaction_date), MAX(transaction_date)
FROM transactions WHERE withdrawal_amount > 0;
```

### Monthly spending overview
```sql
SELECT to_char(transaction_date, 'YYYY-MM') AS month,
  ROUND(SUM(withdrawal_amount) / 100.0, 2) AS total_spent,
  COUNT(*) AS num_transactions
FROM transactions
WHERE transaction_date >= '[start]' AND withdrawal_amount > 0
  AND is_manual_adjustment = false
GROUP BY month ORDER BY month;
```

### Spending by category
```sql
SELECT COALESCE(ac.name, 'Uncategorised') AS category,
  ROUND(SUM(t.withdrawal_amount) / 100.0, 2) AS total_spent,
  COUNT(*) AS num_transactions,
  ROUND(AVG(t.withdrawal_amount) / 100.0, 2) AS avg_transaction
FROM transactions t
LEFT JOIN allocations a ON t.allocation_id = a.id
LEFT JOIN allocation_categories ac ON a.allocation_category_id = ac.id
WHERE t.transaction_date BETWEEN '[start]' AND '[end]'
  AND t.withdrawal_amount > 0 AND t.is_manual_adjustment = false
GROUP BY ac.name ORDER BY total_spent DESC;
```

### Top payees
```sql
SELECT COALESCE(t.payee_name, t.description, 'Unknown') AS payee,
  ROUND(SUM(t.withdrawal_amount) / 100.0, 2) AS total_spent,
  COUNT(*) AS visits,
  ROUND(AVG(t.withdrawal_amount) / 100.0, 2) AS avg_per_visit
FROM transactions t
WHERE t.transaction_date BETWEEN '[start]' AND '[end]'
  AND t.withdrawal_amount > 0 AND t.is_manual_adjustment = false
GROUP BY payee ORDER BY total_spent DESC LIMIT 25;
```

### Consistently over-budget allocations
```sql
SELECT a.name, ac.name AS category,
  COUNT(DISTINCT b.id) AS months_active,
  ROUND(AVG(a.amount) / 100.0, 2) AS avg_budgeted,
  ROUND(SUM(t_agg.actual_spent) / 100.0 / COUNT(DISTINCT b.id), 2) AS avg_spent_per_month,
  ROUND((SUM(t_agg.actual_spent) / COUNT(DISTINCT b.id) - AVG(a.amount)) / 100.0, 2) AS avg_over_under_per_month
FROM allocations a
JOIN budgets b ON a.budget_id = b.id
LEFT JOIN allocation_categories ac ON a.allocation_category_id = ac.id
LEFT JOIN (
  SELECT allocation_id, SUM(withdrawal_amount) AS actual_spent
  FROM transactions WHERE is_manual_adjustment = false GROUP BY allocation_id
) t_agg ON t_agg.allocation_id = a.id
WHERE b.start_date >= '[start]' AND b.end_date <= '[end]'
  AND t_agg.actual_spent IS NOT NULL
GROUP BY a.name, ac.name
HAVING COUNT(DISTINCT b.id) >= 3
ORDER BY avg_over_under_per_month DESC LIMIT 15;
```

### Month-by-month budget vs actual
```sql
SELECT to_char(b.start_date, 'YYYY-MM') AS month, ac.name AS category,
  ROUND(SUM(a.amount) / 100.0, 2) AS budgeted,
  ROUND(COALESCE(SUM(t_agg.actual), 0) / 100.0, 2) AS actual,
  ROUND((COALESCE(SUM(t_agg.actual), 0) - SUM(a.amount)) / 100.0, 2) AS variance
FROM budgets b
JOIN allocations a ON a.budget_id = b.id
JOIN allocation_categories ac ON a.allocation_category_id = ac.id
LEFT JOIN (
  SELECT allocation_id, SUM(withdrawal_amount) AS actual
  FROM transactions WHERE is_manual_adjustment = false GROUP BY allocation_id
) t_agg ON t_agg.allocation_id = a.id
WHERE b.start_date >= '[start]' AND b.end_date <= '[end]'
  AND ac.name IN ('Food - Groceries','Food - Eating Out','Mortgage & Utilities',
                  'Transport','Online Subscriptions','Medical','Household Purchases')
GROUP BY month, ac.name ORDER BY month, ac.name;
```

### Over/under budget frequency per category
```sql
SELECT ac.name AS category,
  SUM(CASE WHEN (COALESCE(t_agg.actual,0) - a.amount) < 0 THEN 1 ELSE 0 END) AS months_under,
  SUM(CASE WHEN (COALESCE(t_agg.actual,0) - a.amount) >= 0 THEN 1 ELSE 0 END) AS months_over,
  ROUND(AVG((COALESCE(t_agg.actual,0) - a.amount)) / 100.0, 2) AS avg_monthly_variance
FROM allocations a
JOIN budgets b ON a.budget_id = b.id
JOIN allocation_categories ac ON a.allocation_category_id = ac.id
LEFT JOIN (
  SELECT allocation_id, SUM(withdrawal_amount) AS actual
  FROM transactions WHERE is_manual_adjustment = false GROUP BY allocation_id
) t_agg ON t_agg.allocation_id = a.id
WHERE b.start_date >= '[start]' AND b.end_date <= '[end]'
  AND ac.name IN ('Food - Groceries','Food - Eating Out','Mortgage & Utilities','Transport',
                  'Online Subscriptions','Medical','Household Purchases','Recreation','Insurance/Annuities')
GROUP BY ac.name ORDER BY avg_monthly_variance DESC;
```

### Drill into a category by payee
```sql
SELECT COALESCE(t.payee_name, t.description, 'Unknown') AS payee,
  ROUND(SUM(t.withdrawal_amount) / 100.0, 2) AS total_spent,
  COUNT(*) AS visits,
  ROUND(AVG(t.withdrawal_amount) / 100.0, 2) AS avg_per_visit
FROM transactions t
JOIN allocations a ON t.allocation_id = a.id
JOIN allocation_categories ac ON a.allocation_category_id = ac.id
WHERE t.transaction_date BETWEEN '[start]' AND '[end]'
  AND t.withdrawal_amount > 0 AND t.is_manual_adjustment = false
  AND ac.name = '[Category Name]'
GROUP BY payee ORDER BY total_spent DESC;
```

### Fast food / chain breakdown
```sql
SELECT
  CASE
    WHEN LOWER(COALESCE(t.payee_name, t.description)) LIKE '%kfc%' THEN 'KFC'
    WHEN LOWER(COALESCE(t.payee_name, t.description)) LIKE '%mcdonald%' THEN 'McDonald''s'
    WHEN LOWER(COALESCE(t.payee_name, t.description)) LIKE '%domino%' THEN 'Domino''s'
    WHEN LOWER(COALESCE(t.payee_name, t.description)) LIKE '%burger king%' THEN 'Burger King'
    ELSE 'Other'
  END AS chain,
  ROUND(SUM(t.withdrawal_amount) / 100.0, 2) AS total_spent,
  COUNT(*) AS visits
FROM transactions t
JOIN allocations a ON t.allocation_id = a.id
JOIN allocation_categories ac ON a.allocation_category_id = ac.id
WHERE t.transaction_date BETWEEN '[start]' AND '[end]'
  AND t.withdrawal_amount > 0 AND t.is_manual_adjustment = false
  AND ac.name = 'Food - Eating Out'
GROUP BY chain ORDER BY total_spent DESC;
```

### Spike month — uncategorised transactions
```sql
SELECT to_char(t.transaction_date, 'YYYY-MM') AS month,
  COALESCE(t.payee_name, t.description, 'Unknown') AS payee,
  ROUND(t.withdrawal_amount / 100.0, 2) AS amount
FROM transactions t
WHERE t.allocation_id IS NULL
  AND t.transaction_date BETWEEN '[month-start]' AND '[month-end]'
  AND t.withdrawal_amount > 0 AND t.is_manual_adjustment = false
ORDER BY t.withdrawal_amount DESC;
```

### Subscriptions
```sql
SELECT a.name, ROUND(a.amount / 100.0, 2) AS monthly_cost
FROM allocations a
JOIN allocation_categories ac ON a.allocation_category_id = ac.id
JOIN budgets b ON a.budget_id = b.id
WHERE ac.name = 'Online Subscriptions'
  AND b.start_date >= '[most-recent-month]'
GROUP BY a.name, a.amount
ORDER BY a.amount DESC;
```

### Day of week pattern
```sql
SELECT TO_CHAR(transaction_date, 'Day') AS day_of_week,
  EXTRACT(DOW FROM transaction_date) AS dow_num,
  COUNT(*) AS transactions,
  ROUND(SUM(withdrawal_amount) / 100.0, 2) AS total_spent,
  ROUND(AVG(withdrawal_amount) / 100.0, 2) AS avg_per_transaction
FROM transactions
WHERE transaction_date BETWEEN '[start]' AND '[end]'
  AND withdrawal_amount > 0 AND is_manual_adjustment = false
GROUP BY day_of_week, dow_num ORDER BY dow_num;
```
