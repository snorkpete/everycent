describe("Weekly Budgets", () => {

  before(() => {
    cy.login();
  });

  beforeEach(() => {
  })

  it("has a button in the navigation menu", () => {
    cy.visit('/');
    cy.get('mat-sidenav').as('menu');
    cy.get('@menu')
      .should("contain", "Weekly Budget");
  });

  it.only("clicking on the menu item navigates to the WeeklyBudget component", () => {
    cy.visit('/');
    cy.get('mat-sidenav').as('menu');
    cy.get('@menu')
      .contains('Weekly Budget')
      .click();

    cy.contains('weekly-budget works');
  })

})
