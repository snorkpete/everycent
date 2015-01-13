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
        save: save
      };

      var baseAll = Restangular.all('budgets');
      var incomeBase = Restangular.all('incomes');
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

      function save(budget){
        return budget.save();

        // need to do different saves depending on if the income is new, deleted or existing
        budget.incomes.forEach(function(income){

          // existing income - save it
          if(income.id > 0){
            income.save();

          // deleted income - remove it
          }else if(income.deleted){
            income.remove();

          // new income - add it
          }else{
            incomeBase.post(income);
          }
        });
      }
    }
})();
