# Dependency Health Review (Sonnet)

## Finding 1
- **Package**: `bcryptjs` (^2.4.3) + `@types/bcryptjs` (^2.4.6)
- **Type**: misplaced
- **Description**: Both `bcryptjs` and its type stubs are listed as `devDependencies`, which is correct in isolation, but they are used exclusively in `cypress/scripts/seed-cypress-db.ts` and `cypress/scripts/seed-dev-db.ts` — Node.js seed scripts that run outside the browser build entirely. They have no place in either `dependencies` or `devDependencies` of the browser app; they are test-database tooling. The real concern is that `bcryptjs` is a pure-JS password hashing library being used in the *frontend repo* only to seed a test DB. Password hashing at seed time should be delegated to Rails (via a rake task or Rails console command), eliminating this dependency entirely from the JS project.

## Finding 2
- **Package**: `pg` (^8.13.3) + `@types/pg` (^8.11.10)
- **Type**: misplaced
- **Description**: `pg` (PostgreSQL client) and its types are listed as `devDependencies` in a browser Vue app. They exist solely to support `cypress/scripts/seed-cypress-db.ts` and `seed-dev-db.ts`, which connect directly to Postgres to insert test data. A browser frontend should never need a Postgres client. Like `bcryptjs`, this seeding logic belongs in a Rails rake task. If it must remain in JS, it should be isolated in a separate `scripts/` package.json rather than polluting the main app's dependency tree.

## Finding 3
- **Package**: `newrelic_rpm` (7.2.0) — Gemfile
- **Type**: outdated
- **Description**: Locked to version 7.2.0 (released ~2021). The current major release is version 9.x (released 2023). Versions 7.x are outside New Relic's active support window and miss several years of bug fixes, security patches, and Ruby 3.x compatibility improvements. Should be upgraded to `~> 9.0` and the lockfile refreshed.

## Finding 4
- **Package**: `puma` (5.4.0) — Gemfile
- **Type**: outdated
- **Description**: Locked to 5.4.0. Puma 6.0 was released in late 2022 and Puma 6.x is the current stable branch. Puma 5.x had several CVEs addressed in 5.6.x and in 6.x (including CVE-2022-23634, a potential HTTP request smuggling issue fixed in 5.6.2). The Gemfile lists `puma` with no version constraint, so only the lock is holding this back. Run `bundle update puma` to pull in the latest safe version.

## Finding 5
- **Package**: `acts_as_tenant` (0.5.0) — Gemfile
- **Type**: outdated
- **Description**: Locked to 0.5.0, which is a very old release. The current version as of 2025 is 0.6.x. Intermediate versions fixed thread-safety issues and Rails 7 compatibility bugs. The Gemfile has no version constraint, so `bundle update acts_as_tenant` is safe.

## Finding 6
- **Package**: `rack-cors` (1.1.1) — Gemfile
- **Type**: outdated
- **Description**: Locked to 1.1.1. The current release is 2.0.x. Version 2.0 dropped support for legacy Rack 2.x and aligns with Rack 3 / Rails 7.1. Since the project is already on Rails 7.1 (which ships Rack 3), the 1.1.x line may introduce subtle Rack middleware compatibility issues.

## Finding 7
- **Package**: `@vueuse/core` (^14.2.1)
- **Type**: heavy
- **Description**: The entire `@vueuse/core` library (300+ composables, bundled as a monolith in v14) is pulled in for a single composable: `useBreakpoints`, used only in `src/app/shared/composables/useResponsive.ts`. The `useBreakpoints` composable itself is a thin wrapper over `window.matchMedia`. This could be replaced with a ~15-line custom composable using the native `matchMedia` API with `addEventListener('change', ...)`, eliminating the dependency entirely. The test `setup.ts` already mocks `matchMedia` globally, so the migration path is straightforward.

## Finding 8
- **Package**: `mimemagic` (0.3.5, pinned via GitHub SHA) — Gemfile
- **Type**: outdated
- **Description**: Pinned to a specific git commit (`01f92d86`) on a GitHub fork as a workaround for the original gem's licence controversy in 2021. The upstream gem has since been relicensed and rereleased. Rails 7.1's `Marcel` gem (which replaced `mimemagic` internally) handles MIME detection natively, meaning this dependency may be entirely vestigial. Verify whether any code still calls `MimeMagic` directly; if not, remove it. If still needed, switch to the current released gem on RubyGems rather than a pinned git ref.

