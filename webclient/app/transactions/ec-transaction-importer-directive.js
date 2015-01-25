
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecTransactionImporter', ecTransactionImporter);

  function ecTransactionImporter(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/transactions/ec-transaction-importer-directive.html',
      controller: controller,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        transactions: '=',
        startDate:'=',
        endDate:'='
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
      vm.input = '';
      vm.originalTransactions = angular.copy(vm.transactions);
    }

    function cancelImport(){
      vm.showForm = false;
      vm.input = '';
    }

    function convertToTransactions(input){
      var newTransactions = TransactionsService.convertToTransactions(input, vm.startDate, vm.endDate);
      vm.transactions = vm.transactions.concat(newTransactions);
      vm.showForm = false;
    }
  }
})();
