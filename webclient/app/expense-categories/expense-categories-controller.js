
(function(){
  'use strict';

  angular
    .module('everycent.expense-categories')
    .controller('ExpenseCategoriesCtrl', ExpenseCategoriesCtrl);

  ExpenseCategoriesCtrl.$inject = ['MessageService', 'ExpenseCategoriesService', 'ModalService', 'FormService', 'StateService'];

  function ExpenseCategoriesCtrl(MessageService, ExpenseCategoriesService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.isEditMode = false;
    vm.expenseCategories = [];

    vm.switchToEditMode = switchToEditMode;
    vm.cancelEdit = cancelEdit;
    vm.newExpenseCategory = newExpenseCategory;
    vm.saveChanges = saveChanges;
    vm.markForDeletion = markForDeletion;
    vm.percentageTotal = percentageTotal;

    activate();

    function activate(){
      refreshExpenseCategoryList();
    }

    function refreshExpenseCategoryList(){
      return ExpenseCategoriesService.getExpenseCategories().then(function(categories){
        vm.expenseCategories = categories;
      });
    }

    function switchToEditMode(){
      vm.isEditMode = true;
    }

    function cancelEdit(){
      refreshExpenseCategoryList();
      vm.isEditMode = false;
    }

    function newExpenseCategory(){
      var newCategory = ExpenseCategoriesService.newCategory();
      vm.expenseCategories.push(newCategory);
    }

    function saveChanges(){
      vm.expenseCategories.forEach(function(category){
        if(category.deleted){
          category.remove();
        }else{
          category.save();
        }
      });

      MessageService.setMessage('Changes saved.');
      refreshExpenseCategoryList().finally(function(){
        vm.isEditMode = false;
      });
    }

    function markForDeletion(category, isDeleted){
      category.deleted = isDeleted;
    }


    function percentageTotal(){
      //return 200;

      return _.reduce(vm.expenseCategories, function(sum, category){
        if(category.deleted){
          return sum;
        }else{
          return sum + category.percentage;
        }
      }, 0);
    }
  }
})();
