
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('FormService', FormService);

  FormService.$inject = [];
  function FormService(){
    var service = {
      setErrors: setErrors,
      resetForm: resetForm
    };
    return service;

    function setErrors(form, errorData){
      // take every error found and add it to the corresponding form
      // -----------------------------------------------------------
      Object.keys(errorData).forEach(function(field){
        form[field].$error.server = errorData[field][0];
      });
    }

    /**
     *  Clear the model and reset the errors
     *  for each field listed in fields
     */
    function resetForm(model, form, fields){
      fields.forEach(function(field){

        // reset the model's value
        model[field] = '';

        // reset the form's error status
        if(form[field]){
          form[field].$error = {};
        }
      });
    }

  }
})();
