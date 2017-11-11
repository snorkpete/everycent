(function(){
  'use strict';

  angular
    .module('everycent.transactions.importers')
    .factory('FcbImporter', FcbImporter);

  FcbImporter.$inject = ['DateService'];
  function FcbImporter(DateService){
    var service = {
      convertFromBankFormat: _convertFromFCBankFormat,
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


    function _convertFromFCBankFormat(input, startDate, endDate) {
      // SAMPLE DATA
      // 2017-09-10	SAVINGS WITHDRAWAL - ATM	$500.00	$0.00	$1,819.61
      // 2017-09-08	SAVINGS WITHDRAWAL - ATM	$500.00	$0.00	$2,319.61
      // 2017-09-06	ACH CREDIT MEMO	$0.00	$250.00	$2,819.61
      // 2017-09-02	SAVINGS WITHDRAWAL - ATM	$1,000.00	$0.00	$2,569.61
      // 2017-09-01	ABM Withdrawal Fee - SAV	$3.00	$0.00	$3,569.61

      // first split into lines
      var lines = _convertInputToLines(input);

      // then split each line into its parts
      return lines.map(function(line){
        return _convertFCBankLineDataToTransaction(line, startDate, endDate);
      });
    }

    function _convertFCBankLineDataToTransaction(line, startDate, endDate) {
      var transaction = {};
      var parts = line.split('\t');
      transaction.transaction_date = new Date(parts[0]);
      transaction.description = parts[1];
      var withdrawalAsStringWithDollarSign = parts[2];
      var depositAsStringWithDollarSign = parts[3];

      transaction.withdrawal_amount = extractNumberFromDollarString(withdrawalAsStringWithDollarSign);
      transaction.deposit_amount = extractNumberFromDollarString(depositAsStringWithDollarSign);


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

    function extractNumberFromDollarString(dollarString) {
      if(!dollarString) {
        return 0;
      }
      var amountWithCommas = dollarString.replace(/\$/g, '');
      var amountAsNumberInDollars = Number(amountWithCommas.replace(/,/g, ''));
      return amountAsNumberInDollars * 100;
    }
  }

})();
