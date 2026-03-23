# Heroku PG Pull

Pull the Heroku production database down into a new local PostgreSQL database and update the app to use it.

## Prerequisites — tell the user this first

Before doing anything else, output this message to the user:

> **Before we continue:** make sure you're logged in to Heroku on the terminal.
> Run `heroku login` if you haven't already this session. Once you're logged in, let me know and I'll proceed.

Wait for the user to confirm they are logged in before continuing.

## Step 1 — Detect current DB and propose next name

Read `config/database.yml` and find the `database:` value under the `development:` section. This will be something like `everycent_dev_5`.

- Parse the trailing number (e.g. `5`)
- Increment it by 1 to get the proposed next DB name (e.g. `everycent_dev_6`)

Tell the user:

> Current dev DB: `everycent_dev_5`
> Proposed new DB: `everycent_dev_6`
>
> Proceed with this name, or enter a different one?

Wait for confirmation or a custom name before continuing.

## Step 2 — Pull from Heroku

Run the pull command using the confirmed DB name:

```bash
heroku pg:pull DATABASE_URL <confirmed-db-name> --app everycent
```

This will take a moment. Errors about `_heroku` schema or `transaction_timeout` are expected and harmless — Heroku-internal infrastructure that doesn't exist locally.

## Step 3 — Update database.yml

Edit `config/database.yml` and replace the `database:` value under `development:` with the new DB name.

## Step 4 — Check migration status

Run:

```bash
rails db:migrate:status
```

Report any migrations that are `down` — those will need to be run. If all are `up`, say so.

## Step 5 — Verify data freshness

Run:

```bash
rails runner "puts Transaction.maximum(:transaction_date)"
```

Report the date back to the user as a data freshness signal. A recent date confirms the pull captured up-to-date production data.

## Step 6 — Update the spending-analysis skill

Edit `.claude/skills/spending-analysis/SKILL.md` and update the DB name on line 8 (the `DB:` line) to match the new DB name.

## Done

Summarise:
- New DB name
- Migration status (all up / N down)
- Last transaction date
- Reminder that `spending-analysis` skill has been updated
