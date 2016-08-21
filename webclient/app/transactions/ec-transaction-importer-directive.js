
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

  controller.$inject = ['TransactionImporterService'];
  function controller(TransactionImporterService){
    var vm = this;
    vm.importType = 'new-bank-account';
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
      var newTransactions = TransactionImporterService.convertToTransactions(input, vm.startDate, vm.endDate, vm.importType);
      vm.transactions = vm.transactions.concat(newTransactions);
      vm.showForm = false;
    }
  }
})();
