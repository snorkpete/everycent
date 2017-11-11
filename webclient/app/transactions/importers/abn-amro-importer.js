
(function(){
  'use strict';

  angular
    .module('everycent.transactions.importers')
    .factory('AbnAmroImporter', AbnAmroImporter);

  AbnAmroImporter.$inject = ['DateService'];
  function AbnAmroImporter(DateService){
    var service = {
      convertFromBankFormat: _convertFromBankFormat,
      convertFromCreditCardFormat: _convertFromCreditCardFormat
    };

    return service;

    function _convertFromCreditCardFormat() {
      throw new Error('not implemented yet');
    }


    function _convertInputToLines(input) {
      if (!input) return [];
      return input.split(/[\n]/);
    }


    function _convertFromBankFormat(input, startDate, endDate) {
      // SAMPLE DATA
      // 3 Nov \`17
      // Albert Heijn Fr.8642 ALM,PAS361
      // - 57,06
      // Het Beeldverhaal ALMERE ,PAS361
      // - 30,97
      // NL12RABO0306498111
      // TLS BV INZ. OV-CHIPKAART
      // NL12 RABO 0306 4981 11
      // - 50,00
      // 2 Nov \`17
      // NL12RABO0306498111
      // TLS BV INZ. OV-CHIPKAART
      // NL12 RABO 0306 4981 11
      // + 49,26

      var start = DateService.toDate(startDate);
      var end = DateService.toDate(endDate);

      var transactions = [];
      var transaction, currentDate, withdrawalAmount, depositAmount;
      var currentDescription = '';

      // first split into lines
      var lines = _convertInputToLines(input);
      lines.forEach(function(line) {

        if(isDate(line)){
          currentDate = extractDate(line);
          return;
        }

        if(isNumber(line)){
          var numberParts = extractNumberParts(line);
          if(numberParts.sign == '+') {
            depositAmount = numberParts.amount;
            withdrawalAmount = 0;

          } else {
            depositAmount = 0;
            withdrawalAmount = numberParts.amount;
          }

        // it's a description, but exclude bank stuff
        } else if (line.substr(0,2) !== 'NL') {
            currentDescription = line;
        }

        if(isEndOfTransaction(line)) {
          transaction = {
            transaction_date: currentDate,
            description: currentDescription,
            withdrawal_amount: withdrawalAmount,
            deposit_amount: depositAmount
          };

          // confirm that the transaction date is within the period
          if(transaction.transaction_date < start || transaction.transaction_date > end){
            transaction.deleted = true;
          }

          // also remove any transactions with 0 amounts
          if(transaction.withdrawal_amount === 0 && transaction.deposit_amount === 0){
            transaction.deleted = true;
          }
          transactions.push(transaction);
          currentDescription = '';
          withdrawalAmount = 0;
          depositAmount = 0;
        }
      });

      return transactions;
    }

    function isDate(line) {
      if(!line) {
        return false;
      }
      return line.match(/(\d\d?) ([A-z]{3}) `(\d\d)/);
    }

    function extractDate(line) {
      if(!isDate(line)) {
        return undefined;
      }

      return new Date(line.replace(/`/g, ''));
    }

    function isNumber(line) {
      var firstChar = line.trim().substr(0,1);

      return firstChar == '-' || firstChar == '+';
    }

    function extractNumberParts(line) {
      var sign = line.trim().substr(0,1);
      var numberString = line.substring(1).trim().replace(/\./g, '').replace(/,/g, '.');
      var amount = Number(numberString) * 100;

      return {
        sign: sign,
        amount: amount
      };
    }

    function isEndOfTransaction(line) {
      return isNumber(line);
    }

  }

})();
