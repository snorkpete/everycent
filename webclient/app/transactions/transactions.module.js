
(function(){
  angular
    .module('everycent.transactions', ['everycent.common', 'everycent.transactions.importers'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('transactions', {
        url: '/transactions?bank_account&budget',
        reloadOnSearch: false,
        templateUrl: 'app/transactions/transaction-list.html',
        controller: 'TransactionsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('credit-card-transactions', {
        url: '/credit-card-transactions?bank_account',
        reloadOnSearch: false,
        templateUrl: 'app/transactions/credit-card-transaction-list.html',
        controller: 'CreditCardTransactionsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
