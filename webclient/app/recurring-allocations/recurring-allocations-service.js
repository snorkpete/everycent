(function(){
  'use strict';

  angular
    .module('everycent.recurring-allocations')
    .factory('RecurringAllocationsService', RecurringAllocationsService);

    RecurringAllocationsService.$inject = ['$http', 'Restangular'];
    function RecurringAllocationsService($http, Restangular){
      var service = {
        getRecurringAllocations: getRecurringAllocations,
        addRecurringAllocation: addRecurringAllocation
      }

      var baseAll = Restangular.all('recurring_allocations');
      return service;

      function getRecurringAllocations(){
        return baseAll.getList();
      }

      function addRecurringAllocation(recurringAllocation){
        return baseAll.post(recurringAllocation);
      }
    }
})();
