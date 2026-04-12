/**
 * Tests for no-api-gateway-outside-api-modules ESLint rule.
 *
 * Run with: npm run test:eslint-rules
 *
 * Uses node:test instead of vitest — ESLint's RuleTester calls describe/it
 * internally, which conflicts with vitest's suite tracking. See
 * tools/eslint-rules/README.md for the full rationale.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import rule from './no-api-gateway-outside-api-modules.js';

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('no-api-gateway-outside-api-modules', () => {
  it('allows apiGateway calls inside *Api.ts files (camelCase)', () => {
    assert.doesNotThrow(() => {
      tester.run('no-api-gateway-outside-api-modules', rule, {
        valid: [
          {
            // camelCase api module — ends with Api.ts, not api.ts
            filename: '/src/app/bank-accounts/bankAccountApi.ts',
            code: `apiGateway.get('/bank_accounts')`,
          },
          {
            filename: '/src/app/institutions/institutionApi.ts',
            code: `apiGateway.post('/institutions', data)`,
          },
        ],
        invalid: [],
      });
    });
  });

  it('allows apiGateway calls inside .spec.ts files', () => {
    assert.doesNotThrow(() => {
      tester.run('no-api-gateway-outside-api-modules', rule, {
        valid: [
          {
            filename: '/src/app/bank-accounts/bankAccountApi.spec.ts',
            code: `apiGateway.get('/bank_accounts')`,
          },
          {
            // Store specs mock apiGateway directly per the boundary mocking convention
            filename: '/src/app/bank-accounts/bankAccountStore.spec.ts',
            code: `apiGateway.get('/bank_accounts')`,
          },
        ],
        invalid: [],
      });
    });
  });

  it('allows apiGateway calls inside Cypress .cy.ts files', () => {
    assert.doesNotThrow(() => {
      tester.run('no-api-gateway-outside-api-modules', rule, {
        valid: [
          {
            filename: '/cypress/e2e/login.cy.ts',
            code: `apiGateway.post('/auth/sign_in', credentials)`,
          },
        ],
        invalid: [],
      });
    });
  });

  it('allows non-apiGateway calls inside store files', () => {
    assert.doesNotThrow(() => {
      tester.run('no-api-gateway-outside-api-modules', rule, {
        valid: [
          {
            filename: '/src/app/bank-accounts/bankAccountStore.ts',
            code: `bankAccountApi.getAll()`,
          },
        ],
        invalid: [],
      });
    });
  });

  it('reports apiGateway.get called inside a store file', () => {
    assert.doesNotThrow(() => {
      tester.run('no-api-gateway-outside-api-modules', rule, {
        valid: [],
        invalid: [
          {
            filename: '/src/app/bank-accounts/bankAccountStore.ts',
            code: `apiGateway.get('/bank_accounts')`,
            errors: [{ messageId: 'outsideApiModule', data: { method: 'get' } }],
          },
        ],
      });
    });
  });

  it('reports apiGateway calls for all HTTP methods outside api modules', () => {
    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
      assert.doesNotThrow(() => {
        tester.run('no-api-gateway-outside-api-modules', rule, {
          valid: [],
          invalid: [
            {
              filename: `/src/app/foo/fooStore.ts`,
              code: `apiGateway.${method}('/foo')`,
              errors: [{ messageId: 'outsideApiModule', data: { method } }],
            },
          ],
        });
      }, `Expected ${method} to be reported`);
    }
  });

  it('does not report methods outside the HTTP method set', () => {
    assert.doesNotThrow(() => {
      tester.run('no-api-gateway-outside-api-modules', rule, {
        valid: [
          {
            filename: '/src/app/foo/fooStore.ts',
            // interceptors.request is not a direct apiGateway HTTP call
            code: `const x = apiGateway.interceptors`,
          },
        ],
        invalid: [],
      });
    });
  });
});
