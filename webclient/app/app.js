
(function(){
  'use strict';

  // Module definitions
  angular.module('everycent.common', []);
  angular.module('everycent', [
    'ui.router',
    'everycent.common',
    'everycent.institutions'
    ]);

  angular
    .module('everycent')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = [];

  function MainCtrl(){
  }
})();

