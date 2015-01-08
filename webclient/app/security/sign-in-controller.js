(function(){
  'use strict';

  angular
    .module('everycent.security')
    .controller('SignInCtrl', SignInCtrl);

    SignInCtrl.$inject = ['$auth', '$state', 'UserService', 'MessageService'];

    function SignInCtrl($auth, $state, UserService, MessageService){
      var vm = this;

      vm.signIn = signIn;

      function signIn(params){
        $auth.submitLogin(params).then(function(response){

          UserService.setupUser(response);
          MessageService.setMessage('Logged in successfully.');
          $state.go('home');

        }).catch(function(response){

          MessageService.setErrorMessage('Email or password is incorrect.');
          return true; // handled the error, so return true
        });
      }

    }
})();
