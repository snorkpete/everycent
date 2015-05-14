(function(){
  'use strict';

  angular
    .module('everycent.sink-funds')
    .factory('SinkFundsService', SinkFundsService);

    SinkFundsService.$inject = ['Restangular', 'DateService', '$modal', '$document'];
    function SinkFundsService(Restangular, DateService, $modal, $document){
      var service = {
        getSinkFunds: getSinkFunds,
        save: save
      };

      var baseAll = Restangular.all('sink_funds');
      return service;

      function getSinkFunds(params){
        return baseAll.getList(params);
      }

      function save(sinkFund, searchOptions){
        var validSinkFundAllocations = sinkFund.sink_fund_allocations.filter(function(sinkFundAllocation){
          return !sinkFundAllocation.deleted;
        });
        sinkFund.sink_fund_allocations = validSinkFundAllocations;
        return sinkFund.save();
      }
    }
})();
