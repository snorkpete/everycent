
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('LookupService', LookupService);

  LookupService.$inject = ['Restangular'];
  function LookupService(Restangular){
    var service = {
      refreshList: refreshList
    };
    return service;

    function refreshList(list){
      return Restangular.all(list).getList();
    }
  }
})();
