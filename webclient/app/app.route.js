
(function(){
  'use strict';

  angular
    .module('everycent')
    .config(RouteConfiguration)
    .controller('HomeCtrl', HomeCtrl);

  RouteConfiguration.$inject = ['$authProvider', '$stateProvider', '$urlRouterProvider'];
  function RouteConfiguration($authProvider, $stateProvider, $urlRouterProvider){

    // Configure the auth provider
    // ---------------------------

    $authProvider.configure({
      apiUrl: ''
    });

    // Configure the global routes
    // ---------------------------
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/home/home.html',
        controller: 'HomeCtrl as vm',
        resolve: {
          auth: ['$auth',function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('all', {
        abstract: true,
        resolve: {
          auth: ['$auth',function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;

    // if none of the above match, then redirect to the 'home' state
    $urlRouterProvider.otherwise('/');
  } // end route config

  HomeCtrl.$inject = ['TransactionsService'];
  function HomeCtrl(TransactionsService){

    var vm = this;
    activate();

    function activate(){
      TransactionsService.getLastUpdate().then(function(lastUpdate){
        vm.lastUpdate =lastUpdate;
      });
    }

  }

})();
