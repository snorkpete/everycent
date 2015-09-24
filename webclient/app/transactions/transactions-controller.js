
(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .controller('TransactionsCtrl', TransactionsCtrl);

  TransactionsCtrl.$inject = ['MessageService', 'TransactionsService', 'LookupService', 'StateService'];

  function TransactionsCtrl(MessageService, TransactionsService, LookupService, StateService){
    var vm = this;
    vm.search = {};

    vm.refreshTransactions = refreshTransactions;
    vm.goToBudget = goToBudget;
    vm.goToSinkFund = goToSinkFund;

    activate();

    function activate(){
    }

    function refreshAllocations(){
      LookupService.clear();
      return LookupService.refreshList('allocations', {budget_id: vm.search.budget_id}, true).then(function(allocations){
        vm.allocations = allocations;

        // add a blank allocation at the top of the list
        vm.allocations.unshift({ id: 0, name: '(none)' });
      });
    }

    function refreshSinkFundAllocations(){
      LookupService.clear();
      return LookupService.refreshList('sink_fund_allocations', {bank_account_id: vm.search.bank_account_id}, true).then(function(sinkFundAllocations){
        vm.sinkFundAllocations = sinkFundAllocations;

        // add a blank allocation at the top of the list
        vm.sinkFundAllocations.unshift({ id: 0, name: '(none)' });
      });
    }


    function refreshTransactions(){
      refreshAllocations();
      refreshSinkFundAllocations();

      var params = {
        bank_account_id: vm.search.bank_account_id,
        budget_id: vm.search.budget_id
      };
      return TransactionsService.getTransactions(params).then(function(transactions){
        vm.transactions = transactions;
      });
    }


    function goToBudget(){
      StateService.go('budgets-edit', {budget_id: vm.search.budget_id});
    }

    function goToSinkFund(){
      StateService.go('sink-funds');
    }



  } // end controller
})();
