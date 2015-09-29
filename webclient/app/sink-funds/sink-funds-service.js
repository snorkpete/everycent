(function(){
  'use strict';

  angular
    .module('everycent.sink-funds')
    .factory('SinkFundsService', SinkFundsService);

    SinkFundsService.$inject = ['Restangular', 'UtilService'];
    function SinkFundsService(Restangular, UtilService){
      var service = {
        getSinkFunds: getSinkFunds,
        save: save,
        unassignedBalance: unassignedBalance,
        accountBalance: accountBalance
      };

      var baseAll = Restangular.all('sink_funds');
      return service;

      function getSinkFunds(params){
        return baseAll.getList(params);
      }

      function save(sinkFund, searchOptions){
        return sinkFund.save();
      }

      function unassignedBalance(sinkFund){
        return sinkFund.current_balance -
              (UtilService.total(sinkFund.sink_fund_allocations, 'amount') - 
               UtilService.total(sinkFund.sink_fund_allocations, 'spent'));
      }

      function accountBalance(sinkFund){
        return UtilService.total(sinkFund.sink_fund_allocations, 'remaining') +
               unassignedBalance(sinkFund);
      }
    }
})();
