
(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .controller('TransactionsCtrl', TransactionsCtrl);

  TransactionsCtrl.$inject = ['MessageService', 'TransactionsService', 'LookupService', 'ReferenceService', 'UtilService'];

  function TransactionsCtrl(MessageService, TransactionsService, LookupService, ReferenceService, UtilService){
    var vm = this;
    vm.ref = ReferenceService;
    vm.util = UtilService;
    vm.search = {};

    vm.refreshTransactions = refreshTransactions;
    vm.refreshAllocations = refreshAllocations;
    vm.switchToEditMode = switchToEditMode;
    vm.addTransaction = addTransaction;
    vm.saveChanges = saveChanges;
    vm.cancelEdit = cancelEdit;
    vm.markForDeletion = markForDeletion;
    vm.markAllForDeletion = markAllForDeletion;
    vm.checkTransactionDate = checkTransactionDate;

    activate();

    function activate(){
      refreshTransactions();
    }

    function refreshAllocations(){
      LookupService.clear();
      return LookupService.refreshList('allocations', {budget_id: vm.search.budget_id}, true).then(function(allocations){
        vm.allocations = allocations;
      });
    }

    function switchToEditMode(){
      vm.isEditMode = true;
    }

    function addTransaction(){
      var newTransaction = TransactionsService.newTransaction();
      vm.transactions.push(newTransaction);
    }

    function markForDeletion(transaction, isDeleted){
      var transactionDate = new Date(transaction.transaction_date);
      var startDate = new Date(vm.search.budget.start_date);
      var endDate = new Date(vm.search.budget.end_date);
      if(!isDeleted && (transactionDate < startDate || transactionDate > endDate)){

        MessageService.setErrorMessage('Transaction date not in budget range.');
        return;
      }
      transaction.deleted = isDeleted;
    }

    function markAllForDeletion(transactions, isDeleted){
      transactions.forEach(function(transaction){
        markForDeletion(transaction, isDeleted);
      });
      transactions.deleted = isDeleted;
    }

    function refreshTransactions(){
      refreshAllocations();

      var params = {
        bank_account_id: vm.search.bank_account_id,
        budget_id: vm.search.budget_id
      };
      return TransactionsService.getTransactions(params).then(function(transactions){
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

    function checkTransactionDate(transaction, budget){
      var transactionDate = new Date(transaction.transaction_date);
      var startDate = new Date(vm.search.budget.start_date);
      var endDate = new Date(vm.search.budget.end_date);

      transaction.transaction_date_invalid = (transactionDate < startDate && transactionDate > endDate);
      transaction.deleted = transaction.transaction_date_invalid;
    }
  }
})();
