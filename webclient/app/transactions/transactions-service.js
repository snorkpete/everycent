(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .factory('TransactionsService', TransactionsService);

    TransactionsService.$inject = ['Restangular', 'DateService', '$modal', '$document'];
    function TransactionsService(Restangular, DateService, $modal, $document){
      var service = {
        newTransaction: newTransaction,
        getTransactions: getTransactions,
        transactionsFor: transactionsFor,
        save: save,
        showTransactionList: showTransactionList,
        getDefaultAllocations: getDefaultAllocations
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
        var startDate = new Date(searchOptions.budget.start_date);
        var endDate = new Date(searchOptions.budget.end_date);

        var validTransactions = transactions.filter(function(transaction){
          var transactionDate = new Date(transaction.transaction_date);
          return !transaction.deleted && transactionDate >= startDate && transactionDate <= endDate;
        });

        var params = {
          budget_id: searchOptions.budget_id,
          bank_account_id: searchOptions.bank_account_id,
          transactions: validTransactions
        };
        return baseAll.post(params);
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
          modalFix();

          vm.options.confirm = function(){
            modalInstance.close('ok');
          };

          vm.options.cancel = function(){
            modalInstance.dismiss('cancel');
          };
        }

        /** TODO: this is a temporary fix for a bootstrap 3.1.1 issue
         * Should be removed once that issue is fixed */
        function modalFix(){
          setTimeout(function(){
            angular.element($document[0].querySelectorAll('div.modal-backdrop'))
                 .css('height','1000px');
                }, 100);
        }

      }
    }

})();
