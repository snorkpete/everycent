# Dependency Health Review (Haiku)

## Finding 1
- **Package**: axios (1.13.4)
- **Type**: security
- **Description**: Axios is vulnerable to Denial of Service via __proto__ Key in mergeConfig (GHSA-43fc-jf86-j433). Current version 1.13.4 is vulnerable. Upgrade to 1.13.5 or later (1.13.6 or 1.14.0 available). This is a high-severity vulnerability allowing malicious config objects to trigger DoS.

## Finding 2
- **Package**: rollup (4.57.1, via Vite)
- **Type**: security
- **Description**: Rollup 4.x has Arbitrary File Write via Path Traversal vulnerability (GHSA-mw96-cpmx-2vgc). Vite pins to 4.57.1. This is high-severity. Run `npm audit fix` to upgrade Vite and Rollup, or wait for Vite 7.3.2+ which includes the fix.

## Finding 3
- **Package**: lodash (indirect dependency)
- **Type**: security
- **Description**: Lodash <=4.17.23 has multiple high-severity vulnerabilities: Code Injection via _.template imports and Prototype Pollution. This is pulled in by transitive dependencies. Run `npm audit fix` to upgrade affected packages.

## Finding 4
- **Package**: minimatch (indirect dependency via ESLint)
- **Type**: security
- **Description**: Minimatch has multiple ReDoS vulnerabilities (GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74). High-severity. ESLint 9.39.2 depends on minimatch 3.1.2 or 4.x versions with known vulnerabilities. Run `npm audit fix` to update.

## Finding 5
- **Package**: picomatch (indirect dependency)
- **Type**: security
- **Description**: Picomatch <=2.3.1 has ReDoS vulnerability and Method Injection in POSIX Character Classes (GHSA-c2c7-rcm5-vvqj, GHSA-3v7f-55p6-f55p). High-severity. Pulled in by glob utilities. Run `npm audit fix`.

## Finding 6
- **Package**: flatted (indirect dependency)
- **Type**: security
- **Description**: Flatted <=3.4.1 has unbounded recursion DoS in parse() and Prototype Pollution (GHSA-25h7-pfq9-p65f, GHSA-rf6f-7fwh-wjgh). High-severity. Run `npm audit fix`.

## Finding 7
- **Package**: brace-expansion (indirect dependency)
- **Type**: security
- **Description**: Brace-expansion has zero-step sequence causing process hang and memory exhaustion (GHSA-f886-m6hf-6m8v). Moderate severity. Appears in multiple locations via ESLint toolchain. Run `npm audit fix`.

## Finding 8
- **Package**: ajv (indirect dependency)
- **Type**: security
- **Description**: AJV <6.14.0 has ReDoS vulnerability when using `$data` option (GHSA-2g4f-4pwh-qvx6). Moderate severity. Run `npm audit fix`.

## Finding 9
- **Package**: vue-router (4.6.4)
- **Type**: outdated
- **Description**: Vue Router is at 4.6.4 but 5.0.4 is available. Vue 3 is fully compatible with Vue Router 5, which has improved TypeScript support and better composition API alignment. However, this is a breaking change requiring route config updates. Consider planning a minor release to upgrade.

## Finding 10
- **Package**: @types/bcryptjs, @types/node, @types/pg (devDependencies)
- **Type**: misplaced
- **Description**: These type packages are in devDependencies but are only used in `cypress/scripts/seed-*.ts` files which are build-time utilities. They're correct as devDependencies since they're not imported in src/ or compiled into the bundle. No change needed; this is properly configured.

## Finding 11
- **Package**: @vueuse/core (14.2.1)
- **Type**: heavy
- **Description**: @vueuse/core is a 1.5MB package but only one utility (useBreakpoints) is imported in the entire project. Only used in `useResponsive.ts`. Consider: (1) evaluating if useBreakpoints is critical enough to justify the dependency, or (2) replacing with a lightweight custom breakpoint hook using matchMedia API directly. Alternative: tree-shake by verifying bundler is correctly optimizing unused exports.

## Finding 12
- **Package**: primeicons (7.0.0)
- **Type**: outdated
- **Description**: PrimeIcons is at 7.0.0 but 8.0.0 alphas are available. However, 8.0.0 is not yet released (alpha stage). Stay on 7.0.0 for stability until 8.0.0 is in stable release.

## Backend (Gemfile) Summary

The Rails Gemfile is well-maintained. No critical security issues detected. Minor notes:
- `bootsnap` is correctly included with a version requirement
- `pg` is pinned to ~1.5.0 (safe version after fixing the old segfault issue)
- No outdated major versions blocking updates
- Development dependencies are properly separated into groups

### Immediate Actions Required:
1. **Run `npm audit fix`** in `webclientv4/` to patch 9 vulnerabilities (2 moderate, 7 high)
2. **Upgrade axios** from 1.13.4 to 1.14.0 (or at least 1.13.5) - critical DoS fix
3. **Verify test coverage** after running audit fix to ensure no behavioral changes

### Medium-term Improvements:
1. Plan Vue Router 4->5 upgrade for better TypeScript and composition API integration
2. Evaluate @vueuse/core usage; consider replacing useBreakpoints with native matchMedia if bundle size is a concern
3. Monitor minimatch, ESLint, and related transitive dependencies for future updates
