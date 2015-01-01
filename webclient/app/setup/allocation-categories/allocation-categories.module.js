
(function(){
  angular
    .module('everycent.setup.allocation-categories', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('allocation-categories', {
        url: '/allocation-categories',
        templateUrl: 'app/setup/allocation-categories/list.html',
        controller: 'AllocationCategoriesCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
