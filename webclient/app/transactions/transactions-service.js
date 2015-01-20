(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .factory('TransactionsService', TransactionsService);

    TransactionsService.$inject = ['$http', 'Restangular', 'filterFilter'];
    function TransactionsService($http, Restangular, filterFilter){
      var service = {
      };

      var baseAll = Restangular.all('transactions');
      return service;

    }
})();
