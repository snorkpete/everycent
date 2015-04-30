
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
    vm.search = {};
    vm.sinkFunds = [];
    vm.refreshSinkFunds = refreshSinkFunds;

    activate();

    function activate(){
      refreshSinkFunds();
    }

    function refreshSinkFunds(){
      SinkFundsService.getSinkFunds().then(function(sinkFunds){
        vm.sinkFunds = sinkFunds;
      });
    }

  }
})();
