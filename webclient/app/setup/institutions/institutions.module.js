
(function(){
  angular
    .module('everycent.setup.institutions', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('institutions', {
        url: '/institutions',
        templateUrl: 'app/setup/institutions/list.html',
        controller: 'InstitutionsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('institutions.new', {
        url: '/institutions/new',
        templateUrl: 'app/setup/institutions/new.html'
      })
      .state('institutions.edit', {
        url: '/institutions/edit',
        templateUrl: 'app/setup/institutions/edit.html'
      })
    ;
  }
})();
