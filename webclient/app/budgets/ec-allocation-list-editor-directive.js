
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

  controller.$inject = ['UtilService', 'LookupService', 'StateService', 'BudgetsService', 'ReferenceService', '$rootScope', '$timeout', 'SettingsService'];
  function controller(UtilService, LookupService, StateService, BudgetsService, ReferenceService, $rootScope, $timeout, SettingsService){
    var vm = this;
    vm.isEditMode = false;
    vm.showStandingOrders = false;
    vm.transferAccounts = [];

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
    vm.totalRemaining = totalRemaining;

    vm.transferFrom = transferFrom;
    vm.leaveBack = leaveBack;

    activate();

    function activate(){
      LookupService.refreshList('bank_accounts').then(function(bankAccounts){
        vm.bankAccounts = bankAccounts;
        _setTransferAccounts();
      });

      $rootScope.$on('budget.loaded', function(){

        // Timeout is needed to allow the vm.budget value to go through the digest cycle properly
        // and get updated to its value from the budget load, before we start assigning the allocations
        $timeout(function(){
        LookupService.refreshList('allocation_categories').then(function(allocationCategories){
          vm.allocationCategories = allocationCategories;
          vm.groupedAllocationCategories = BudgetsService.groupAllocationsByCategory(vm.budget.allocations, vm.allocationCategories);
        });
        }, 10);
      });
    }

    function _setTransferAccounts(){
      SettingsService.getSettings().then(function(settings){
        vm.primary_budget_account_id = settings.primary_budget_account_id;

        vm.transferAccounts = vm.bankAccounts.filter(function(account){
          return account.id !== vm.primary_budget_account_id &&
                 account.account_category === 'asset';
        });
      });
    }

    function transferFrom(account){
      return BudgetsService.transferFrom(account, vm.budget);
    }

    function leaveBack(account){
      return BudgetsService.leaveBack(account, vm.budget);
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

    function totalRemaining(){
      return vm.util.total(vm.budget.allocations, 'amount') - vm.util.total(vm.budget.allocations, 'spent');
    }
  }
})();
