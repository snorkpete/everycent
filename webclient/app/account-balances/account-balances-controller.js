
(function(){
  'use strict';

  angular
    .module('everycent.account-balances')
    .controller('AccountBalancesCtrl', AccountBalancesCtrl);

  AccountBalancesCtrl.$inject = ['AccountBalancesService', 'UtilService', 'StateService', 'filterFilter'];

  function AccountBalancesCtrl(AccountBalancesService, UtilService, StateService, filterFilter){
    var vm = this;
    vm.bankAccounts = [];
    vm.refresh = refreshBankAccountList;
    vm.netWorth = netWorth;
    activate();

    function activate(){
      refreshBankAccountList();
    }

    function refreshBankAccountList(){
      AccountBalancesService.getAccountBalances().then(function(bankAccounts){

        vm.bankAccounts = bankAccounts;

        vm.assetAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'asset';
        });

        vm.liabilityAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'liability';
        });

      });
    }

    function netWorth(){

      var net = 0;
      vm.bankAccounts.forEach(function(bankAccount){
        net += bankAccount.current_balance;
      });

      return net;
    }
  }
})();
