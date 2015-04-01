
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

      // Called when converting ngModel value to the date input field
      ngModel.$formatters.push(function(modelValue){

        // Don't do anything if we already have a date
        if(modelValue instanceof Date){
          return modelValue;
        }

        // convert the date value to a local timezone specific version
        var newModelValue = modelValue + 'T10:00:00-04:00';
        return new Date(newModelValue);
      });

      // Called when converting the date input field back to an ngModel value
      ngModel.$parsers.push(function(modelValue){
        return new Date(modelValue);
      });
    }
  }
})();
