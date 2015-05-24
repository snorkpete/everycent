(function(){
  'use strict';

  angular
    .module('everycent.budgets')
    .factory('BudgetsService', BudgetsService);

    BudgetsService.$inject = ['$http', 'Restangular', 'filterFilter', 'UtilService'];
    function BudgetsService($http, Restangular, filterFilter, UtilService){
      var service = {
        getBudgets: getBudgets,
        getBudget: getBudget,
        getCurrentBudget: getCurrentBudget,
        addBudget: addBudget,
        copyBudget: copyBudget,
        closeBudget: closeBudget,
        reopenLastBudget: reopenLastBudget,
        addNewIncome: addNewIncome,
        addNewAllocation: addNewAllocation,
        groupAllocationsByCategory: groupAllocationsByCategory,
        save: save,
        transferFrom: transferFrom,
        leaveBack: leaveBack
      };

      var baseAll = Restangular.all('budgets');
      return service;

      function getBudgets(){
        return baseAll.getList();
      }

      function getBudget(budgetId){
        return Restangular.one('budgets', budgetId).get();
      }

      function getCurrentBudget(){
         return $http({method: 'GET', url: '/budgets/current'}).then(function (response){
           return response.data.budget_id;
         }).then(function(currentBudgetId){
           return getBudget(currentBudgetId);
         });
      }

      function addBudget(budget){
        return baseAll.post(budget);
      }

      function copyBudget(budget){
        return budget.customPUT(null, 'copy');
      }

      function closeBudget(budget){
        return budget.customPUT(null, 'close');
      }

      function reopenLastBudget(){
        return baseAll.customPOST({}, 'reopen_last_budget');
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
          category.allocations = filterFilter(allocations, function(allocation, index){
            return allocation.allocation_category_id === category.id;
          });
        });
        return allocationCategories;
      }

      function save(budget){
        return budget.save();
      }

      function _accountIncomeTotal(account, budget){
        var accountIncomes = budget.incomes.filter(function(income){
          return account.id === income.bank_account_id;
        });

        return UtilService.total(accountIncomes, 'amount');
      }

      function transferFrom(account, budget){
        var accountIncomeAmount = _accountIncomeTotal(account, budget);

        if(accountIncomeAmount === 0){
          return 0;
        }

        var standingOrders = budget.allocations.filter(function(allocation){
          return account.id === allocation.bank_account_id;
        });

        var discretionaryAmount = ( UtilService.total(budget.incomes, 'amount') -
                                    UtilService.total(budget.allocations, 'amount') )/2;
        return accountIncomeAmount - UtilService.total(standingOrders, 'amount') - discretionaryAmount;
      }

      function leaveBack(account, budget){
        return account.closing_balance + _accountIncomeTotal(account, budget) - transferFrom(account, budget);
      }
    }
})();
