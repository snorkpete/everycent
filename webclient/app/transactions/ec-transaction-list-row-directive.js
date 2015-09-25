
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
        search: '=',
        allocations: '=',
        creditCardHighlights: '@',
        sinkFundAllocations: '='
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
    vm.getRowClass = getRowClass;

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

    function getRowClass(transaction){
      var bgClass = '';
      var textClass = '';

      var result = {};

      if(transaction.deleted){
        result.danger = true;
      }

      if(!vm.transaction.paid){
        result['text-danger'] = true;
      }
      
      // no more classes necessary if credit card highlights not required
      if(vm.creditCardHighlights !== 'on'){
        return result;
      }

      result['bg-warning'] = isTransactionBetween(transaction, 
                              vm.search.bank_account.previous_period_statement_start,
                              vm.search.bank_account.previous_period_statement_end);

      result['bg-info'] = isTransactionBetween(transaction, 
                              vm.search.bank_account.current_period_statement_start,
                              vm.search.bank_account.current_period_statement_end);

      return result;
    }

    function isTransactionBetween(transaction, start, end){
      var startDate = new Date(start);
      var endDate = new Date(end);
      var transactionDate = new Date(transaction.transaction_date);
      
      return (startDate <= transactionDate && transactionDate <= endDate);
    }

  } // end of controller
})();

