
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .filter('ecToDollars', ecToDollars);

  function ecToDollars(){
    return function(input){
      return isNaN(input) ? (0).toFixed(2) : (input / 100).toFixed(2);
    };
  }
})();
