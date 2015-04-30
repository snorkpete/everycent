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

      function save(sinkFunds, searchOptions){

        var params = {
          bank_account_id: searchOptions.bank_account_id,
          sinkFunds: sinkFunds
        };
        return baseAll.post(params);
      }

    }

})();
