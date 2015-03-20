
(function(){
  angular
    .module('everycent.account-balances', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('account-balances', {
        url: '/account-balances',
        templateUrl: 'app/account-balances/account-balances-list.html',
        controller: 'AccountBalancesCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
