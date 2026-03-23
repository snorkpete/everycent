describe('Settings', () => {
  const pagePath = '/v4/#/setup/settings';

  beforeEach(() => {
    cy.task('db:reset');
    cy.task<number[]>('db:seed:bankAccounts', [
      { name: 'Primary Savings', status: 'open' },
    ]);
    cy.task<number[]>('db:seed:allocationCategories', [
      { name: 'General', percentage: 0 },
    ]);
    cy.task('db:seed:settings', { family_type: 'couple' });
    cy.loginAsTestUser();
  });

  it('loads in view mode with Make Changes button', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="page-title"]').should('contain', 'General Settings');
    cy.get('[data-testid="edit-btn"]').should('be.visible');
    cy.get('[data-testid="save-btn"]').should('not.exist');
    cy.get('[data-testid="cancel-btn"]').should('not.exist');
  });

  it('switches to edit mode when Make Changes is clicked', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="edit-btn"]').click();
    cy.get('[data-testid="save-btn"]').should('be.visible');
    cy.get('[data-testid="cancel-btn"]').should('be.visible');
    cy.get('[data-testid="edit-btn"]').should('not.exist');
  });

  it('saves settings and shows a success toast', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="edit-btn"]').click();

    // EcListField always uses PrimeVue Select — click the combobox then pick the option
    cy.get('[data-testid="family-type"]').find('[role="combobox"]').click();
    cy.contains('[role="option"]', 'Single').click();

    cy.get('[data-testid="save-btn"]').click();
    cy.contains('Settings saved').should('be.visible');
    cy.get('[data-testid="edit-btn"]').should('be.visible');
  });

  it('cancels edit and reverts to view mode', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="edit-btn"]').click();
    cy.get('[data-testid="save-btn"]').should('be.visible');

    cy.get('[data-testid="cancel-btn"]').click();

    cy.get('[data-testid="edit-btn"]').should('be.visible');
    cy.get('[data-testid="save-btn"]').should('not.exist');
  });
});
