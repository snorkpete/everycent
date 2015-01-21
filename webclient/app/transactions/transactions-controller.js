
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
    vm.refreshTransactions = refreshTransactions;
    vm.addTransaction = addTransaction;
    vm.editTransaction = editTransaction;
    vm.finishEdit = finishEdit;
    vm.saveChanges = saveChanges;
    vm.cancelEdit = cancelEdit;
    vm.markForDeletion = markForDeletion;

    activate();

    function activate(){
      LookupService.refreshList('payees').then(function(payees){
        vm.payees = payees;
      });
      refreshTransactions(vm.search);
    }

    function addTransaction(){
      //var newTransaction = TransactionsService.newTransaction();
      vm.transactions.push({ isEditMode: true });
    }

    function editTransaction(transaction){
      transaction.isEditMode = true;
    }

    function finishEdit(transaction){
      transaction.isEditMode = false;
    }

    function markForDeletion(transaction, isDeleted){
      transaction.deleted = isDeleted;
    }

    function refreshTransactions(searchOptions){
      TransactionsService.getTransactions(searchOptions).then(function(transactions){
        vm.transactions = transactions;
        vm.originalTransactions = transactions;
      });
    }

    function saveChanges(){
      TransactionsService.save(vm.transactions, vm.search).then(function(){
        refreshTransactions(vm.search);
        MessageService.setMessage('Transaction changes saved.');

      }).catch(function(){
        MessageService.setErrorMessage('Changes NOT saved.');
      });
    }

    function cancelEdit(){
      vm.transactions = vm.originalTransactions;
    }
  }
})();
