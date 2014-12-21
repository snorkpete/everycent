
(function(){
  angular
    .module('everycent.institutions', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('institutions', {
        url: '/institutions',
        templateUrl: 'app/institutions/list.html',
        controller: [function(){ }]
      })
    ;
  }
})();
;
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

;;
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
      //.state('institutions', {
      //  url: '/institutions',
      //  templateUrl: 'app/institutions/list.html',
      //  controller: [function(){ }]
      //})
    ;

    // if none of the above match, then redirect to the 'home' state
    $urlRouterProvider.otherwise('/');
  }

})();
