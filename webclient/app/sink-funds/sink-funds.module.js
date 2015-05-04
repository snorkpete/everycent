
(function(){
  angular
    .module('everycent.sink-funds', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('sink-funds', {
        url: '/sink-funds',
        templateUrl: 'app/sink-funds/sink-fund-list.html',
        controller: 'SinkFundsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('sink-funds.edit', {
        url: '/sink-funds/edit/:sink_fund_id',
        templateUrl: 'app/sink-funds/sink-fund-edit.html'
      })
    ;
  }
})();
