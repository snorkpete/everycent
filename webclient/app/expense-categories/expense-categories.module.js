
(function(){
  angular
    .module('everycent.expense-categories', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('expense-categories', {
        url: '/expense-categories',
        templateUrl: 'app/expense-categories/list.html',
        controller: 'ExpenseCategoriesCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
