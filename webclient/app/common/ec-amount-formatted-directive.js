
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecAmountFormatted', ecAmountFormatted);

  ecAmountFormatted.$inject = [];
  function ecAmountFormatted(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/common/ec-amount-formatted-directive.html',
      scope: {
        amount: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };
    return directive;

    function controller(){
      /* jshint validthis: true */
      var vm = this;
    }
  }
})();
