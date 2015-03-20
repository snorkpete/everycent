
(function(){
  'use strict';

  angular
    .module('everycent.account-balances')
    .controller('AccountBalancesCtrl', AccountBalancesCtrl);

  AccountBalancesCtrl.$inject = ['AccountBalancesService', 'StateService'];

  function AccountBalancesCtrl(AccountBalancesService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.bankAccount = {};
    vm.bankAccounts = [];
    vm.refresh = refreshBankAccountList;
    activate();

    function activate(){
      refreshBankAccountList();
    }

    function refreshBankAccountList(){
      AccountBalancesService.getAccountBalances().then(function(bankAccounts){
        vm.bankAccounts = bankAccounts;
      });
    }
  }
})();
