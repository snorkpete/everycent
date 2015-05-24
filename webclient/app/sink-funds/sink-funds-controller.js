
(function(){
  'use strict';

  angular
    .module('everycent.sink-funds')
    .controller('SinkFundsCtrl', SinkFundsCtrl);

  SinkFundsCtrl.$inject = ['MessageService', 'SinkFundsService', 'LookupService', 'ReferenceService', 'UtilService', 'StateService'];

  function SinkFundsCtrl(MessageService, SinkFundsService, LookupService, ReferenceService, UtilService, StateService){
    var vm = this;
    vm.ref = ReferenceService;
    vm.state = StateService;
    vm.util = UtilService;
    vm.isEditMode = false;
    vm.search = {};
    vm.sinkFund = {};
    vm.sinkFunds = [];
    vm.searchParams = {};
    vm.switchToEditMode = switchToEditMode;
    vm.refreshSinkFunds = refreshSinkFunds;
    vm.selectSinkFundForUpdate = selectSinkFundForUpdate;
    vm.addNewSinkFundAllocation = addNewSinkFundAllocation;
    vm.markForDeletion = markForDeletion;
    vm.saveChanges = saveChanges;
    vm.cancelEdit = cancelEdit;
    vm.unassignedBalance = unassignedBalance;
    vm.canSave = canSave;

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
      vm.sinkFund.sink_fund_allocations = vm.sinkFund.sink_fund_allocations || [];
    }

    function refreshSinkFunds(){
      return SinkFundsService.getSinkFunds(vm.searchParams).then(function(sinkFunds){
        vm.sinkFunds = sinkFunds;
      });
    }

    function selectSinkFundForUpdate(sinkFund){
      vm.sinkFund = sinkFund;
      StateService.go('sink-funds.edit', { sink_fund_id: sinkFund.id });
    }

    function saveChanges(){
      SinkFundsService.save(vm.sinkFund).then(function(){
        refreshSinkFunds().then(function(){
          _setInitialSinkFund();
          MessageService.setMessage('Sink fund saved.');
          switchToViewMode();
        });
      },
      // error handler
      function(){
        MessageService.setErrorMessage('Sink fund NOT saved.');
      });
    }

    function cancelEdit(){
      refreshSinkFunds().then(function(){
        _setInitialSinkFund();
        MessageService.setErrorMessage('Edit cancelled.');
        switchToViewMode();
      });
    }

    function addNewSinkFundAllocation(){
      vm.sinkFund.sink_fund_allocations.push({ amount: 0 });
    }

    function switchToViewMode(){
      vm.isEditMode = false;
    }

    function switchToEditMode(){
      vm.isEditMode = true;
    }

    function markForDeletion(sinkFund, isDeleted){
      sinkFund.deleted = isDeleted;
    }

    function unassignedBalance(){
      return vm.sinkFund.current_balance -
            (vm.util.total(vm.sinkFund.sink_fund_allocations, 'amount') - vm.util.total(vm.sinkFund.sink_fund_allocations, 'spent'));
    }

    function canSave(){
      return unassignedBalance() >= 0;
    }
  }
})();
