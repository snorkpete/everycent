
(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .controller('TransactionsCtrl', TransactionsCtrl);

  TransactionsCtrl.$inject = ['MessageService', 'TransactionsService', 'LookupService', 'ReferenceService'];

  function TransactionsCtrl(MessageService, TransactionsService, LookupService, ReferenceService){
    var vm = this;
    vm.ref = ReferenceService;
    vm.search = {};
    vm.search = { budget_id: 1, bank_account_id: 1};
    vm.refreshTransactions = refreshTransactions;
    vm.refreshAllocations = refreshAllocations;
    vm.switchToEditMode = switchToEditMode;
    vm.addTransaction = addTransaction;
    vm.saveChanges = saveChanges;
    vm.cancelEdit = cancelEdit;
    vm.markForDeletion = markForDeletion;

    activate();

    function activate(){
      refreshTransactions();
    }

    function refreshAllocations(){
      return LookupService.refreshList('allocations', {budget_id: vm.search.budget_id}).then(function(allocations){
        vm.allocations = allocations;
      });
    }

    function switchToEditMode(){
      vm.isEditMode = true;
    }

    function addTransaction(){
      newTransaction = TransactionsService.newTransaction();
      vm.transactions.push(newTransaction);
    }

    function markForDeletion(transaction, isDeleted){
      transaction.deleted = isDeleted;
    }

    function refreshTransactions(){
      refreshAllocations();
      return TransactionsService.getTransactions(vm.search).then(function(transactions){
        vm.transactions = transactions;
        vm.originalTransactions = transactions;
      });
    }

    function saveChanges(){
      TransactionsService.save(vm.transactions, vm.search).then(function(){
        return refreshTransactions();
      })
      .then(function(){
        MessageService.setMessage('Transaction changes saved.');
        vm.isEditMode = false;
      })
      .catch(function(){
        MessageService.setErrorMessage('Changes NOT saved.');
      });
    }

    function cancelEdit(){
      vm.transactions = vm.originalTransactions;
      vm.isEditMode = false;
    }
  }
})();
