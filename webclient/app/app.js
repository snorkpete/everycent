
(function(){
  'use strict';

  // Module definitions
  angular.module('everycent', [
    'ui.bootstrap',
    'ui.router',
    'ngCookies',
    'ng-token-auth',
    'everycent.common',
    'everycent.security',
    'everycent.institutions'
    ]);

  angular
    .module('everycent')
    .config(AppConfig)
    .controller('MainCtrl', MainCtrl);

  AppConfig.$inject = ['$authProvider'];
  function AppConfig($authProvider){
    $authProvider.configure({
      apiUrl: ''
    });
  }

  MainCtrl.$inject = ['MessageService'];
  function MainCtrl(MessageService){
    var main = this;

    main.ui = MessageService.data;
  }
})();

