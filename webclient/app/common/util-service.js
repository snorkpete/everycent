
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

        // don't include deleted items
        // ---------------------------
        if(item.deleted){
          return sum;
        }

        // handle 'net_amount' specially -
        // net amount totaling is deposit - withdrawal
        if(fieldToSum === 'net_amount'){
          return sum + (item.deposit_amount - item.withdrawal_amount);
        }

        // skip any items that don't have the property
        if(!item[fieldToSum]){
          return sum;
        }

        return sum + item[fieldToSum];

      }, 0);
    }
  }
})();
