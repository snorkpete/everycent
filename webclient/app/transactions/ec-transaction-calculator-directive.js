
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecTransactionCalculator', ecTransactionCalculator);

  function ecTransactionCalculator(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/transactions/ec-transaction-calculator-directive.html',
      scope: {
        transactions: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['UtilService'];
  function controller(UtilService){
    var vm = this;

    vm.util = UtilService;

    vm.transactionTotal = transactionTotal;
    vm.showCalculator = showCalculator;
    vm.clearSelections = clearSelections;

    activate();

    function activate(){
    }

    function transactionTotal(){
      if(!vm.transactions){
        return 0;
      }

      return vm.util.total(selectedTransactions(), 'net_amount');
    }

    function selectedTransactions(){
      if(!vm.transactions){
        return [];
      }

      return vm.transactions.filter(function(transaction){
        return transaction.selected;
      });
    }

    function showCalculator(){
      return selectedTransactions().length > 0;
    }

    function clearSelections(){
      selectedTransactions().forEach(function(transaction){
        transaction.selected = false;
      });
    }

  } // end of controller

})();
