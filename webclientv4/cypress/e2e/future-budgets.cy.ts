describe('Future Budgets', () => {
  const pagePath = '/v4/#/budgets/future';
  let aprilId: number;
  let mayId: number;

  beforeEach(() => {
    cy.task('db:reset');
    cy.task('db:seed:settings', { family_type: 'couple', husband: 'Alex', wife: 'Sam' });

    // Budget.future returns all open budgets ordered by start_date with no date filter,
    // so past dates like April/May 2025 still appear. If the scope ever adds a
    // start_date >= today condition these seeds would need to use relative dates.
    cy.task<number[]>('db:seed:budgets', [
      { name: 'April 2025', start_date: '2025-04-01', end_date: '2025-04-30', status: 'open' },
      { name: 'May 2025', start_date: '2025-05-01', end_date: '2025-05-31', status: 'open' },
    ]).then((budgetIds) => {
      aprilId = budgetIds[0];
      mayId = budgetIds[1];

      // incomes and allocationCategories are independent; allocations depend on both
      cy.task('db:seed:incomes', [
        { name: 'Salary', amount: 500000, budget_id: aprilId },
        { name: 'Salary', amount: 520000, budget_id: mayId },
      ]);

      cy.task<number[]>('db:seed:allocationCategories', [{ name: 'Housing' }]).then((catIds) => {
        cy.task('db:seed:allocations', [
          { name: 'Rent', amount: 150000, budget_id: aprilId, allocation_category_id: catIds[0] },
          { name: 'Rent', amount: 150000, budget_id: mayId, allocation_category_id: catIds[0] },
        ]);
      });
    });

    cy.loginAsTestUser();
  });

  it('shows budget column headers', () => {
    cy.visitAuthenticated(pagePath);
    cy.contains('th', 'April 2025').should('be.visible');
    cy.contains('th', 'May 2025').should('be.visible');
  });

  it('shows income rows with amounts', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="incomes-section-header"]').should('be.visible');
    cy.get('[data-testid="income-row"]').should('have.length', 1);
    cy.get('[data-testid="income-row"]').contains('Salary');
    cy.get('[data-testid="income-row"]').contains('5,000.00');
    cy.get('[data-testid="income-row"]').contains('5,200.00');
  });

  it('shows allocation rows grouped under their category', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="allocations-section-header"]').should('be.visible');
    cy.contains('[data-testid^="category-header-"]', 'Housing').should('be.visible');
    cy.get('[data-testid="allocation-row"]').should('have.length', 1);
    cy.get('[data-testid="allocation-row"]').contains('Rent');
    cy.get('[data-testid="allocation-row"]').contains('1,500.00');
  });

  it('shows correct totals in the Total Income, Total Allocations, and Total Discretionary rows', () => {
    cy.visitAuthenticated(pagePath);

    cy.get('[data-testid="total-income-row"]').contains('5,000.00');
    cy.get('[data-testid="total-income-row"]').contains('5,200.00');

    cy.get('[data-testid="total-allocations-row"]').contains('1,500.00');

    // Discretionary = Income - Allocations: $5,000 - $1,500 = $3,500 for April
    cy.get('[data-testid="total-discretionary-row"]').contains('3,500.00');
    // $5,200 - $1,500 = $3,700 for May
    cy.get('[data-testid="total-discretionary-row"]').contains('3,700.00');
  });

  it('shows per-person discretionary rows for a couple', () => {
    cy.visitAuthenticated(pagePath);
    // Each person gets half of each budget's discretionary:
    // April: $3,500 / 2 = $1,750; May: $3,700 / 2 = $1,850
    cy.get('[data-testid="husband-row"]').contains("Alex's Amount").should('be.visible');
    cy.get('[data-testid="husband-row"]').contains('1,750.00');
    cy.get('[data-testid="husband-row"]').contains('1,850.00');
    cy.get('[data-testid="wife-row"]').contains("Sam's Amount").should('be.visible');
    cy.get('[data-testid="wife-row"]').contains('1,750.00');
    cy.get('[data-testid="wife-row"]').contains('1,850.00');
  });

  it('opens the income mass-edit dialog with pre-filled amounts when an income row is clicked', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="edit-income-Salary"]').click();

    cy.get('.p-dialog').should('be.visible');
    cy.get('.p-dialog .p-dialog-title').should('contain', 'Salary');
    cy.get('[data-testid="name-input"]').should('have.value', 'Salary');
    cy.get('[data-testid="amount-input-0"] input').should('have.value', '5,000.00');
    cy.get('[data-testid="amount-input-1"] input').should('have.value', '5,200.00');
  });

  it('opens the allocation mass-edit dialog with income and discretionary info rows', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="edit-allocation-Rent"]').click();

    cy.get('.p-dialog').should('be.visible');
    cy.get('.p-dialog .p-dialog-title').should('contain', 'Rent');
    // Info rows are visible for allocations
    cy.get('.p-dialog').contains('Total Income').should('be.visible');
    cy.get('.p-dialog').contains('Already Allocated').should('be.visible');
    cy.get('.p-dialog').contains('Discretionary Amount').should('be.visible');
    // April: income $5,000 - $0 other allocations - $1,500 rent = $3,500 discretionary
    cy.get('[data-testid="discretionary-display-0"] .money-display').should('contain', '3,500.00');
    // May: income $5,200 - $0 other allocations - $1,500 rent = $3,700 discretionary
    cy.get('[data-testid="discretionary-display-1"] .money-display').should('contain', '3,700.00');
  });

  it('updates the discretionary amount live as a new allocation amount is typed', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="edit-allocation-Rent"]').click();

    cy.get('.p-dialog').should('be.visible');
    // Verify the pre-type state: April Rent = $1,500; discretionary = $5,000 - $0 - $1,500 = $3,500
    cy.get('[data-testid="amount-input-0"] input').should('have.value', '1,500.00');
    cy.get('[data-testid="discretionary-display-0"] .money-display').should('contain', '3,500.00');

    // Change the April Rent amount to $2,000
    cy.get('[data-testid="amount-input-0"] input').type('{selectall}2000');

    // Discretionary should update live: $5,000 - $0 - $2,000 = $3,000
    cy.get('[data-testid="discretionary-display-0"] .money-display').should('contain', '3,000.00');
  });

  it('saves income changes and reflects the updated amount in the table', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="edit-income-Salary"]').click();

    cy.get('[data-testid="amount-input-0"] input').type('{selectall}6000');
    cy.get('[data-testid="save-btn"]').click();

    cy.contains('Changes saved').should('be.visible');
    cy.get('.p-dialog').should('not.exist');
    cy.get('[data-testid="income-row"]').contains('6,000.00');
    cy.get('[data-testid="total-income-row"]').contains('6,000.00');
  });

  it('saves allocation changes and reflects the updated amount in the table', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="edit-allocation-Rent"]').click();

    cy.get('[data-testid="amount-input-0"] input').type('{selectall}2000');
    cy.get('[data-testid="save-btn"]').click();

    cy.contains('Changes saved').should('be.visible');
    cy.get('.p-dialog').should('not.exist');
    cy.get('[data-testid="allocation-row"]').contains('2,000.00');
  });

  it('opens a blank dialog with empty amounts when Add New Income is clicked', () => {
    cy.visitAuthenticated(pagePath);
    // Wait for data to load — add-income-btn is always in the DOM so Cypress can click
    // it before the API call completes, leaving store.budgets empty and the dialog
    // showing no amount columns. Wait for an income row to confirm data is loaded.
    cy.get('[data-testid="income-row"]').should('have.length.gte', 1);
    cy.get('[data-testid="add-income-btn"]').click();

    cy.get('.p-dialog').should('be.visible');
    cy.get('[data-testid="name-input"]').should('have.value', 'New Income');
    cy.get('[data-testid="amount-input-0"] input').should('have.value', '0.00');
    cy.get('[data-testid="amount-input-1"] input').should('have.value', '0.00');
  });

  it('refreshes the page data when the Refresh button is clicked', () => {
    cy.visitAuthenticated(pagePath);
    cy.get('[data-testid="income-row"]').should('have.length', 1);

    // Add a second income directly to the DB while the page is already loaded
    cy.task('db:seed:incomes', [{ name: 'Bonus', amount: 100000, budget_id: aprilId }]);

    // The page has not refreshed yet — Bonus should not be visible
    cy.get('[data-testid="income-row"]').should('have.length', 1);

    cy.get('[data-testid="refresh-btn"]').click();

    // After refresh the new income should appear
    cy.get('[data-testid="income-row"]').should('have.length', 2);
    cy.contains('[data-testid="income-row"]', 'Bonus').should('be.visible');
  });
});
