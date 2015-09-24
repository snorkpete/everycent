
(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .controller('CreditCardTransactionsCtrl', CreditCardTransactionsCtrl);

  CreditCardTransactionsCtrl.$inject = ['MessageService', 'TransactionsService', 'LookupService', 'StateService'];

  function CreditCardTransactionsCtrl(MessageService, TransactionsService, LookupService, StateService){
    var vm = this;
    vm.search = {};

    vm.refreshTransactions = refreshTransactions;

    activate();

    function activate(){
    }

    function refreshAllocations(){
      // TODO: there are multiple budgets in a given credit card view
      // So, need to load and store these multiple budget allocations
      // and then assign the correct allocation list
      // using the transaction's transaction date to determine the budget to use
      LookupService.clear();
      return LookupService.refreshList('allocations', {budget_id: vm.search.budget_id}, true).then(function(allocations){
        vm.allocations = allocations;

        // add a blank allocation at the top of the list
        vm.allocations.unshift({ id: 0, name: '(none)' });
      });
    }

    function refreshTransactions(){
      //refreshAllocations();

      return TransactionsService.getCreditCardTransactions(vm.search.bank_account_id)
                                .then(function(transactions){
        vm.transactions = transactions;
      });
    }

  } // end controller
})();
