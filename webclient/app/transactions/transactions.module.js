
(function(){
  angular
    .module('everycent.transactions', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('transactions', {
        url: '/transactions',
        templateUrl: 'app/transactions/transaction-list.html',
        controller: 'TransactionsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
