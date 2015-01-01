
(function(){
  angular
    .module('everycent.recurring-allocations', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('recurring-allocations', {
        url: '/recurring-allocations',
        templateUrl: 'app/recurring-allocations/list.html',
        controller: 'RecurringAllocationsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('recurring-allocations.new', {
        url: '/recurring-allocations/new',
        templateUrl: 'app/recurring-allocations/new.html'
      })
      .state('recurring-allocations.edit', {
        url: '/recurring-allocations/edit',
        templateUrl: 'app/recurring-allocations/edit.html'
      })
    ;
  }
})();
