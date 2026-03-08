describe('Authentication', () => {
  const loginPath = '/v4/#/login';
  const homePath = '/v4/#/';

  beforeEach(() => {
    cy.task('db:reset');
  });

  it('shows the login page when unauthenticated', () => {
    cy.visit(loginPath);
    cy.get('[data-testid="login-heading"]').should('contain', 'EveryCent');
    cy.get('[data-testid="login-form"]').should('be.visible');
  });

  it('logs in with valid credentials and redirects to home', () => {
    cy.visit(loginPath);
    cy.get('[data-testid="email-input"]').type(Cypress.env('testUser').email);
    // PrimeVue Password wraps the real <input> — target the descendant input directly
    cy.get('[data-testid="password-input"] input').type(
      Cypress.env('testUser').password,
    );
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', homePath).and('not.include', 'login');
    cy.get('[data-testid="welcome-heading"]').should('be.visible');
  });

  it('shows an error message with invalid credentials', () => {
    cy.visit(loginPath);
    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"] input').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.url().should('include', loginPath);
  });

  it('logs out and redirects to login', () => {
    cy.loginAsTestUser();
    cy.visitAuthenticated(homePath);
    cy.get('[data-testid="welcome-heading"]').should('be.visible');

    // Click Log Out in the sidebar menu
    cy.contains('Log Out').click();
    cy.url().should('include', loginPath);
    cy.get('[data-testid="login-form"]').should('be.visible');
  });

  it('redirects unauthenticated access to a protected route to login', () => {
    cy.visit('/v4/#/setup/bank-accounts');
    cy.url().should('include', loginPath);
  });
});
