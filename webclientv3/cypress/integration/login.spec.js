/// <reference types="Cypress" />

describe("Login", () => {

  context("when not logged in", () => {

    it("redirects to the login page with a message", () => {
      cy.visit('/');

      // shows the login form
      cy.contains("Log In");
      cy.url().should('include', 'login');

      // shows an error message
      cy.contains("Not logged in");
    });

    it("can login successfully", () => {
      cy.visit('/#/login');

      cy.get('[placeholder=Email]')
        .type('test@gmail.com');

      cy.get('[placeholder=Password]')
        .type('password');

      cy.get('button.login')
        .click();

      cy.contains("Welcome to EveryCent")
        .should('exist');
    });

    it("shows an error message if login fails", () => {
      cy.visit('/#/login');

      cy.get('[placeholder=Email]')
        .type('wrong@gmail.com');

      cy.get('[placeholder=Password]')
        .type('password');

      cy.get('button.login')
        .click();

      cy.contains("Invalid login credentials")
      cy.url().should('include', '/login');

    });

  });

  it("can login in the background", () => {
    cy.login();
    cy.visit('/#/account-balances')

    cy.contains('Account Balances')
      .should('exist');
  });
});
