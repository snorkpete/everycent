
(function(){
  angular
    .module('everycent.budgets')
    .directive('ecAllocationTransactionList', ecAllocationTransactionList);

  function ecAllocationTransactionList(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/budgets/ec-allocation-transaction-list-directive.html',
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

    activate();

    function activate(){
    }
  }
})();
