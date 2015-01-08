
(function(){
  angular
    .module('everycent.menu')
    .directive('ecNavbar', ecNavbar);

  function ecNavbar(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/menu/ec-navbar-directive.html',
      scope: {
        userName: '=',
        currentPage: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    }

    return directive;
  }

  controller.$inject = ['MessageService', 'StateService', '$auth'];
  function controller(MessageService, StateService, $auth){
    var vm = this;

    vm.state = StateService;
    vm.signOut = signOut;
    vm.isActive = isActive;

    function signOut(){
      $auth.signOut()
        .then(function(response){
          return StateService.go('sign_in');
        })
        .then(function(response){
          MessageService.setMessage('Successfully signed out.');
        })
    }

    function isActive(menuOption){
      if(menuOption === 'setup'){
        var result = false;
        var setupMenuOptions = ['institutions', 'bank-accounts', 'recurring-incomes',
                                'recurring-allocations', 'allocation-categories'];
        setupMenuOptions.forEach(function(option){

          if(StateService.is(option)){
            result = true;
          }
        });
        return result;
      }else{
        return StateService.is(menuOption);
      }
    }
  }
})();
