(function(){
  'use strict';

  angular
    .module('everycent.institutions')
    .factory('InstitutionsService', InstitutionsService);

    InstitutionsService.$inject = ['$http'];
    function InstitutionsService($http){
      var service = {
        getInstitutions: getInstitutions,
        addInstitution: addInstitution
      }

      return service;

      function getInstitutions(){
        return $http.get('/institutions').then(function(response){
          return response.data;
        });
      }

      function addInstitution(institution){
        alert('test');
      }

    }
})();
