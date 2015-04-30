
(function(){
  angular
    .module('everycent.sink-funds', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('sink-funds', {
        url: '/sink-funds?bank_account',
        reloadOnSearch: false,
        templateUrl: 'app/sink-funds/sink-fund-list.html',
        controller: 'SinkFundsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
