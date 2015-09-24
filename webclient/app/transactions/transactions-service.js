(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .factory('TransactionsService', TransactionsService);

    TransactionsService.$inject = ['Restangular', 'DateService', '$modal', 'MessageService'];
    function TransactionsService(Restangular, DateService, $modal, MessageService){
      var service = {
        newTransaction: newTransaction,
        getTransactions: getTransactions,
        transactionsFor: transactionsFor,
        save: save,
        showTransactionList: showTransactionList,
        getValidTransactions: getValidTransactions,
        getDefaultAllocations: getDefaultAllocations,
        updateTransactionStatus: updateTransactionStatus,
        updateAllTransactionStatuses: updateAllTransactionStatuses,
        markForDeletion: markForDeletion,
        getLastUpdate: getLastUpdate
      };

      var baseAll = Restangular.all('transactions');
      return service;

      function newTransaction(){
        return {
          withdrawal_amount: 0,
          deposit_amount: 0
        };
      }

      function getTransactions(params){
        return baseAll.getList(params);
      }

      function transactionsFor(allocationId){
        return baseAll.customGET('by_allocation', { allocation_id: allocationId });
      }

      function save(transactions, searchOptions){

        var validTransactions = getValidTransactions(transactions, searchOptions);
        var params = {
          budget_id: searchOptions.budget_id,
          bank_account_id: searchOptions.bank_account_id,
          transactions: validTransactions
        };
        return baseAll.post(params);
      }

      function getValidTransactions(transactions, searchOptions){
        var startDate = DateService.toDate(searchOptions.budget.start_date);
        var endDate = DateService.toDate(searchOptions.budget.end_date);

        return transactions.filter(function(transaction){
          var transactionDate = DateService.toDate(transaction.transaction_date);
          return !transaction.deleted && transactionDate >= startDate && transactionDate <= endDate;
        });
      }

      function getDefaultAllocations(budgetId, payeeCodes){
        var params = {
          budget_id: budgetId,
          transactions: payeeCodes
        };
        return Restangular.all('default_allocations').customPOST(params, 'retrieve');
      }

      function showTransactionList(transactions, allocation){
        allocation = allocation || {};
        var allocationName = allocation.name || '';
        var template = '<div class="modal-header">' +
                       '     <h3>Transactions for : ' + allocationName + '</h3>' +
                       ' </div>' +
                       ' <div class="modal-body">' +
                       '    <ec-allocation-transaction-list transactions="vm.transactions">' +
                       '    </ec-allocation-transaction-list>' +
                       ' </div>' +
                       ' <div class="modal-footer">' +
                       '     <button class="btn btn-primary" ' +
                       '           ng-click="vm.options.confirm();">' +
                       '           Close' +
                       '     </button>' +
                       ' </div>';

        var modalInstance = $modal.open({
          template: template,
          backdrop:'static',
          controller: modalController,
          controllerAs: 'vm'
        });

        return modalInstance.result;

        function modalController(){
          /* jshint validthis: true */
          var vm = this;
          vm.options = {};
          vm.transactions = transactions;

          vm.options.confirm = function(){
            modalInstance.close('ok');
          };

          vm.options.cancel = function(){
            modalInstance.dismiss('cancel');
          };
        }
      }

      function updateTransactionStatus(transaction){
        if(transaction.paid){
          transaction.status = 'paid';
        }else{
          transaction.status = 'unpaid';
        }
      }

      function updateAllTransactionStatuses(transactions, paid){
        var newStatus;
        if(paid){
          newStatus = 'paid';
        }else{
          newStatus = 'unpaid';
        }

        transactions.forEach(function(transaction){
          transaction.paid = paid;
          transaction.status = newStatus;
        });
      }

      function getLastUpdate(){
        return baseAll.customGET('last_update');
      }

      function markForDeletion(transaction, search, isDeleted){
        var transactionDate = new Date(transaction.transaction_date);
        var startDate = new Date(search.budget.start_date);
        var endDate = new Date(search.budget.end_date);
        if(!isDeleted && (transactionDate < startDate || transactionDate > endDate)){

          MessageService.setErrorMessage('Transaction date not in budget range.');
          return;
        }
        transaction.deleted = isDeleted;
      }

    } // end of service

})();
