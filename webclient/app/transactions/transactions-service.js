(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .factory('TransactionsService', TransactionsService);

    TransactionsService.$inject = ['$http', 'Restangular', 'filterFilter'];
    function TransactionsService($http, Restangular, filterFilter){
      var service = {
        getTransactions: getTransactions,
        save: save
      };

      var baseAll = Restangular.all('transactions');
      return service;

      function getTransactions(params){
        return baseAll.getList(params);
      }

      function save(transactions, searchOptions){

        // remove deleted transactions first
        var undeletedTransactions = [];
        transactions.forEach(function(transaction){
          if(!transaction.deleted){
            undeletedTransactions.push(transaction);
          }
        });

        var params = {
          budget_id: searchOptions.budget_id,
          bank_account_id: searchOptions.bank_account_id,
          transactions: undeletedTransactions
        };
        return baseAll.post(params);
      }

    }
})();
