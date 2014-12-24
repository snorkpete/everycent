
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
      InstitutionsService.getInstitutions().then(function(institutions){
        vm.institutions = institutions;
      });
    }

    function addInstitution(institution){
      InstitutionsService.addInstitution(institution).then(function(response){
        loadInstitutions();
        MessageService.setMessage('Institution "' + institution.name + '" added successfully.');
      });
    }
  }
})();
