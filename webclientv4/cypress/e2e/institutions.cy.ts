describe('Institutions', () => {
  const pagePath = '/v4/#/setup/institutions';

  beforeEach(() => {
    cy.task('db:reset');
    cy.task('db:seed:institutions', [
      { name: 'First National Bank' },
      { name: 'Credit Union' },
    ]);
    cy.loginAsTestUser();
  });

  it('shows all seeded institutions', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="page-title"]').should('contain', 'Financial Institutions');
    cy.contains('First National Bank').should('be.visible');
    cy.contains('Credit Union').should('be.visible');
  });

  it('opens the dialog in edit mode when Add Institution is clicked', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="add-btn"]').click();
    cy.get('.p-dialog').should('be.visible');
    cy.get('[data-testid="save-btn"]').should('be.visible');
    cy.get('[data-testid="cancel-btn"]').should('be.visible');
  });

  it('adds a new institution and shows it in the list', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="add-btn"]').click();
    cy.get('.p-dialog').should('be.visible');

    cy.contains('.p-dialog label', 'Name').invoke('attr', 'for').then((id) => {
      cy.get(`#${id}`).type('Republic Bank');
    });

    cy.get('[data-testid="save-btn"]').click();

    cy.contains('Institution saved').should('be.visible');
    cy.contains('Republic Bank').should('be.visible');
  });

  it('opens the dialog in view mode when View is clicked', () => {
    cy.visitAuthenticated(pagePath);
    cy.contains('li', 'First National Bank').find('[data-testid^="view-btn-"]').click();
    cy.get('.p-dialog').should('be.visible');
    cy.get('[data-testid="edit-btn"]').should('be.visible');
    cy.get('[data-testid="close-btn"]').should('be.visible');
  });
});
