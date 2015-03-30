
(function(){
  'use strict';

  angular
    .module('everycent.account-balances')
    .directive('ecAccountBalanceList', ecAccountBalanceList);

  function ecAccountBalanceList(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/account-balances/ec-account-balance-list-directive.html',
      scope: {
        bankAccounts: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    controller.$inject = ['UtilService'];
    return directive;

    function controller(UtilService){
      /* jshint validthis: true */
      var vm = this;
      vm.util = UtilService;
      vm.bankAccounts = [];
    }
  }
})();
