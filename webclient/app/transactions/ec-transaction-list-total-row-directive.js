
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecTransactionListTotalRow', ecTransactionListTotalRow);

  function ecTransactionListTotalRow(){
    var directive = {
      restrict:'AE',
      replace: true,
      templateUrl: 'app/transactions/ec-transaction-list-total-row-directive.html',
      scope: {
        transactions: '=',
        isEditMode: '=',
        search: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['UtilService', 'TransactionsService'];
  function controller(UtilService, TransactionsService){
    var vm = this;
    vm.util = UtilService;

    vm.markAllForDeletion = markAllForDeletion;
    vm.selectAllTransactions = selectAllTransactions;
    vm.updateAllTransactionStatuses = TransactionsService.updateAllTransactionStatuses;

    activate();

    function activate(){
    }


    function markAllForDeletion(transactions, isDeleted){
      transactions.forEach(function(transaction){
        TransactionsService.markForDeletion(transaction, vm.search, isDeleted);
      });
      transactions.deleted = isDeleted;
    }

    function selectAllTransactions(transactions, selected){
      transactions.forEach(function(transaction){
        transaction.selected = selected;
      });
    }

  } // end of controller
})();

