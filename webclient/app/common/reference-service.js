(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('ReferenceService', ReferenceService);

    ReferenceService.$inject = [];
    function ReferenceService(){
      var service = {
        updateReferenceId: updateReferenceId
      };

      return service;

      function updateReferenceId(model, referenceName){
        model[referenceName + '_id'] = model[referenceName].id;
      }

    }
})();