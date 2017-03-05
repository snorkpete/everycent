
(function(){
  'use strict';

  angular
    .module('everycent.account-balances')
    .factory('AccountBalancesService', AccountBalancesService);

    AccountBalancesService.$inject = ['$http', 'Restangular'];
    function AccountBalancesService($http, Restangular){
      var service = {
        getAccountBalances: getAccountBalances,
        netWorth: netWorth,
        totalAssets: totalAssets,
        totalLiabilities: totalLiabilities,
        netCurrentCash: netCurrentCash,
        netCashAssets: netCashAssets,
        netNonCashAssets: netNonCashAssets,
      };

      var baseAll = Restangular.all('account_balances');
      return service;

      function getAccountBalances(params){
        return baseAll.getList(params);
      }

      function netWorth(bankAccounts){

        var net = 0;
        bankAccounts.forEach(function(bankAccount){
          net += bankAccount.current_balance;
        });

        return net;
      }

      function totalAssets(bankAccounts){
        return bankAccounts
                  .filter(a => a.account_category == 'asset')
                  .reduce((acc, curr) => acc + curr.current_balance, 0);
      }

      function totalLiabilities(bankAccounts){
        return bankAccounts
                  .filter(a => a.account_category == 'liability')
                  .reduce((acc, curr) => acc + curr.current_balance, 0);
      }

      function netCurrentCash(bankAccounts){
        return bankAccounts
                  .filter(a => a.account_category == 'current'
                            || (a.account_category=='liability' && a.is_cash))
                  .reduce((acc, curr) => acc + curr.current_balance, 0);
      }

      function netCashAssets(bankAccounts){
        return bankAccounts
            .filter(a => a.account_category == 'asset' && a.is_cash)
            .reduce((acc, curr) => acc + curr.current_balance, 0);
      }

      function netNonCashAssets(bankAccounts){
        return bankAccounts
            .filter(a => (a.account_category == 'asset' || a.account_category == 'liability') && !a.is_cash)
            .reduce((acc, curr) => acc + curr.current_balance, 0);
      }

    }
})();
