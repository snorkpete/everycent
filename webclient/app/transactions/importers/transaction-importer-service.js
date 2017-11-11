(function(){
  'use strict';

  angular
    .module('everycent.transactions')
    .factory('TransactionImporterService', TransactionImporterService);

    TransactionImporterService.$inject = ['ScotiaImporter', 'FcbImporter', 'AbnAmroImporter'];
    function TransactionImporterService(ScotiaImporter, FcbImporter, AbnAmroImporter){
      var service = {
        convertToTransactions: convertToTransactions
      };

      return service;

      function convertToTransactions(input, startDate, endDate, importType){
        if (importType == 'fc-bank') {
          return FcbImporter.convertFromBankFormat(input, startDate, endDate);
        }
        if (importType == 'fc-creditcard') {
          return FcbImporter.convertFromCreditCardFormat(input, startDate, endDate);
        }
        if (importType == 'abn-amro-bank') {
          return AbnAmroImporter.convertFromBankFormat(input, startDate, endDate);
        }
        if (importType == 'abn-amro-creditcard') {
          return AbnAmroImporter.convertFromCreditCardFormat(input, startDate, endDate);
        }
        return ScotiaImporter.convertToTransactions(input, startDate, endDate, importType);
      }

    }

})();
