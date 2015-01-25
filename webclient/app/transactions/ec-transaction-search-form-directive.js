
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

  controller.$inject = ['LookupService', 'ReferenceService', '$q'];
  function controller(LookupService, ReferenceService, $q){
    var vm = this;
    vm.ref = ReferenceService;

    activate();

    function activate(){
      var accountPromise =LookupService.refreshList('bank_accounts').then(function(items){
        vm.bank_accounts = items;
      });

      var budgetPromise =LookupService.refreshList('budgets').then(function(items){
        vm.budgets = items;
      });

      //TODO to remove
      $q.all([accountPromise, budgetPromise]).then(function(){
        vm.search.bank_account = vm.bank_accounts[0];
        vm.search.bank_account_id = vm.bank_accounts[0].id;
        vm.search.budget = vm.budgets[0];
        vm.search.budget_id = vm.budgets[0].id;
        vm.onSubmit();
      });
    }
  }
})();
