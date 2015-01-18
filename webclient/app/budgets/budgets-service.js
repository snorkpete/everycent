(function(){
  'use strict';

  angular
    .module('everycent.budgets')
    .factory('BudgetsService', BudgetsService);

    BudgetsService.$inject = ['$http', 'Restangular', 'filterFilter'];
    function BudgetsService($http, Restangular, filterFilter){
      var service = {
        getBudgets: getBudgets,
        getBudget: getBudget,
        addBudget: addBudget,
        addNewIncome: addNewIncome,
        addNewAllocation: addNewAllocation,
        groupAllocationsByCategory: groupAllocationsByCategory,
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
        return newAllocation;
      }

      function groupAllocationsByCategory(allocations, allocationCategories){
        allocationCategories.forEach(function(category){
          category.allocations = filterFilter(allocations, { allocation_category_id: category.id });
        });
        return allocationCategories;
      }

      function save(budget){
        return budget.save();
      }
    }
})();
