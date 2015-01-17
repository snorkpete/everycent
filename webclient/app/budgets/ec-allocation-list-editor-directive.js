
(function(){
  angular
    .module('everycent.budgets')
    .directive('ecAllocationListEditor', ecAllocationListEditor);

  function ecAllocationListEditor(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/budgets/ec-allocation-list-editor-directive.html',
      scope: {
        budget: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['UtilService', 'LookupService', 'StateService', 'BudgetsService', 'ReferenceService'];
  function controller(UtilService, LookupService, StateService, BudgetsService, ReferenceService){
    var vm = this;
    vm.isEditMode = false;

    vm.state = StateService;
    vm.ref = ReferenceService;
    vm.util = UtilService;

    vm.addNewAllocation = addNewAllocation;
    vm.markForDeletion = markForDeletion;
    vm.switchToEditMode = switchToEditMode;
    vm.switchToViewMode = switchToViewMode;
    vm.cancelEdit = cancelEdit;

    activate();

    function activate(){
      LookupService.refreshList('bank_accounts').then(function(bankAccounts){
        vm.bankAccounts = bankAccounts;
      });

      LookupService.refreshList('allocation_categories').then(function(allocationCategories){
        vm.allocationCategories = allocationCategories;
      });
    }

    function addNewAllocation(){
      BudgetsService.addNewAllocation(vm.budget);
    }

    function markForDeletion(allocation, isDeleted){
      allocation.deleted = isDeleted;
    }

    function switchToEditMode(){
      vm.originalAllocations = angular.copy(vm.budget.allocations);
      vm.isEditMode = true;
    }

    function switchToViewMode(){
      vm.isEditMode = false;
    }

    function cancelEdit(){
      vm.budget.allocations = vm.originalAllocations;
      vm.isEditMode = false;
    }

  }
})();