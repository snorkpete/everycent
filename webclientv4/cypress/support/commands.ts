Cypress.Commands.add('loginAsTestUser', () => {
  cy.env(['testUser']).then(({ testUser }) => {
    cy.request({
      method: 'POST',
      url: `${Cypress.expose('apiUrl')}/auth/sign_in`,
      body: testUser,
    }).then(({ headers }) => {
      Cypress.expose('authHeaders', {
        'access-token': headers['access-token'] as string,
        client: headers['client'] as string,
        expiry: headers['expiry'] as string,
        'token-type': headers['token-type'] as string,
        uid: headers['uid'] as string,
      });
    });
  });
});

Cypress.Commands.add('visitAuthenticated', (path: string) => {
  // Read headers set by loginAsTestUser() — this command must be chained after it.
  const headers = Cypress.expose('authHeaders') as Record<string, string> | undefined;
  cy.visit(path, {
    onBeforeLoad(win) {
      if (headers) {
        for (const [key, val] of Object.entries(headers)) {
          win.localStorage.setItem(key, val);
        }
      }
    },
  });
});

// Make this file a module so that `declare global` is valid.
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsTestUser(): Chainable;
      visitAuthenticated(path: string): Chainable;
    }
  }
}
