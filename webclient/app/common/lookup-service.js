
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('LookupService', LookupService);

  LookupService.$inject = ['Restangular', '$q'];
  function LookupService(Restangular, $q){
    var dataCache = { };
    var promiseCache = { };

    var service = {
      clear: clear,
      refreshList: refreshList
    };
    return service;

    function refreshList(list, params, ignoreCache){
      //TODO: to fix so that we cache based on params
      if(ignoreCache){

        // we need to convert the restangular objects to plain objects,
        // because when used in ngOptions, the restangular objects are generating extra options
        return Restangular.all(list).getList(params).then(function(serverList){
          return _mapRestangularObjectListToSimpleObjectList(serverList);
        });
      }

      return $q.when(dataCache[list] || promiseCache[list] || _refreshFromServer(list, params));

      function _refreshFromServer(list, params){
        promiseCache[list] = Restangular.all(list).getList(params).then(function(listValues){

          // we need to convert the restangular objects to plain objects,
          // because when used in ngOptions, the restangular objects are generating extra options
          var simpleListValues = _mapRestangularObjectListToSimpleObjectList(listValues);
          dataCache[list] = simpleListValues;
          return simpleListValues;
        });

        return promiseCache[list];
      }
    }

    function clear(){
      dataCache = {};
      promiseCache = {};
    }

    // TODO:  this is a temporary fix for the ng-options bug
    // the restangular object array contains extra properties/functions
    // that are not needed for our lookup lists, but are iterated over
    // when the restangularized array is used in ng-options
    // So, we'll create a new array without these extra restangular properties
    function _mapRestangularObjectListToSimpleObjectList(restangularObjectList){
      var result = [];
      restangularObjectList.forEach(function(obj){
        result.push(obj);
      });

      return result;
    }
  }
})();
