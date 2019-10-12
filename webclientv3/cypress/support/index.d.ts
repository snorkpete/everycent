/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     *  Logs into the app
     */
    login();
  }
}
