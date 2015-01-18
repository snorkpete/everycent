
(function(){
  angular
    .module('everycent.budgets')
    .directive('ecAllocationListRow', ecAllocationListRow);

  function ecAllocationListRow(){
    var directive = {
      restrict:'AE',
      replace: true,
      templateUrl: 'app/budgets/ec-allocation-list-row-directive.html',
      scope: {
        allocation: '=',
        isEditMode: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['LookupService', 'ReferenceService'];
  function controller(LookupService, ReferenceService){
    var vm = this;

    vm.ref = ReferenceService;
    vm.markForDeletion = markForDeletion;

    activate();

    function activate(){
      LookupService.refreshList('bank_accounts').then(function(bankAccounts){
        vm.bankAccounts = bankAccounts;
      });

      LookupService.refreshList('allocation_categories').then(function(allocationCategories){
        vm.allocationCategories = allocationCategories;
      });
    }

    function markForDeletion(allocation, isDeleted){
      allocation.deleted = isDeleted;
    }
  }
})();
