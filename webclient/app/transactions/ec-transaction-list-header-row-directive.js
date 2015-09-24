
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecTransactionListHeaderRow', ecTransactionListHeaderRow);

  function ecTransactionListHeaderRow(){
    var directive = {
      restrict:'AE',
      replace: true,
      templateUrl: 'app/transactions/ec-transaction-list-header-row-directive.html',
      scope: {
        bankAccount: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = [];
  function controller(){
    var vm = this;

    activate();

    function activate(){
    }

  } // end of controller
})();


