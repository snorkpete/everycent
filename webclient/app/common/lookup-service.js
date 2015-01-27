
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
        return Restangular.all(list).getList(params);
      }

      return $q.when(dataCache[list] || promiseCache[list] || _refreshFromServer(list, params));

      function _refreshFromServer(list, params){
        promiseCache[list] = Restangular.all(list).getList(params).then(function(listValues){
          dataCache[list] = listValues;
          return listValues;
        });

        return promiseCache[list];
      }
    }

    function clear(){
      dataCache = {};
      promiseCache = {};
    }
  }
})();
