
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('ErrorService', ErrorService);

  ErrorService.$inject = [];
  function ErrorService(){
    var service = {
      setErrors: setErrors
    };
    return service;

    function setErrors(form, errorData){
      // take every error found and add it to the corresponding form
      // -----------------------------------------------------------
      Object.keys(errorData).forEach(function(field){
        form[field].$error.server = errorData[field][0];
      });
    }

  }
})();
