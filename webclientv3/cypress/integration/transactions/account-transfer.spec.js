describe("Account Transfer", () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/#/transactions');
  });

  it("has a button opens the transfer form", () => {
    cy.server();
    cy.route('http://localhost:3000/transactions', []);
    cy.contains("Make Changes")
      .click();

    cy.contains("Transfer")
      .click();

    cy.contains("Bank Account Transfer");
  });

  describe("the form", () => {
    beforeEach(() => {
      const sampleAccounts = [
        { id: 2, name: 'First Account', is_sink_fund: false },
        { id: 4, name: 'Second Account', is_sink_fund: false },
      ];
      cy.server();
      cy.route('http://localhost:3000/bank_accounts?', sampleAccounts).as('bankAccounts');

      cy.contains("Make Changes")
        .click();

      cy.contains("Transfer")
        .click();

      cy.get('ec-transfer-form').as('transferForm');
    });

    it("has all the appropriate fields", () => {

      // let's let the bank accounts load
      cy.wait('@bankAccounts');

      cy.get('@transferForm')
        .get('[data-cy-from-field]')
        .as('fromField')
        .click();

      // TODO: how to check for this within the dropdown itself?
      cy.contains('First Account');
      // clear the dropdown
      cy.get('@fromField').type('{ESC}');

      // cy.get('[data-cy-to-field]')
      //   .as('toField')
      //   .click();
      //
      // cy.contains('First Account');
      // cy.contains('Second Account');
      // cy.get('@toField').type('{ESC}'); // clear the dropdown
      //

      cy.get('@transferForm').get('[data-cy-description-field]');
      cy.get('@transferForm').get('[data-cy-amount-field]');
    });

    it.only("shows an error if we enter invalid data", () => {
      cy.get("@transferForm")
        .contains("Save")
        .click();

      cy.contains("Error:")
    });
  });

});
