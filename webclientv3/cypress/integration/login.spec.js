/// <reference types="Cypress" />

// v3 has no login page of its own; login happens in the Vue app.
describe("Login", () => {
  it("can login in the background", () => {
    cy.login();
    cy.visit('/#/account-balances')

    cy.contains('Account Balances')
      .should('exist');
  });
});
