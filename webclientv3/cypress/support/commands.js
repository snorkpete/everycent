// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })


// Uses the dev-only login endpoint (needs EVERYCENT_DEV_LOGIN=true on the server)
Cypress.Commands.add('login', () => {
  cy.log("Logging into the app...");
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/auth/dev_login',
    body: {
      email: 'test@gmail.com'
    }
  })
    .then(response => {
      window.localStorage.setItem("auth-token", response.body.data.token);
    });
});
