
(function(){
  'use strict';

  angular
    .module('everycent.sink-funds')
    .controller('SinkFundsCtrl', SinkFundsCtrl);

  SinkFundsCtrl.$inject = ['MessageService', 'SinkFundsService', 'LookupService', 'ReferenceService', 'UtilService', 'StateService'];

  function SinkFundsCtrl(MessageService, SinkFundsService, LookupService, ReferenceService, UtilService, StateService){
    var vm = this;
    vm.ref = ReferenceService;
    vm.util = UtilService;
    vm.isEditMode = false;
    vm.search = {};
    vm.sinkFund = {};
    vm.sinkFunds = [];
    vm.refreshSinkFunds = refreshSinkFunds;
    vm.selectSinkFundForUpdate = selectSinkFundForUpdate;
    vm.addNewSubAccount = addNewSubAccount;
    vm.markForDeletion = markForDeletion;
    vm.saveChanges = saveChanges;
    vm.cancelEdit = cancelEdit;
    vm.unassignedBalance = unassignedBalance;

    activate();

    function activate(){
      refreshSinkFunds().then(function(){
        _setInitialSinkFund();
      });
    }

    function _setInitialSinkFund(){

      // check if we should select a specific sink fund based on the URL
      if(StateService.is('sink-funds.edit')){
        var selectedSinkFund = vm.sinkFunds.filter(function(sinkFund){
          return Number(sinkFund.id) === Number(StateService.getParam('sink_fund_id'));
        })[0];

        vm.sinkFund = selectedSinkFund;
      }
    }

    function refreshSinkFunds(){
      return SinkFundsService.getSinkFunds().then(function(sinkFunds){
        vm.sinkFunds = sinkFunds;
      });
    }

    function selectSinkFundForUpdate(sinkFund){
      vm.sinkFund = sinkFund;
      StateService.go('sink-funds.edit', { sink_fund_id: sinkFund.id });
    }

    function saveChanges(){
      MessageService.setMessage('to implement');
    }

    function cancelEdit(){
      StateService.go('sink-funds').then(function(){
        MessageService.setErrorMessage('Edit cancelled.');
      });
    }

    function addNewSubAccount(){
      vm.sinkFunds.push({});
    }

    function switchToEditMode(){
      vm.isEditMode = true;
    }

    function markForDeletion(sinkFund, isDeleted){
      sinkFund.deleted = isDeleted;
    }

    function unassignedBalance(){
      return vm.sinkFund.current_balance - vm.util.total(vm.sinkFund.subAccounts, 'amount');
    }
  }
})();
