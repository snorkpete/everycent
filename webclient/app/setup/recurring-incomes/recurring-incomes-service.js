(function(){
  'use strict';

  angular
    .module('everycent.setup.recurring-incomes')
    .factory('RecurringIncomesService', RecurringIncomesService);

    RecurringIncomesService.$inject = ['$http', 'Restangular'];
    function RecurringIncomesService($http, Restangular){
      var service = {
        getRecurringIncomes: getRecurringIncomes,
        addRecurringIncome: addRecurringIncome
      }

      var baseAll = Restangular.all('recurring_incomes');
      return service;

      function getRecurringIncomes(){
        return baseAll.getList();
      }

      function addRecurringIncome(recurringIncome){
        return baseAll.post(recurringIncome);
      }
    }
})();
