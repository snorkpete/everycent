
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
    vm.searchParams = {};
    vm.netWorth = AccountBalancesService.netWorth;
    activate();

    function activate(){
      refreshBankAccountList();
    }

    function refreshBankAccountList(){
      AccountBalancesService.getAccountBalances(vm.searchParams).then(function(bankAccounts){

        vm.bankAccounts = bankAccounts;
        vm.currentAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'current';
        });
        vm.assetAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'asset';
        });
        vm.liabilityAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'liability';
        });

      });
    }

  }
})();
