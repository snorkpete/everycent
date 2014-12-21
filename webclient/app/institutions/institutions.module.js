
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
        controller: 'InstitutionsCtrl as vm'
      })
    ;
  }
})();
