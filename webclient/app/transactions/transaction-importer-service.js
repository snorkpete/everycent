(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .factory('TransactionImporterService', TransactionImporterService);

    TransactionImporterService.$inject = ['DateService'];
    function TransactionImporterService(DateService){
      var service = {
        convertToTransactions: convertToTransactions
      };

      return service;

      function convertToTransactions(input, startDate, endDate, importType){

        if(importType === 'credit-card'){
          return _convertFromCreditCardData(input, startDate, endDate);
        }

        var transactionList =[];
        var lines = _combineFieldsIntoLines(_convertInputToFieldList(input));

        // remove the empty first line
        lines.shift();

        lines.forEach(function(lineData){
          var transaction = _createTransactionFromLineData(lineData, startDate, endDate, importType);
          transactionList.push(transaction);
        });

        return transactionList;
      }

      function _createTransactionFromLineData(lineData, startDate, endDate, importType){

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
        var rawData = lineDataCopy.shift();
        var dateText = DateService.convertFromBankDateFormat(rawData);
        transaction.transaction_date = new Date(dateText);
        //transaction.transaction_date = new Date(DateService.convertFromBankDateFormat(lineDataCopy.shift()));
        transaction.ref = lineDataCopy.shift();

        // the account balance column is only present for plain bank accounts
        if(importType === 'bank-account'){
          transaction.balance = lineDataCopy.pop();
        }

        // get deposit amount and withdrawal amount from the end of the array
        // ------------------------------------------------------------------
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

          transaction.description = (lineDataCopy[0] + ' ' + payeeName).trim();
          transaction.payeeName = payeeName;
          transaction.payeeCode = payeeCode;

        }else{
          transaction.description = lineDataCopy.join(' ').trim();
        }

        var start = new Date(startDate);
        var end = new Date(endDate);

        // confirm that the transaction date is within the period
        if(transaction.transaction_date < start || transaction.transaction_date > end){
          transaction.deleted = true;
        }
        return transaction;
      }

      function _extractNumber(dollarString){
        var withoutCommas = dollarString.replace(/,/g, '');
        var match = withoutCommas.match(/[$]([-0-9.,]*)/);
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
        lines.push(currentLine);
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

      function _convertFromCreditCardData(input, startDate, endDate){

        var start = new Date(startDate);
        var end = new Date(endDate);
        var transactionList =[];
        var fields = _convertInputToFieldList(input);

        var transaction = {};
        for(var i=0; i < fields.length; i += 3){
          transaction = {};
          var dateText = DateService.convertFromBankDateFormat(fields[i]);
          transaction.transaction_date = new Date(dateText);
          transaction.description = fields[i+1];
          transaction.amount = fields[i+2];

          if(transaction.amount && transaction.amount.substring(0,2) === 'CR'){
            transaction.deposit_amount = _extractNumber(transaction.amount.substring(2)) * 100;
            transaction.withdrawal_amount = 0;
          }else{
            transaction.withdrawal_amount = _extractNumber(transaction.amount) * 100;
            transaction.deposit_amount = 0;
          }

          // confirm that the transaction date is within the period
          if(transaction.transaction_date < start || transaction.transaction_date > end){
            transaction.deleted = true;
          }

          // also remove any transactions with 0 amounts
          if(transaction.withdrawal_amount === 0 && transaction.deposit_amount === 0){
            transaction.deleted = true;
          }

          transactionList.push(transaction);
        }

        return transactionList;
      }
    }

})();
