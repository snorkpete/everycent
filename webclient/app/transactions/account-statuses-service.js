
(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .factory('AccountStatusesService', AccountStatusesService);

    AccountStatusesService.$inject = ['$http', 'Restangular'];
    function AccountStatusesService($http, Restangular){
      var service = {
        getAccountStatuses: getAccountStatuses
      };

      var baseAll = Restangular.all('account_statuses');
      return service;

      function getAccountStatuses(){
        return baseAll.getList();
      }
    }
})();
