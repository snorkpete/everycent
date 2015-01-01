
(function(){
  angular
    .module('everycent.recurring-incomes', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('recurring-incomes', {
        url: '/recurring-incomes',
        templateUrl: 'app/recurring-incomes/list.html',
        controller: 'RecurringIncomesCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('recurring-incomes.new', {
        url: '/recurring-incomes/new',
        templateUrl: 'app/recurring-incomes/new.html'
      })
      .state('recurring-incomes.edit', {
        url: '/recurring-incomes/edit',
        templateUrl: 'app/recurring-incomes/edit.html'
      })
    ;
  }
})();
