
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
      .state('budgets.current', {
        controller: ['current', 'StateService', function(current, StateService){
          StateService.go('budgets-edit', { budget_id: current });
        }],
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }],
          current:['$auth', '$http', function($auth, $http){
             return $http({method: 'GET', url: '/budgets/current'}).then(function (response){
               return response.data.budget_id;
             });
          }]
        }
      })
      .state('budgets.new', {
        url: '/budgets/new',
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
