(function(){
  'use strict';

  angular
    .module('everycent.sink-funds')
    .factory('SinkFundsService', SinkFundsService);

    SinkFundsService.$inject = ['Restangular', 'UtilService', '$http'];
    function SinkFundsService(Restangular, UtilService, $http){
      var service = {
        getSinkFunds: getSinkFunds,
        save: save,
        unassignedBalance: unassignedBalance,
        accountBalance: accountBalance,
        transferAllocation: transferAllocation,
      };

      var baseAll = Restangular.all('sink_funds');
      return service;

      function getSinkFunds(params){
        return baseAll.getList(params);
      }

      function transferAllocation(sinkFund, transferParams){
        return $http.post('sink_funds/' + sinkFund.id +'/transfer_allocation', transferParams);
      }

      function save(sinkFund, searchOptions){
        return sinkFund.save();
      }

      function unassignedBalance(sinkFund){
        return sinkFund.current_balance - UtilService.total(sinkFund.sink_fund_allocations, 'current_balance');
      }

      function accountBalance(sinkFund){
        return UtilService.total(sinkFund.sink_fund_allocations, 'remaining') +
               unassignedBalance(sinkFund);
      }
    }
})();
