
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
    vm.totalAssets = AccountBalancesService.totalAssets;
    vm.totalLiabilities = AccountBalancesService.totalLiabilities;
    vm.netCurrentCash = AccountBalancesService.netCurrentCash;
    vm.netCashAssets = AccountBalancesService.netCashAssets;
    vm.netNonCashAssets = AccountBalancesService.netNonCashAssets;

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
        vm.cashAssetAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'asset' && bankAccount.is_cash;
        });
        vm.nonCashAssetAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'asset' && !bankAccount.is_cash;
        });
        vm.liabilityAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'liability';
        });
        vm.creditCardAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'liability' && bankAccount.is_cash;
        });
        vm.loanAccounts = filterFilter(bankAccounts, function(bankAccount, index){
          return bankAccount.account_category === 'liability' && !bankAccount.is_cash;
        });

      });
    }

  }
})();
