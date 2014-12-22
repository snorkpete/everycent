;
(function(){
  'use strict';

  angular
    .module('everycent')
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider', '$urlRouterProvider'];

  function RouteConfiguration($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('home', {
        url: '/', 
        templateUrl: 'app/home/home.html',
        controller: [function(){ }]
      })
      .state('all', {
        abstract: true,
        resolve: {
          auth: ['$auth',function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('all.institutions', {
        url: '/institutions',
        templateUrl: 'app/institutions/list.html',
        controller: 'InstitutionsCtrl as vm'
      })
    ;

    // if none of the above match, then redirect to the 'home' state
    $urlRouterProvider.otherwise('/');
  }

})();
