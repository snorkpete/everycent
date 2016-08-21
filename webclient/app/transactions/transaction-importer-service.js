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

        if(importType === 'bank-account'){
          return _convertFromNewTransactionFormat(input, startDate, endDate);
        }

        return [];
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
