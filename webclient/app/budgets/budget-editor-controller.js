
(function(){
  'use strict';

  angular
    .module('everycent.budgets')
    .controller('BudgetEditorCtrl', BudgetsCtrl);

  BudgetsCtrl.$inject = ['MessageService', 'BudgetsService', 'StateService', '$rootScope'];

  function BudgetsCtrl(MessageService, BudgetsService, StateService, $rootScope){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.budget = {};
    vm.saveChanges = saveChanges;

    activate();

    function activate(){
      loadBudget();
    }

    function loadBudget(){
      return BudgetsService.getBudget(StateService.getParam('budget_id')).then(function(budget){
        vm.budget = budget;
        $rootScope.$broadcast('budget.loaded');
      });
    }

    function saveChanges(budget){
      BudgetsService.save(budget).then(function(response){
        MessageService.setMessage('Budget saved.');
        loadBudget();

      }, function(error){

        MessageService.setErrorMessage('Budget not saved.');
      });
    }
  }
})();
