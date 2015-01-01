
(function(){
  'use strict';

  angular
    .module('everycent.setup.recurring-allocations')
    .controller('RecurringAllocationsCtrl', RecurringAllocationsCtrl);

  RecurringAllocationsCtrl.$inject = ['MessageService', 'RecurringAllocationsService', 'ModalService', 'FormService', 'StateService'];

  function RecurringAllocationsCtrl(MessageService, RecurringAllocationsService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.recurringAllocation = {};
    vm.recurringAllocations = [];
    vm.addRecurringAllocation = addRecurringAllocation;
    vm.selectRecurringAllocationForUpdate = selectRecurringAllocationForUpdate;
    vm.updateRecurringAllocation = updateRecurringAllocation;
    vm.cancelEdit = cancelEdit;
    vm.deleteRecurringAllocation = deleteRecurringAllocation;

    activate();

    function activate(){
      refreshRecurringAllocationList();
    }

    function refreshRecurringAllocationList(){
      RecurringAllocationsService.getRecurringAllocations().then(function(recurringAllocations){
        vm.recurringAllocations = recurringAllocations;
      });
    }

    function addRecurringAllocation(recurringAllocation, form){
      RecurringAllocationsService.addRecurringAllocation(recurringAllocation).then(function(response){
        refreshRecurringAllocationList();
        MessageService.setMessage('Recurring Allocation "' + recurringAllocation.name + '" added successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(recurringAllocation, form,
          ['name', 'amount', 'bank_account_id']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Recurring Allocation not saved.');
        return false;
      });
    }

    function selectRecurringAllocationForUpdate(recurringAllocation){
      vm.recurringAllocation = recurringAllocation;
      StateService.goToState('recurring-allocations.edit');
    }

    function updateRecurringAllocation(recurringAllocation, form){
      recurringAllocation.save().then(function(response){
        refreshRecurringAllocationList();
        MessageService.setMessage('Recurring Allocation "' + recurringAllocation.name + '" updated successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(recurringAllocation, form, ['name', 'account_type', 'institution_id', 'account_no', 'opening_balance' ]);
        vm.recurringAllocation = {};
        StateService.goToState('recurring-allocations');

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Recurring Allocation not updated.');
        return false;
      });
    }

    function cancelEdit(){
      vm.recurringAllocation = {};
      refreshRecurringAllocationList();
      StateService.goToState('recurring-allocations');
    }

    function deleteRecurringAllocation(recurringAllocation){
      var modalOptions = {
        headerText: 'Delete this Recurring Allocation?',
        bodyText: 'Are you sure you want to delete the Recurring Allocation: ' + recurringAllocation.name+ '?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }

      ModalService.show(modalOptions).then(function(){

        recurringAllocation.remove().then(function(){
          refreshRecurringAllocationList();
          MessageService.setMessage('Recurring Allocation deleted.');

        }).catch(function(){
          MessageService.setErrorMessage('Error deleting.');
        });

      },function(){
        MessageService.setErrorMessage('Delete cancelled.'); // cancel clicked
      });

    }
  }
})();
