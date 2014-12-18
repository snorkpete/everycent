
(function(){
  'use strict';

  // Module definitions
  angular.module('everycent.common', []);
  angular.module('everycent', ['everycent.common']);

  angular
    .module('everycent')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = [];

  function MainCtrl(){
  }
})();

