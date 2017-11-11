// 15 Oct `17
// Albert Heijn 1289 AMSTER,PAS351
// - 9,03
// A'damse Fietswinkel AMST,PAS351
// - 295,00
// NL04INGB0007552562
// Simpel.nl B.V.
// NL04 INGB 0007 5525 62
// - 35,00
// NL04INGB0007552562
// Simpel.nl B.V.
// NL04 INGB 0007 5525 62
// - 35,00
// 14 Oct `17
// Dominos Amsterdam Amster,PAS351
// - 21,40
// NL19DEUT0319821366
// Stichting Derdengelden B
// NL19 DEUT 0319 8213 66
// - 7,50
// NL19DEUT0319821366
// Stichting Derdengelden B
// NL19 DEUT 0319 8213 66
// - 7,50
// NL19DEUT0319821366
// Stichting Derdengelden B
// NL19 DEUT 0319 8213 66
// - 7,50
// NL19DEUT0319821366
// Stichting Derdengelden B
// NL19 DEUT 0319 8213 66
// - 7,50
// 13 Oct `17
// NL37DEUT0265134285
// BOOKING.COM B.V.
// NL37 DEUT 0265 1342 85
// + 7.750,00
// 7 Oct `17
// PAKKETVERZ. POLISNR. 254085105
// - 7,88
// `

(function(){
  'use strict';

  angular
    .module('everycent.transactions.importers')
    .factory('AbnAmroImporter', AbnAmroImporter);

  AbnAmroImporter.$inject = ['DateService'];
  function AbnAmroImporter(DateService){
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
