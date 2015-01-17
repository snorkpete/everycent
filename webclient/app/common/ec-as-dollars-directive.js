
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecAsDollars', ecAsDollars);

  ecAsDollars.$inject = ['ecToDollarsFilter'];
  function ecAsDollars(ecToDollarsFilter){
    var directive = {
      restrict:'A',
      require:'ngModel',
      link: link
    };
    return directive;

    function link(scope, element, attrs, ngModel){

      ngModel.$formatters.push(function(modelValue){
        return ecToDollarsFilter(modelValue);
      });

      ngModel.$parsers.push(function(viewValue){
        var number = Number(viewValue);
        return number * 100;
      });
    }
  }
})();
