(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .factory('TransactionsService', TransactionsService);

    TransactionsService.$inject = ['$http', 'Restangular', 'DateService'];
    function TransactionsService($http, Restangular, DateService){
      var service = {
        newTransaction: newTransaction,
        getTransactions: getTransactions,
        save: save,
        convertToTransactions: convertToTransactions
      };

      var baseAll = Restangular.all('transactions');
      return service;

      function newTransaction(){
        return {
          withdrawal_amount: 0,
          deposit_amount: 0
        };
      }

      function getTransactions(params){
        return baseAll.getList(params);
      }

      function save(transactions, searchOptions){

        // remove deleted transactions first
        //var undeletedTransactions = [];
        //transactions.forEach(function(transaction){
        //  if(!transaction.deleted){
        //    undeletedTransactions.push(transaction);
        //  }
        //});

        var undeletedTransactions = transactions.filter(function(transaction){
          return !transaction.deleted;
        });

        var params = {
          budget_id: searchOptions.budget_id,
          bank_account_id: searchOptions.bank_account_id,
          transactions: undeletedTransactions
        };
        return baseAll.post(params);
      }

      function convertToTransactions(input){
        var transactionList =[];
        var lines = _combineFieldsIntoLines(_convertInputToFieldList(input));

        // remove the empty first line
        lines.shift();

        lines.forEach(function(lineData){
          var transaction = _createTransactionFromLineData(lineData);
          transactionList.push(transaction);
        });

        return transactionList;
      }

      function _createTransactionFromLineData(lineData){
        //
        // line data is an array representing one transaction from the bank
        // That format is
        // ['date', 'ref', 2-4 lines of description, amount withdrawn, amount deposited, balance]
        // Because the description can be of differing nos of lines,
        // we have to instead extract the other fields and the remainder will be the description
        // -------------------------------------------------------------------------------------

        var lineDataCopy = angular.copy(lineData);
        var transaction = {};

        // get the transaction date and bank ref from the front
        // ----------------------------------------------------
        transaction.transaction_date = new Date(DateService.convertFromBankDateFormat(lineDataCopy.shift()));
        transaction.ref = lineDataCopy.shift();

        // get the balance, deposit amount and withdrawal amount from the end of the array
        // -------------------------------------------------------------------------------
        transaction.balance = lineDataCopy.pop();
        transaction.deposit_amount = _extractNumber(lineDataCopy.pop()) * 100;  //convert to cents
        transaction.withdrawal_amount= _extractNumber(lineDataCopy.pop()) * 100;  //convert to cents

        // transactions with payees are of the format
        //  1. description
        //  2. payee code + name
        //  3. payee location
        //  eg:
        //  POS PURCHASE
        //  0754942 SUPERPHARM
        //  MARAVAL TT
        if(_isPayee(lineDataCopy[2])){

          var payeeDetailsArray = lineDataCopy[2].match(/^(\d{7}) (.*)/);
          var payeeCode = payeeDetailsArray[1];
          var payeeName = payeeDetailsArray[2];

          transaction.description = lineDataCopy[0] + ' ' + payeeName;
          transaction.payeeName = payeeName;
          transaction.payeeCode = payeeCode;

        }else{
          transaction.description = lineDataCopy.join(' ');
        }

        return transaction;
      }

      function _extractNumber(dollarString){
        var match = dollarString.match(/[$]([-0-9.]*)/);
        if(match && match[1]){
          return Number(match[1]);
        }else{
          return 0;
        }
      }

      function _convertInputToFieldList(input) {
        if (!input) return [];
        return input.split(/[\t\n]/);
      }

      function _combineFieldsIntoLines(items) {
        var lines = [];
        var currentLine = [];

        items.forEach(function (item) {

          // if we encounter a date, start a new line
          if (_isDate(item)) {
            lines.push(currentLine);
            currentLine = [];

          }
          currentLine.push(item);

        });

        return lines;
      }

      // Payee Lines are identified by 7 digit number then a description
      //  eg. 0004334 K.F.C
      function _isPayee(data){
        return /^\d{7} /.test(data);
      }

      function _isDate(data) {
        return new RegExp("\\d\\d\\/\\d\\d\\/\\d\\d\\d\\d").test(data);
      }
    }
})();
