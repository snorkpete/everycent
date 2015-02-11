
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecValidateWithinBudget', ecValidateWithinBudget);

  ecValidateWithinBudget.$inject = [];
  function ecValidateWithinBudget(){
    var directive = {
      restrict:'A',
      require:'ngModel',
      link: link,
      scope:{
        budget: '=',
        transaction: '='
      }
    };
    return directive;

    function link(scope, element, attrs, ngModel){

      // do nothing if we dont have scope and transaction to work with
      if(!scope.budget || !scope.transaction){
        return;
      }

      ngModel.$validators.withinBudget = function(modelValue){

        // don't validate if the transaction is deleted
        // --------------------------------------------
        if(scope.transaction.deleted){
          return true;
        }

        return modelValue >= scope.budget.start_date && modelValue <= scope.budget.end_date;
      };
    }
  }
})();
