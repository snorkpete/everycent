
(function(){
  'use strict';

  angular
    .module('everycent.budgets')
    .controller('BudgetsCtrl', BudgetsCtrl);

  BudgetsCtrl.$inject = ['MessageService', 'BudgetsService', 'ModalService', 'FormService', 'StateService'];

  function BudgetsCtrl(MessageService, BudgetsService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.budgets = [];
    vm.addBudget = addBudget;
    vm.selectBudgetForUpdate = selectBudgetForUpdate;
    vm.copyBudget = copyBudget;

    activate();

    function activate(){
      refreshBudgetList();
    }

    function refreshBudgetList(){
      BudgetsService.getBudgets().then(function(budgets){
        vm.budgets = budgets;
      });
    }

    function addBudget(budget, form){
      BudgetsService.addBudget(budget).then(function(response){
        refreshBudgetList();
        MessageService.setMessage('Budget "' + budget.name + '" added successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(budget, form, ['start_date']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Budget not saved.');
        return false;
      });
    }

    function selectBudgetForUpdate(budget){
      vm.state.goToState('budgets-edit', { budget_id: budget.id });
    }

    function copyBudget(budget){
      var modalOptions = {
        headerText: 'Copy this budget',
        bodyText: 'Are you sure you want to copy the budget: ' + budget.name+ '?',
        confirmButtonText: 'Copy',
        cancelButtonText: 'Cancel'
      };

      ModalService.show(modalOptions).then(function(){

        BudgetsService.copyBudget(budget).then(function(response){
          refreshBudgetList();
          MessageService.setMessage('Budget copied.'); // cancel clicked
        });
      }, function(){
        MessageService.setErrorMessage('Copy cancelled.'); // cancel clicked
      });
    }

  }
})();
