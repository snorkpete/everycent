
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .filter('ecToDollars', ecToDollars);

  function ecToDollars(){
    return function(input){
      return (input / 100).toFixed(2);
    };
  }
})();
