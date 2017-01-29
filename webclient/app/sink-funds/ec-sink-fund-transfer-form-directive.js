(function(){
  angular
    .module('everycent.sink-funds')
    .directive('ecSinkFundTransferForm', ecSinkFundTransferForm);

  function ecSinkFundTransferForm(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/sink-funds/ec-sink-fund-transfer-form-directive.html',
      scope: {
        sinkFund: '=',
        onSave: '&',
        onCancel: '&'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['UtilService', 'SinkFundsService'];
  function controller(UtilService, SinkFundsService){
    var vm = this;

    vm.transfer = { amount: 0};
    vm.allocations = [];
    vm.util = UtilService;
    vm.transferAllocation = transferAllocation;
    vm.cancelEdit = cancelEdit;

    activate();

    function activate(){
    }

    function transferAllocation(transfer, transferForm){
      SinkFundsService.transferAllocation(vm.sinkFund, transfer).then(function(result){
        vm.onSave();
      });
      console.log(transfer);
    }

    function cancelEdit(){
      console.log('implement cance');
      vm.onCancel();
    }

  } // end of controller

})();
