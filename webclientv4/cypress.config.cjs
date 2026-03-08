const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on) {
      const { dbTasks } = require('./cypress/support/db.cjs');
      on('task', dbTasks);
    },
  },
  env: {
    apiUrl: 'http://localhost:3000',
    testUser: { email: 'cypress@test.com', password: 'CypressTest123!' },
  },
});
