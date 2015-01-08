
(function(){
  'use strict';

  angular
    .module('everycent.setup.recurring-incomes')
    .controller('RecurringIncomesCtrl', RecurringIncomesCtrl);

  RecurringIncomesCtrl.$inject = ['MessageService', 'RecurringIncomesService', 'ModalService', 'FormService', 'StateService'];

  function RecurringIncomesCtrl(MessageService, RecurringIncomesService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.recurringIncome = {};
    vm.recurringIncomes = [];
    vm.addRecurringIncome = addRecurringIncome;
    vm.selectRecurringIncomeForUpdate = selectRecurringIncomeForUpdate;
    vm.updateRecurringIncome = updateRecurringIncome;
    vm.cancelEdit = cancelEdit;
    vm.deleteRecurringIncome = deleteRecurringIncome;

    activate();

    function activate(){
      refreshRecurringIncomeList();
    }

    function refreshRecurringIncomeList(){
      RecurringIncomesService.getRecurringIncomes().then(function(recurringIncomes){
        vm.recurringIncomes = recurringIncomes;
      });
    }

    function addRecurringIncome(recurringIncome, form){
      RecurringIncomesService.addRecurringIncome(recurringIncome).then(function(response){
        refreshRecurringIncomeList();
        MessageService.setMessage('Recurring Income "' + recurringIncome.name + '" added successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(recurringIncome, form,
          ['name', 'amount', 'bank_account_id']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Recurring Income not saved.');
        return false;
      });
    }

    function selectRecurringIncomeForUpdate(recurringIncome){
      vm.recurringIncome = recurringIncome;
      StateService.goToState('recurring-incomes.edit');
    }

    function updateRecurringIncome(recurringIncome, form){
      recurringIncome.save().then(function(response){
        refreshRecurringIncomeList();
        MessageService.setMessage('Recurring Income "' + recurringIncome.name + '" updated successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(recurringIncome, form, ['name', 'account_type', 'institution_id', 'account_no', 'opening_balance' ]);
        vm.recurringIncome = {};
        StateService.goToState('recurring-incomes');

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Recurring Income not updated.');
        return false;
      });
    }

    function cancelEdit(){
      vm.recurringIncome = {};
      refreshRecurringIncomeList();
      StateService.goToState('recurring-incomes');
    }

    function deleteRecurringIncome(recurringIncome){
      var modalOptions = {
        headerText: 'Delete this Recurring Income?',
        bodyText: 'Are you sure you want to delete the Recurring Income: ' + recurringIncome.name+ '?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      };

      ModalService.show(modalOptions).then(function(){

        recurringIncome.remove().then(function(){
          refreshRecurringIncomeList();
          MessageService.setMessage('Recurring Income deleted.');

        }).catch(function(){
          MessageService.setErrorMessage('Error deleting.');
        });

      },function(){
        MessageService.setErrorMessage('Delete cancelled.'); // cancel clicked
      });

    }
  }
})();
