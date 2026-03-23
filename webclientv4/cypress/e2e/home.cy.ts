describe('Home Page', () => {
  beforeEach(() => {
    cy.task('db:reset');
    cy.loginAsTestUser();
  });

  it('loads the home page when authenticated', () => {
    cy.visitAuthenticated('/v4/#/');
    cy.get('[data-testid="welcome-heading"]').should(
      'contain',
      'Welcome to EveryCent',
    );
    cy.get('[data-testid="welcome-message"]').should('be.visible');
    cy.get('[data-testid="page-title"]').should('contain', 'Home');
  });
});
