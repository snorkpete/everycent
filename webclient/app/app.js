
(function(){
  'use strict';

  // Module definitions
  angular.module('everycent', [
    'ui.bootstrap',
    'ui.router',
    'ngCookies',
    'ngAnimate',
    'ng-token-auth',
    'restangular',
    'angular-loading-bar',
    'everycent.common',
    'everycent.menu',
    'everycent.security',
    'everycent.setup.institutions',
    'everycent.setup.bank-accounts',
    'everycent.setup.recurring-incomes',
    'everycent.setup.recurring-allocations',
    'everycent.setup.allocation-categories',
    'everycent.budgets'
  ]);

  angular
    .module('everycent')
    .config(AppConfig)
    .run(AuthenticationSetup)
    .controller('MainCtrl', MainCtrl);

  AppConfig.$inject = ['$authProvider', '$compileProvider'];
  function AppConfig($authProvider, $compileProvider){

    //$compileProvider.debugInfoEnabled(false);
  }

  AuthenticationSetup.$inject = ['$rootScope', '$timeout', '$location', 'MessageService'];
  function AuthenticationSetup($rootScope, $timeout, $location, MessageService){

    // when trying to access resources with an invalid authentication token
    // --------------------------------------------------------------------
    $rootScope.$on('auth:invalid', function(ev, reason){

      // TODO: there's some sort of timing issue going on,
      // so, we'll bypass the problem temporarily by using timeout
      // ---------------------------------------------------------
      $timeout(function(){
        $location.path('/sign_in');
        MessageService.setErrorMessage('You have been signed out. Please sign in again.');
      }, 500);
    });
  }

  MainCtrl.$inject = ['MessageService'];
  function MainCtrl(MessageService){
    var main = this;

    main.ui = MessageService.data;
    main.currentPage = 'institutions';
    //TODO convert this to a UserService that gets set up when a user signs in
    main.user = {
      name: 'Kion Stephen'
    };
  }
})();

