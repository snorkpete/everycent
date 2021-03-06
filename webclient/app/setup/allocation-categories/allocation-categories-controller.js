
(function(){
  'use strict';

  angular
    .module('everycent.setup.allocation-categories')
    .controller('AllocationCategoriesCtrl', AllocationCategoriesCtrl);

  AllocationCategoriesCtrl.$inject = ['UtilService', 'MessageService', 'AllocationCategoriesService', 'ModalService', 'FormService', 'StateService'];

  function AllocationCategoriesCtrl(UtilService, MessageService, AllocationCategoriesService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.util = UtilService;

    vm.isEditMode = false;
    vm.allocationCategories = [];

    vm.switchToEditMode = switchToEditMode;
    vm.cancelEdit = cancelEdit;
    vm.newAllocationCategory = newAllocationCategory;
    vm.saveChanges = saveChanges;
    vm.markForDeletion = markForDeletion;
    vm.percentageTotal = percentageTotal;

    activate();

    function activate(){
      refreshAllocationCategoryList();
    }

    function refreshAllocationCategoryList(){
      return AllocationCategoriesService.getAllocationCategories().then(function(categories){
        vm.allocationCategories = categories;
      });
    }

    function switchToEditMode(){
      vm.isEditMode = true;
    }

    function cancelEdit(){
      refreshAllocationCategoryList();
      vm.isEditMode = false;
    }

    function newAllocationCategory(){
      var newCategory = AllocationCategoriesService.newCategory();
      vm.allocationCategories.push(newCategory);
    }

    function saveChanges(){
      vm.allocationCategories.forEach(function(category){
        if(category.deleted){
          category.remove();
        }else{
          category.save();
        }
      });

      refreshAllocationCategoryList().finally(function(){
        MessageService.setMessage('Changes saved.');
        vm.isEditMode = false;
      });
    }

    function markForDeletion(category, isDeleted){
      category.deleted = isDeleted;
    }


    function percentageTotal(){
      return UtilService.total(vm.allocationCategories, 'percentage');
    }
  }
})();
