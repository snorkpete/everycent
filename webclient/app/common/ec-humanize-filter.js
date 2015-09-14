
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .filter('ecHumanize', ecHumanize);

  function ecHumanize(){
    return function(input){
      if(input === undefined){
        return '';
      }

      if(input.split === undefined){
        return input;
      }

      var words = input.split(/[_\s]/g);
      var uppercasedWords = words.map(function(word){
        return word.substring(0,1).toUpperCase() + word.substring(1);
      });

      return uppercasedWords.join(' ');
    };
  }
})();
