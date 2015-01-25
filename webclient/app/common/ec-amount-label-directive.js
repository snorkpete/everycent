
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecAmountLabel', ecAmountLabel);

  ecAmountLabel.$inject = [];
  function ecAmountLabel(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/common/ec-amount-label-directive.html',
      scope: {
        type: '@',
        label: '@',
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
      vm.labelClasses = labelClasses;

      function labelClasses(){
        var result = {};
        result['label-' + vm.type] = vm.amount >= 0;
        result['label-danger'] = vm.amount < 0;

        return result;
      }
    }
  }
})();
