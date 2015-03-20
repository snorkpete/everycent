
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
    'toastr',
    'angular-loading-bar',
    'everycent.common',
    'everycent.menu',
    'everycent.security',
    'everycent.setup.institutions',
    'everycent.setup.bank-accounts',
    'everycent.setup.recurring-incomes',
    'everycent.setup.recurring-allocations',
    'everycent.setup.allocation-categories',
    'everycent.budgets',
    'everycent.transactions',
    'everycent.account-balances'
  ]);

  angular
    .module('everycent')
    .config(AppConfig)
    .run(AuthenticationSetup)
    .controller('MainCtrl', MainCtrl);

  AppConfig.$inject = ['$authProvider', '$compileProvider', '$httpProvider'];
  function AppConfig($authProvider, $compileProvider, $httpProvider){

    //$compileProvider.debugInfoEnabled(false);
    $httpProvider.useApplyAsync(true);
  }

  AuthenticationSetup.$inject = ['$rootScope', '$timeout', '$location', 'MessageService', 'UserService'];
  function AuthenticationSetup($rootScope, $timeout, $location, MessageService, UserService){

    // TODO: this happens on every request - need to only happen on the first request
    $rootScope.$on('auth:validation-success', function(ev, userConfig){
      UserService.setupUser(userConfig);
    });

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
  }
})();

