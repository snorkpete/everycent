
(function(){
  'use strict';

  angular
    .module('everycent.budgets')
    .controller('BudgetEditorCtrl', BudgetsCtrl);

  BudgetsCtrl.$inject = ['MessageService', 'BudgetsService', 'ModalService', 'FormService', 'StateService'];

  function BudgetsCtrl(MessageService, BudgetsService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.budget = {};

    activate();

    function activate(){
      BudgetsService.getBudget(StateService.getParam('budget_id')).then(function(budget){
        vm.budget = budget;
      });
    }
  }
})();
