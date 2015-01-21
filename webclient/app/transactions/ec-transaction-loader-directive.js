
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecTransactionLoader', ecTransactionLoader);

  function ecTransactionLoader(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/transactions/ec-transaction-loader-directive.html',
      controller: controller,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        transactions: '='
      }
    };

    return directive;
  }

  controller.$inject = ['TransactionsService'];
  function controller(TransactionsService){
    var vm = this;
    vm.showForm = false;
    vm.startImport = startImport;
    vm.cancelImport = cancelImport;
    vm.convertToTransactions = convertToTransactions;

    function startImport(){
      vm.showForm = true;
      vm.originalTransactions = angular.copy(vm.transactions);
    }

    function cancelImport(){
      vm.showForm = false;
      vm.transactions = vm.originalTransactions;
    }

    function convertToTransactions(input){
      var newTransactions = TransactionsService.convertToTransactions(input);
      vm.transactions = vm.transactions.concat(newTransactions);
    }
  }
})();