## Finding 9
- **Package**: `active_model_serializers` (0.10.15) — Gemfile
- **Type**: heavy / outdated
- **Description**: AMS 0.10.x is effectively unmaintained (last significant release in 2019, repo in maintenance-only mode). It uses its own JSON:API adapter that has known incompatibilities with Rails 7 features (like `strict_loading`). The Rails ecosystem has largely moved to `jsonapi-serializer` (the community fork of `fast_jsonapi`) or plain `Jbuilder` (already commented out in the Gemfile). Not a security risk today, but a maintenance liability that grows with each Rails upgrade.

## Finding 10
- **Package**: `ruby_gntp` (0.3.4) + `terminal-notifier-guard` (1.7.0) — Gemfile `:development, :test`
- **Type**: unused (macOS notification relics)
- **Description**: Both gems exist solely to send desktop Growl/Notification Center alerts from Guard on macOS. `ruby_gntp` targets the long-dead Growl notification daemon; `terminal-notifier-guard` wraps `terminal-notifier` which has not been maintained since 2020. These are leftover developer-convenience tools that add noise to the dependency tree. Remove both and their `guard` configuration entries.

## Finding 11
- **Package**: `devise_token_auth` (~> 1.2.2, locked 1.2.5) — Gemfile
- **Type**: outdated
- **Description**: The current release of `devise_token_auth` is 1.2.5, so the lock is current within the pinned range. However, the constraint `~> 1.2.2` is overly tight — it locks out all `1.3.x` patch releases. The `1.3.x` line contains Ruby 3.2 keyword argument fixes and Rails 7.1 compatibility patches. Loosen the constraint to `~> 1.2` (or `>= 1.2.2`) to allow patch-level updates.

## Finding 12
- **Package**: `faker` (~> 3.2.0, locked 3.2.3) — Gemfile `:test`
- **Type**: outdated
- **Description**: The constraint `~> 3.2.0` pins to the 3.2.x patch series. The current Faker version is 3.5.x. Loosen to `~> 3.2` to allow minor version updates, which often include new locale data and bug fixes without breaking changes.

## Finding 13
- **Package**: `primeicons` (^7.0.0)
- **Type**: misplaced (minor)
- **Description**: `primeicons` is listed as a runtime `dependency`, but it is consumed purely as a CSS import in `src/main.ts` (`import 'primeicons/primeicons.css'`). Since Vite bundles it at build time and no JS is imported from it at runtime, it is more accurately a build-time asset and could be classified as a `devDependency`. This is a packaging semantics issue — it causes no functional harm, but inflates the listed runtime dependency set.

## Summary Table

| # | Package | Side | Severity |
|---|---------|-------|----------|
| 1 | `bcryptjs` / `@types/bcryptjs` | Frontend | High — wrong domain (DB ops in browser app) |
| 2 | `pg` / `@types/pg` | Frontend | High — wrong domain (DB client in browser app) |
| 3 | `newrelic_rpm` 7.2 | Backend | Medium — years out of date, outside support window |
| 4 | `puma` 5.4.0 | Backend | Medium — misses CVE fixes in 5.6.x/6.x |
| 5 | `acts_as_tenant` 0.5.0 | Backend | Low-Medium — thread-safety fixes missed |
| 6 | `rack-cors` 1.1.1 | Backend | Low-Medium — Rack 3 alignment |
| 7 | `@vueuse/core` | Frontend | Low — entire library for one native-replaceable composable |
| 8 | `mimemagic` git-pinned | Backend | Low — vestigial git-pinned workaround |
| 9 | `active_model_serializers` | Backend | Low — unmaintained serializer |
| 10 | `ruby_gntp` / `terminal-notifier-guard` | Backend | Low — dead macOS notification tools |
| 11 | `devise_token_auth` constraint | Backend | Low — overly tight semver range |
| 12 | `faker` constraint | Backend | Low — overly tight semver range |
| 13 | `primeicons` | Frontend | Cosmetic — could be devDependency |
