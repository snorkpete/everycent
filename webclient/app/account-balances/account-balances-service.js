
(function(){
  'use strict';

  angular
    .module('everycent.account-balances')
    .factory('AccountBalancesService', AccountBalancesService);

    AccountBalancesService.$inject = ['$http', 'Restangular'];
    function AccountBalancesService($http, Restangular){
      var service = {
        getAccountBalances: getAccountBalances
      };

      var baseAll = Restangular.all('account_balances');
      return service;

      function getAccountBalances(){
        return baseAll.getList();
      }
    }
})();
