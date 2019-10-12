/// <reference types="Cypress" />

  describe('My First Test', () => {

  it('Does not do much', () => {
    cy.visit("http://localhost:4200");
    cy.contains('Not logged in');
    // cy.contains('Email')
  })
})
