(function(){
  'use strict';

  angular
    .module('everycent.institutions')
    .factory('InstitutionsService', InstitutionsService);

    InstitutionsService.$inject = ['$http', 'Restangular'];
    function InstitutionsService($http, Restangular){
      var service = {
        getInstitutions: getInstitutions,
        addInstitution: addInstitution
      }

      var baseAll = Restangular.all('institutions');
      return service;

      function getInstitutions(){
        //return $http.get('/institutions').then(function(response){
        //  return response.data;
        //});
        return baseAll.getList();//.then(function(
      }

      function addInstitution(institution){
        return baseAll.post(institution);
      }

    }
})();
