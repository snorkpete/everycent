(function(){
  'use strict';

  angular
    .module('everycent.budgets')
    .factory('BudgetsService', BudgetsService);

    BudgetsService.$inject = ['$http', 'Restangular'];
    function BudgetsService($http, Restangular){
      var service = {
        getBudgets: getBudgets,
        getBudget: getBudget,
        addBudget: addBudget,
        addNewIncome: addNewIncome,
        addNewAllocation: addNewAllocation,
        save: save
      };

      var baseAll = Restangular.all('budgets');
      return service;

      function getBudgets(){
        return baseAll.getList();
      }

      function getBudget(budgetId){
        return Restangular.one('budgets', budgetId).get();
      }

      function addBudget(budget){
        return baseAll.post(budget);
      }

      function addNewIncome(budget){
        var newIncome = {
          id: '',
          name: '',
          amount: '',
          budget_id: budget.id,
          bank_account_id: ''
        };
        budget.incomes.push(newIncome);
      }

      function addNewAllocation(budget){
        var newAllocation = {
          id: '',
          name: '',
          amount: '',
          budget_id: budget.id,
          bank_account_id: ''
        };
        budget.allocations.push(newAllocation);
      }
      function save(budget){
        return budget.save();
      }
    }
})();
