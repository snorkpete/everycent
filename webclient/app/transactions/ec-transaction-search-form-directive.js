
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
        mode: '@',
        onSubmit: '&'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['LookupService', 'ReferenceService', '$q', 'StateService', '$location'];
  function controller(LookupService, ReferenceService, $q, StateService, $location){
    var vm = this;
    vm.ref = ReferenceService;

    vm.onParamChange = onParamChange;
    vm.isCreditCardMode = isCreditCardMode;

    activate();

    function activate(){
      var accountPromise =LookupService.refreshList('bank_accounts').then(function(items){
        vm.bank_accounts = items;

        if(isCreditCardMode()){
          vm.bank_accounts = vm.bank_accounts.filter(function(bankAccount){
            return bankAccount.is_credit_card;
          });
        }
      });

      var budgetPromise =LookupService.refreshList('budgets').then(function(items){
        vm.budgets = items;
      });

      //TODO to remove
      $q.all([accountPromise, budgetPromise]).then(function(){
        setInitialSearchParams();
        vm.onSubmit();
      });
    }

    function isCreditCardMode(){
      return vm.mode === 'credit-card';
    }

    function setInitialSearchParams(){

      var initialBankAccount = getInitialBankAccount();
      vm.search.bank_account = initialBankAccount;
      vm.search.bank_account_id = initialBankAccount.id;

      var initialBudget = getInitialBudget();
      vm.search.budget = initialBudget;
      vm.search.budget_id = initialBudget.id;
    }

    function getInitialBankAccount(){
      var searchParamsBankAccount = vm.bank_accounts.filter(function(account){
        return Number(account.id) === Number(StateService.getParam('bank_account'));
      })[0];

      if(searchParamsBankAccount){
        return searchParamsBankAccount;
      }else{
        return vm.bank_accounts[0];
      }
    }

    function getInitialBudget(){
      var searchParamsBudget = vm.budgets.filter(function(budget){
        return Number(budget.id) === Number(StateService.getParam('budget'));
      })[0];

      if(searchParamsBudget){
        return searchParamsBudget;
      }else{
        return vm.budgets[0];
      }
    }

    function onParamChange(param){
      vm.ref.updateReferenceId(vm.search, param);

      // IMPORTANT: note that this bypasses $stateParams,
      // so when doing this, the state params will NOT be up to date
      // unless the user refreshes their browser
      $location.search({budget: vm.search.budget_id, bank_account: vm.search.bank_account_id});
      vm.onSubmit();
    }
  }
})();
