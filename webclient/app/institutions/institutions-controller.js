
(function(){
  'use strict';

  angular
    .module('everycent.institutions')
    .controller('InstitutionsCtrl', InstitutionsCtrl);

  InstitutionsCtrl.$inject = ['$http', 'MessageService'];

  function InstitutionsCtrl($http, MessageService){
    var vm = this;

    vm.institutions = [ 'Scotia', 'Rbc', 'other'];
    vm.testMessage = function(message){
      if(message === 'success'){
        MessageService.setMessage(message);
      }
      if(message === 'warning'){
        MessageService.setWarningMessage(message);
      }
      if(message === 'error'){
        MessageService.setErrorMessage(message);
      }
    }

    $http.get('/institutions').then(function(response){
      vm.institutions = response.data;
    });
  }
})();
