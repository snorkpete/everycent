
(function(){
  'use strict';

  angular
    .module('everycent.account-statuses')
    .controller('AccountStatusesCtrl', AccountStatusesCtrl);

  AccountStatusesCtrl.$inject = ['AccountStatusesService', 'StateService'];

  function AccountStatusesCtrl(AccountStatusesService, StateService){
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
      AccountStatusesService.getAccountStatuses().then(function(bankAccounts){
        vm.bankAccounts = bankAccounts;
      });
    }
  }
})();
