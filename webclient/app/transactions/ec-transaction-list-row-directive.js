
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecTransactionListRow', ecTransactionListRow);

  function ecTransactionListRow(){
    var directive = {
      restrict:'AE',
      replace: true,
      templateUrl: 'app/transactions/ec-transaction-list-row-directive.html',
      scope: {
        transaction: '=',
        isEditMode: '=',
        transactionForm: '=',
        search: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['MessageService', 'ReferenceService', 'TransactionsService'];
  function controller(MessageService, ReferenceService, TransactionsService){

    var vm = this;
    vm.ref = ReferenceService;

    vm.markForDeletion = markForDeletion;
    vm.checkTransactionDate = checkTransactionDate;
    vm.updateTransactionStatus = TransactionsService.updateTransactionStatus;
    vm.onAllocationChange = onAllocationChange;

    activate();

    function activate(){
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

    function checkTransactionDate(transaction, budget){
      var transactionDate = new Date(transaction.transaction_date);
      var startDate = new Date(vm.search.budget.start_date);
      var endDate = new Date(vm.search.budget.end_date);

      transaction.transaction_date_invalid = (transactionDate < startDate && transactionDate > endDate);
      transaction.deleted = transaction.transaction_date_invalid;
    }


    function onAllocationChange(transaction){
      vm.ref.updateReferenceId(transaction, 'allocation');

      // user selected an allocation
      if(transaction.allocation && transaction.allocation.id !== 0){
        transaction.paid = true;
      }else{
        transaction.paid = false;
      }

      vm.updateTransactionStatus(transaction);
    }


  } // end of controller
})();

