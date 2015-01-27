
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

      // add decimal places back to number when field loses focus
      element.on('blur', function(e){
        var value = element.val();
        element.val(Number(value).toFixed(2));
      });

      // convert cents in model to dollar amount with 2 dp for display
      ngModel.$formatters.push(function(modelValue){
        return (modelValue / 100).toFixed(2);
      });

      // update the model with the text input value, converted from dollars to cents
      ngModel.$parsers.push(function(viewValue){
        var number = Number(viewValue);
        return number * 100;
      });
    }
  }
})();
