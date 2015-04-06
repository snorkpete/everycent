
(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .controller('TransactionsCtrl', TransactionsCtrl);

  TransactionsCtrl.$inject = ['MessageService', 'TransactionsService', 'LookupService', 'ReferenceService', 'UtilService', 'StateService'];

  function TransactionsCtrl(MessageService, TransactionsService, LookupService, ReferenceService, UtilService, StateService){
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
    vm.goToBudget = goToBudget;
    vm.defaultAllocations = defaultAllocations;

    activate();

    function activate(){
    }

    function refreshAllocations(){
      LookupService.clear();
      return LookupService.refreshList('allocations', {budget_id: vm.search.budget_id}, true).then(function(allocations){
        vm.allocations = allocations;

        // add a blank allocation at the top of the list
        vm.allocations.unshift({ id: 0, name: '(none)' })
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

    function goToBudget(){
      StateService.go('budgets-edit', {budget_id: vm.search.budget_id});
    }

    function defaultAllocations(){
      var transactions = vm.transactions;
      var payeeCodes = vm.transactions.map(function(transaction){

        // use the bank charges payee for the $0.75 and $4.00 fees
        if(transaction.withdrawal_amount == 75 || transaction.withdrawal_amount == 400){
          return { code: 'BANKCHARGES' };
        }
        return { code: transaction.payee_code };
      });

      TransactionsService.getDefaultAllocations(vm.search.budget_id, payeeCodes).then(function(defaultAllocations){
        // first convert the allocations to a hash
        var allocationMap = {};
        vm.allocations.forEach(function(allocation){
          allocationMap[allocation.id] = allocation;
        });

        var startDate = new Date(vm.search.budget.start_date);
        var endDate = new Date(vm.search.budget.end_date);
        var validTransactions = vm.transactions.filter(function(transaction){
          var transactionDate = new Date(transaction.transaction_date);
          return !transaction.deleted && transactionDate >= startDate && transactionDate <= endDate;
        });

        for(var i=0; i < vm.transactions.length; i++){
          var allocationId = defaultAllocations[i].allocation_id;
          validTransactions[i].allocation = allocationMap[allocationId];
          validTransactions[i].allocation_id = allocationId;
        }

      });
    }
  }
})();
