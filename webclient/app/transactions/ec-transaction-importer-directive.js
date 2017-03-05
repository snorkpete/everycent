
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
        bankAccount: '=',
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
      if(vm.bankAccount && vm.bankAccount.is_credit_card){
        vm.importType = 'credit-card';
      }else{
        vm.importType = 'bank-account';
      }

      var newTransactions = TransactionImporterService.convertToTransactions(input, vm.startDate, vm.endDate, vm.importType);
      vm.transactions = vm.transactions.concat(newTransactions);
      vm.showForm = false;
    }
  }
})();
