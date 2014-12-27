
(function(){
  angular
    .module('everycent.bank-accounts', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('bank-accounts', {
        url: '/bank-accounts',
        templateUrl: 'app/bank-accounts/list.html',
        controller: 'BankAccountsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('bank-accounts.new', {
        url: '/bank-accounts/new',
        templateUrl: 'app/bank-accounts/new.html'
      })
      .state('bank-accounts.edit', {
        url: '/bank-accounts/edit',
        templateUrl: 'app/bank-accounts/edit.html'
      })
    ;
  }
})();
