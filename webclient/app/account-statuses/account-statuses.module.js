
(function(){
  angular
    .module('everycent.account-statuses', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('account-statuses', {
        url: '/account-statuses',
        templateUrl: 'app/account-statuses/account-statuses-list.html',
        controller: 'AccountStatusesCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
