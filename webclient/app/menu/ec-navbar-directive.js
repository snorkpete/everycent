
(function(){
  angular
    .module('everycent.menu')
    .directive('ecNavbar', ecNavbar);

  function ecNavbar(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/menu/ec-navbar-directive.html',
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['MessageService', 'UserService', 'StateService', '$auth', 'LookupService'];
  function controller(MessageService, UserService, StateService, $auth, LookupService){
    var vm = this;
    vm.user = UserService.getUser();
    vm.signOut = signOut;
    vm.isActive = isActive;
    vm.go = go;
    vm.navMenuOpen = false;
    vm.setupOpen = false;

    function signOut(){
      //TODO: possibly wrap this stuff into an authentication service
      $auth.signOut()
        .finally(function(response){
          UserService.clear();
          return StateService.go('sign_in');
        })
        .then(function(response){
          MessageService.setMessage('Successfully signed out.');
        });
    }

    function isActive(menuOption){
      if(menuOption === 'setup'){
        var result = false;
        var setupMenuOptions = ['institutions', 'bank-accounts', 'recurring-incomes',
                                'recurring-allocations', 'allocation-categories', 'settings'];
        setupMenuOptions.forEach(function(option){

          if(StateService.is(option)){
            result = true;
          }
        });
        return result;
      }
      // TODO: messy way of handling this - need a more scalable solution
      else if(menuOption === 'budgets'){
        return StateService.is('budgets') ||
          StateService.is('budgets-edit') ||
          StateService.is('budgets.new');
      }
      else{
        return StateService.is(menuOption);
      }
    }

    function go(state, params){
      StateService.go(state, params);
      vm.navMenuOpen = false;
      vm.setupOpen = false;
      LookupService.clear();
    }
  }
})();
