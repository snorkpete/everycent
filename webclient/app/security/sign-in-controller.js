(function(){
  'use strict';

  angular
    .module('everycent.security')
    .controller('SignInCtrl', SignInCtrl);

    SignInCtrl.$inject = ['$auth', '$state', 'MessageService'];

    function SignInCtrl($auth, $state, MessageService){
      var vm = this;

      vm.signIn = signIn;

      function signIn(params){
        $auth.submitLogin(params).then(function(response){

            MessageService.setMessage('Logged in successfully.');
            $state.go('institutions');

          }).catch(function(response){

            MessageService.setErrorMessage('Invalid login');
            if(response.data && response.data.errors){
              MessageService.setErrorMessage(response.data.errors[0]);
            }

            return true; // handled the error, so return true
        });
      }

    }
})();
