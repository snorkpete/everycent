
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('DateService', DateService);

  function DateService(){
    var service = {
      convertFromBankDateFormat: convertFromBankDateFormat,
      toDate: toDate
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

      //return '' + dateParts[3] + '/' + dateParts[1] + '/' + dateParts[2];
      return '' + dateParts[3] + '-' + dateParts[1] + '-' + dateParts[2] + 'T10:00:00-04:00';
    }

    function toDate(dateObjectOrString){

      // Don't do anything if we already have a date
      // -------------------------------------------
      if(dateObjectOrString instanceof Date){
        return dateObjectOrString;
      }

      // if we have a time portion already, then don't add one
      // -----------------------------------------------------
      if(/T\d{1,2}:\d{2}:\d{2}-\d{1,2}:\d{2}/.test(dateObjectOrString)){
        return new Date(dateObjectOrString);
      }


      return new Date(dateObjectOrString + 'T10:00:00-04:00');
    }
  }
})();
