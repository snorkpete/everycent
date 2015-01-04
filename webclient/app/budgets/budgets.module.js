
(function(){
  angular
    .module('everycent.budgets', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('budgets', {
        url: '/budgets',
        templateUrl: 'app/budgets/budget-list.html',
        controller: 'BudgetsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('budgets.new', {
        url: '/budgets.new',
        templateUrl: 'app/budgets/budget-new.html'
      })
      .state('budgets-edit', {
        url: '/budgets/:budget_id/edit',
        templateUrl: 'app/budgets/budget-edit.html',
        controller: 'BudgetEditorCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
