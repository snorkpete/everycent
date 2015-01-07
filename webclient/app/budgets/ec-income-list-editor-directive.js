
(function(){
  angular
    .module('everycent.budgets')
    .directive('ecIncomeListEditor', ecIncomeListEditor);

  function ecIncomeListEditor(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/budgets/ec-income-list-editor-directive.html',
      scope: {
        budget: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['UtilService', 'LookupService', 'StateService', 'BudgetsService'];
  function controller(UtilService, LookupService, StateService, BudgetsService){
    var vm = this;
    vm.isEditMode = false;

    vm.state = StateService;
    vm.util = UtilService;

    vm.addNewIncome = addNewIncome;
    vm.markForDeletion = markForDeletion;
    vm.switchToEditMode = switchToEditMode;
    vm.switchToViewMode = switchToViewMode;
    vm.cancelEdit = cancelEdit;

    activate();

    function activate(){
      LookupService.refreshList('bank_accounts').then(function(bankAccounts){
        vm.bankAccounts = bankAccounts;
      });
    }

    function addNewIncome(){
      BudgetsService.addNewIncome(vm.budget);
    }

    function markForDeletion(income, isDeleted){
      income.deleted = isDeleted;
    }

    function switchToEditMode(){
      vm.originalIncomes = angular.copy(vm.budget.incomes);
      vm.isEditMode = true;
    }

    function switchToViewMode(){
      vm.isEditMode = false;
    }

    function cancelEdit(){
      vm.budget.incomes = vm.originalIncomes;
      vm.isEditMode = false;
    }

  }
})();
