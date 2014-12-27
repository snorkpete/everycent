
(function(){
  'use strict';

  angular
    .module('everycent.bank-accounts')
    .controller('BankAccountsCtrl', BankAccountsCtrl);

  BankAccountsCtrl.$inject = ['MessageService', 'BankAccountsService', 'ModalService', 'FormService', 'StateService'];

  function BankAccountsCtrl(MessageService, BankAccountsService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.bankAccount = {};
    vm.bankAccounts = [];
    vm.addBankAccount = addBankAccount;
    vm.selectBankAccountForUpdate = selectBankAccountForUpdate;
    vm.updateBankAccount = updateBankAccount;
    vm.cancelEdit = cancelEdit;
    vm.deleteBankAccount = deleteBankAccount;

    activate();

    function activate(){
      refreshBankAccountList();
    }

    function refreshBankAccountList(){
      BankAccountsService.getBankAccounts().then(function(bankAccounts){
        vm.bankAccounts = bankAccounts;
      });
    }

    function addBankAccount(bankAccount, form){
      BankAccountsService.addBankAccount(bankAccount).then(function(response){
        refreshBankAccountList();
        MessageService.setMessage('Bank Account "' + bankAccount.name + '" added successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(bankAccount, form, 
          ['name', 'account_type', 'account_no', 'opening_balance']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Bank Account not saved.');
        return false;
      });
    }

    function selectBankAccountForUpdate(bankAccount){
      vm.bankAccount = bankAccount;
      StateService.goToState('bank-accounts.edit');
    }

    function updateBankAccount(bankAccount, form){
      bankAccount.save().then(function(response){
        refreshBankAccountList();
        MessageService.setMessage('Bank Account "' + bankAccount.name + '" updated successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(bankAccount, form, ['name']);
        vm.bankAccount = {};
        StateService.goToState('bank-accounts');

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Bank Account not updated.');
        return false;
      });
    }

    function cancelEdit(){
      vm.bankAccount = {};
      refreshBankAccountList();
      StateService.goToState('bank-accounts');
    }

    function deleteBankAccount(bankAccount){
      var modalOptions = {
        headerText: 'Delete this Bank Account?',
        bodyText: 'Are you sure you want to delete the Bank Account: ' + bankAccount.name+ '?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }

      ModalService.show(modalOptions).then(function(){

        bankAccount.remove().then(function(){
          refreshBankAccountList();
          MessageService.setMessage('Bank Account deleted.');

        }).catch(function(){
          MessageService.setErrorMessage('Error deleting.');
        });

      },function(){
        MessageService.setErrorMessage('Delete cancelled.'); // cancel clicked
      });

    }
  }
})();
