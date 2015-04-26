
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
    vm.closeBudget = closeBudget;
    vm.reopenLastBudget = reopenLastBudget;

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

    function closeBudget(budget){
      var message ='Are you sure you want to close the budget: ' + budget.name+ '?' +
         '\n Ensure that all the bank account balances are correct before continuing.';

      var modalOptions = {
        headerText: 'Close this budget',
        bodyText: message,
        confirmButtonText: 'Close',
        cancelButtonText: 'Cancel'
      };

      ModalService.show(modalOptions).then(function(){

        BudgetsService.closeBudget(budget).then(function(response){
          refreshBudgetList();
          MessageService.setMessage('Budget closed.');
        });
      }, function(){
        MessageService.setErrorMessage('Close cancelled.'); // cancel clicked
      });
    }

    function reopenLastBudget(){
      var message ='Are you sure you want to reopen the last budget?';

      var modalOptions = {
        headerText: 'Reopen Last Budget',
        bodyText: message,
        confirmButtonText: 'Reopen Last Budget',
        cancelButtonText: 'Cancel'
      };

      ModalService.show(modalOptions).then(function(){

        BudgetsService.reopenLastBudget().then(function(response){
          refreshBudgetList();
          MessageService.setMessage('Last Budget reopened.');
        });
      }, function(){
        MessageService.setErrorMessage('Reopen request cancelled.'); // cancel clicked
      });
    }

  }
})();
