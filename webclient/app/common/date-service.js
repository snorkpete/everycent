
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('DateService', DateService);

  function DateService(){
    var service = {
      convertFromBankDateFormat: convertFromBankDateFormat
    };

    return service;

    function convertFromBankDateFormat(dateInBankDateFormat){
      if(!dateInBankDateFormat || !dateInBankDateFormat.match){
        return '';
      }

      var dateParts = dateInBankDateFormat.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if(dateParts.length != 4){
        return '';
      }

      return '' + dateParts[3] + '/' + dateParts[1] + '/' + dateParts[2];
    }
  }
})();
