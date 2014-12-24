
(function(){
  'use strict';

  angular
    .module('everycent.institutions')
    .controller('InstitutionsCtrl', InstitutionsCtrl);

  InstitutionsCtrl.$inject = ['MessageService', 'InstitutionsService'];

  function InstitutionsCtrl(MessageService, InstitutionsService){
    var vm = this;
    vm.institutions = [];
    vm.addInstitution = addInstitution;

    activate();

    function activate(){
      loadInstitutions();
    }

    function loadInstitutions(){
      InstitutionsService.getInstitutions().then(function(data){
        vm.institutions = data;
      });
    }

    function addInstitution(institution){
      InstitutionsService.addInstitution(institution);
      MessageService.setMessage('Institution "' + institution.name + '" added successfully.');
    }
  }
})();
