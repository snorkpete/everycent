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

        if(importType === 'new-bank-account'){
          return _convertFromNewTransactionFormat(input, startDate, endDate);
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
        transaction.transaction_date = DateService.toDate(dateText);
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
        //  2. payee name
        //  3. payee code + card number
        //  eg:
        // POS PURCHASE
        // MASSY STORES MARAVAL TT
        // 0328970 6018100031708790

        // however, there is an extra blank line in the array
        // which should be ignored
        if(_isPayee(lineDataCopy[3])){

          var payeeDetailsArray = lineDataCopy[3].match(/^(\d{7}) (.*)/);
          var payeeCode = payeeDetailsArray[1];
          var payeeName = lineDataCopy[2];

          transaction.description = payeeName;
          transaction.payee_name = payeeName;
          transaction.payee_code = payeeCode;

        }else{
          transaction.description = lineDataCopy.join(' ').trim();
        }

        var start = DateService.toDate(startDate);
        var end = DateService.toDate(endDate);

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

      // Payee Lines are identified by 7 digit number then a card number
      //  eg. 0004334 6012222233223
      function _isPayee(data){
        return /^\d{7} /.test(data);
      }

      function _isDate(data) {
        return new RegExp("\\d\\d\\/\\d\\d\\/\\d\\d\\d\\d").test(data);
      }

      function _convertFromCreditCardData(input, startDate, endDate){

        var start = DateService.toDate(startDate);
        var end = DateService.toDate(endDate);
        var transactionList =[];
        var fields = _convertInputToFieldList(input);

        var transaction = {};
        for(var i=0; i < fields.length; i += 3){
          transaction = {};
          var dateText = DateService.convertFromBankDateFormat(fields[i]);
          transaction.transaction_date = DateService.toDate(dateText);
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

      function _convertFromNewTransactionFormat(input, startDate, endDate){
        var lines = _convertInputToLines(input);

        var transactionDataList = _convertLinesToTransactionData(lines);
        return _convertTransactionArrayDataToTransactions(transactionDataList, startDate, endDate);
      }

      function _convertInputToLines(input) {
        if (!input) return [];
        return input.split(/[\n]/);
      }

      function _convertLinesToTransactionData(lines){
        if(lines == []){
          return [];
        }

        var NBR_DATA_LINES_PER_TRANSACTION = 4;

        var transactionDataList = [];
        var nbrLinesForCurrentTransaction = 0;
        var currentDataArray = [];

        lines.forEach(function(line){
          currentDataArray.push(line);
          nbrLinesForCurrentTransaction++;

          if(nbrLinesForCurrentTransaction >= NBR_DATA_LINES_PER_TRANSACTION){
            transactionDataList.push(currentDataArray);
            currentDataArray = [];
            nbrLinesForCurrentTransaction = 0;
          }
        });

        return transactionDataList;
      }

      function _convertTransactionArrayDataToTransactions(transactionArrayList, startDate, endDate){
        return transactionArrayList.map(function(transactionArray){
          return _convertTransactionArrayToTransaction(transactionArray, startDate, endDate);
        })
      }

      function _convertTransactionArrayToTransaction(transactionArray, startDate, endDate){
        if(transactionArray.length != 4){
          return {};
        }

        // Sample Source Data  (with balance)
        //Aug 17
        //2016	POS PURCHASE
        //Other
        //-$52.00 TTD	$947.00 TTD

        // Sample Source Data  (without balance)
        //Aug 12
        //2016	CUSTOMER TRANSFER (B/DT)
        //Transfer
        //$75.00 TTD

        var monthAndDay = transactionArray[0];
        var yearAndLine1Description = transactionArray[1];
        var line2Description = transactionArray[2];
        var amountAndBalance = transactionArray[3];

        var yearAndLine1DescriptionArray = yearAndLine1Description.match(/^(\d{4})\s+(.*)$/);
        var year = "";
        var line1Description = "";
        if(yearAndLine1DescriptionArray.length != 3){
          year = "";
          line1Description = "";
        }else{
          year = yearAndLine1DescriptionArray[1];
          line1Description = yearAndLine1DescriptionArray[2];
        }

        var signAndAmountArray = amountAndBalance.match(/^\s*(-?)\$(.*?)\sTTD/);
        var sign = "";
        var amount = "";
        if(signAndAmountArray.length != 3){
          var sign = "";
          var amount = "0";
        }else{

          sign = signAndAmountArray[1];
          amount = signAndAmountArray[2];
        }

        var transaction = {};
        transaction.transaction_date = new Date(monthAndDay + ' ' + year);
        transaction.description = line1Description + ' ' + line2Description;

        if(sign == ""){
          transaction.deposit_amount = Number(amount) * 100;
          transaction.withdrawal_amount = 0;
        }else{
          transaction.deposit_amount = 0;
          transaction.withdrawal_amount = Number(amount) * 100;
        }

        var start = DateService.toDate(startDate);
        var end = DateService.toDate(endDate);

        // confirm that the transaction date is within the period
        if(transaction.transaction_date < start || transaction.transaction_date > end){
          transaction.deleted = true;
        }

        // also remove any transactions with 0 amounts
        if(transaction.withdrawal_amount === 0 && transaction.deposit_amount === 0){
          transaction.deleted = true;
        }

        return transaction;
      }
    }

})();
