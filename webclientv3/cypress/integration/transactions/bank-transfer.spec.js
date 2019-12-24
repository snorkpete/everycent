describe("Bank Transfer", () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/#/transactions');
  });

  it("has a button on the screen that opens the transfer form", () => {
    cy.server();
    cy.route('/transactions', []);
    cy.contains("Make Changes")
      .click();

    cy.contains("Transfer")
      .click();

    cy.contains("Bank Account Transfer");
  });
});
