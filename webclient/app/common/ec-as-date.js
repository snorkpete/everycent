
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecAsDate', ecAsDate);

  ecAsDate.$inject = [];
  function ecAsDate(){
    var directive = {
      restrict:'A',
      require:'ngModel',
      link: link
    };
    return directive;

    function link(scope, element, attrs, ngModel){

      ngModel.$formatters.push(function(modelValue){
        // convert the date value to a timezone specific version
        var newModelValue = modelValue + 'T10:00:00-0400';
        return new Date(newModelValue);
      });

      ngModel.$parsers.push(function(modelValue){
        return new Date(modelValue);
      });
    }
  }
})();
