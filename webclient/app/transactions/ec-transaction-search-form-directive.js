
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecTransactionSearchForm', ecTransactionSearchForm);

  function ecTransactionSearchForm(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/transactions/ec-transaction-search-form-directive.html',
      scope: {
        search: '=searchOptions',
        onSubmit: '&'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['MessageService'];
  function controller(MessageService){
    var vm = this;

    activate();

    function activate(){
      LookupService.refreshList('bank_accounts').then(function(items){
        vm.bank_accounts = items;
      });

      LookupService.refreshList('budgets').then(function(items){
        vm.budgets = items;
      });
    }

  }
})();
