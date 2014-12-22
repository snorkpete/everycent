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
        console.log(params);
        $auth.submitLogin(params).then(function(response){
            // handle success
            MessageService.data.message = '';
            $state.go('institutions');

        }).catch(function(response){
            MessageService.data.message = 'Invalid login';
            if(response.data && response.data.errors){
              MessageService.data.message = response.data.errors[0];
            }
        });
      }

    }
})();
