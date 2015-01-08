(function(){
  'use strict';

  angular
    .module('everycent.setup.bank-accounts')
    .factory('BankAccountsService', BankAccountsService);

    BankAccountsService.$inject = ['$http', 'Restangular'];
    function BankAccountsService($http, Restangular){
      var service = {
        getBankAccounts: getBankAccounts,
        addBankAccount: addBankAccount
      };

      var baseAll = Restangular.all('bank_accounts');
      return service;

      function getBankAccounts(){
        return baseAll.getList();
      }

      function addBankAccount(bankAccount){
        return baseAll.post(bankAccount);
      }
    }
})();
