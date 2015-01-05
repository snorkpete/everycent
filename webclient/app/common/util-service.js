
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('UtilService', UtilService);

  UtilService.$inject = [];
  function UtilService(){
    var service = {
      total: total
    };
    return service;

    function total(items, fieldToSum){
      return _.reduce(items, function(sum, item){
        if(item.deleted){
          return sum;
        }else{
          return sum + item[fieldToSum];
        }
      }, 0);
    }
  }
})();
