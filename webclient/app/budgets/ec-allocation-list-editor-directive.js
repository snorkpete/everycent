
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

  controller.$inject = ['UtilService', 'LookupService', 'StateService', 'BudgetsService', 'ReferenceService', '$rootScope'];
  function controller(UtilService, LookupService, StateService, BudgetsService, ReferenceService, $rootScope){
    var vm = this;
    vm.isEditMode = false;

    vm.state = StateService;
    vm.ref = ReferenceService;
    vm.util = UtilService;

    vm.addNewAllocation = addNewAllocation;
    vm.addNewAllocationInCategory = addNewAllocationInCategory;
    vm.markForDeletion = markForDeletion;
    vm.switchToEditMode = switchToEditMode;
    vm.switchToViewMode = switchToViewMode;
    vm.cancelEdit = cancelEdit;

    vm.actualTotalForCategory = actualTotalForCategory;
    vm.actualSpentForCategory = actualSpentForCategory;
    vm.actualRemainingForCategory = actualRemainingForCategory;
    vm.recommendedTotalForCategory = recommendedTotalForCategory;
    vm.unallocatedTotalForCategory = unallocatedTotalForCategory;

    vm.totalDiscretionaryAmount = totalDiscretionaryAmount;

    activate();

    function activate(){
      LookupService.refreshList('bank_accounts').then(function(bankAccounts){
        vm.bankAccounts = bankAccounts;
      });

      $rootScope.$on('budget.loaded', function(){
        LookupService.refreshList('allocation_categories').then(function(allocationCategories){
          vm.allocationCategories = allocationCategories;
          vm.groupedAllocationCategories = BudgetsService.groupAllocationsByCategory(vm.budget.allocations, vm.allocationCategories);
        });
      });
    }

    function addNewAllocation(){
      BudgetsService.addNewAllocation(vm.budget);
    }

    function addNewAllocationInCategory(category){
      var newAllocation = BudgetsService.addNewAllocation(vm.budget);
      //newAllocation.allocation_category = category;
      newAllocation.allocation_category_id = category.id;
      category.allocations.push(newAllocation);
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

    function actualTotalForCategory(category){
      return vm.util.total(category.allocations, 'amount');
    }

    function actualSpentForCategory(category){
      return vm.util.total(category.allocations, 'spent');
    }

    function actualRemainingForCategory(category){
      return actualTotalForCategory(category) - actualSpentForCategory(category);
    }

    function recommendedTotalForCategory(category){
      var totalIncome = vm.util.total(vm.budget.incomes, 'amount');
      return totalIncome * (category.percentage / 100);
    }

    function unallocatedTotalForCategory(category){
      return recommendedTotalForCategory(category) - actualTotalForCategory(category);
    }

    function totalDiscretionaryAmount(){
      return vm.util.total(vm.budget.incomes, 'amount') - vm.util.total(vm.budget.allocations, 'amount');
    }
  }
})();
