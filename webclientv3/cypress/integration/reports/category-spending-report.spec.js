describe("Category Spending Report", () => {
  beforeEach(() => {
    cy.login();
  })

  it("is an option in the menu", () => {
    cy.visit("/");
    cy.get('mat-sidenav').as('menu')
      .contains("Reports")
      .click();

    cy.get('@menu')
      .contains("Category Spending Report")
      .click();

    cy.get('mat-toolbar').as('heading')

    cy.get('@heading')
      .contains("Category Spending")

  });
});
