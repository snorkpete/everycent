describe('Allocation Categories', () => {
  const pagePath = '/v4/#/setup/allocation-categories';

  beforeEach(() => {
    cy.task('db:reset');
    cy.task('db:seed:allocationCategories', [
      { name: 'Food', percentage: 20 },
      { name: 'Housing', percentage: 30 },
    ]);
    cy.loginAsTestUser();
  });

  it('shows all seeded categories', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="page-title"]').should('contain', 'Allocation Categories');
    cy.contains('Food').should('be.visible');
    cy.contains('Housing').should('be.visible');
  });

  it('opens the dialog in edit mode when Add Allocation Category is clicked', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="add-btn"]').click();
    cy.get('.p-dialog').should('be.visible');
    cy.get('[data-testid="save-btn"]').should('be.visible');
    cy.get('[data-testid="cancel-btn"]').should('be.visible');
  });

  it('adds a new category and shows it in the list', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="add-btn"]').click();
    cy.get('.p-dialog').should('be.visible');

    cy.contains('.p-dialog label', 'Name').invoke('attr', 'for').then((id) => {
      cy.get(`#${id}`).clear().type('Transport');
    });

    cy.get('[data-testid="save-btn"]').click();

    cy.contains('Allocation category saved').should('be.visible');
    cy.contains('Transport').should('be.visible');
  });

  it('opens the dialog in view mode when Edit is clicked', () => {
    cy.visitAuthenticated(pagePath);
    cy.contains('li', 'Food').find('[data-testid^="edit-btn-"]').click();
    cy.get('.p-dialog').should('be.visible');
    cy.get('[data-testid="edit-btn"]').should('be.visible');
    cy.get('[data-testid="close-btn"]').should('be.visible');
  });
});
