describe('Bank Accounts', () => {
  const pagePath = '/v4/#/setup/bank-accounts';
  let institutionId: number;

  beforeEach(() => {
    cy.task('db:reset');
    cy.task<number[]>('db:seed:institutions', [{ name: 'Test Bank' }]).then(
      (ids) => {
        institutionId = ids[0];
        cy.task('db:seed:bankAccounts', [
          {
            name: 'Savings Account',
            status: 'open',
            institution_id: institutionId,
          },
          {
            name: 'Old Account',
            status: 'closed',
            institution_id: institutionId,
          },
        ]);
      },
    );
    cy.loginAsTestUser();
  });

  it('shows open accounts and hides closed accounts by default', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="page-title"]').should('contain', 'Setup Bank Accounts');
    cy.contains('Savings Account').should('be.visible');
    cy.contains('Old Account').should('not.exist');
  });

  it('shows closed accounts when the toggle is enabled', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="show-closed-toggle"]').click();
    cy.contains('Savings Account').should('be.visible');
    cy.contains('Old Account').should('be.visible');
    cy.get('[data-testid="closed-tag"]').should('be.visible');
  });

  it('opens the dialog in edit mode when Add Bank Account is clicked', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="add-btn"]').click();
    cy.get('.p-dialog').should('be.visible');
    cy.get('.p-dialog').contains('Bank Account Details');
    // Dialog should be in edit mode (Save/Cancel buttons visible)
    cy.get('[data-testid="save-btn"]').should('be.visible');
    cy.get('[data-testid="cancel-btn"]').should('be.visible');
  });

  it('adds a new bank account and shows it in the list', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="add-btn"]').click();
    cy.get('.p-dialog').should('be.visible');

    // Find the Name field by its label to avoid positional fragility
    cy.contains('.p-dialog label', 'Name').invoke('attr', 'for').then((id) => {
      cy.get(`#${id}`).type('New Checking');
    });

    cy.get('[data-testid="save-btn"]').click();

    cy.contains('Bank account saved').should('be.visible');
    cy.contains('New Checking').should('be.visible');
  });

  it('opens the dialog in view mode when View is clicked', () => {
    cy.visitAuthenticated(pagePath);
    // Use the dynamic data-testid pattern (view-btn-{id}) with prefix match
    cy.contains('li', 'Savings Account').find('[data-testid^="view-btn-"]').click();
    cy.get('.p-dialog').should('be.visible');
    // In view mode, Make Changes button should be visible
    cy.get('.p-dialog').contains('Make Changes').should('be.visible');
  });
});
