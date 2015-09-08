
(function(){
  'use strict';

  angular
    .module('everycent.account-balances')
    .factory('AccountBalancesService', AccountBalancesService);

    AccountBalancesService.$inject = ['$http', 'Restangular'];
    function AccountBalancesService($http, Restangular){
      var service = {
        getAccountBalances: getAccountBalances,
        netWorth: netWorth
      };

      var baseAll = Restangular.all('account_balances');
      return service;

      function getAccountBalances(params){
        return baseAll.getList(params);
      }

      function netWorth(bankAccounts){

        var net = 0;
        bankAccounts.forEach(function(bankAccount){

          // do not include current accounts in the net worth calculation
          // ------------------------------------------------------------
          if(bankAccount.account_category !== 'current'){
            net += bankAccount.current_balance;
          }
        });

        return net;
      }
    }
})();
