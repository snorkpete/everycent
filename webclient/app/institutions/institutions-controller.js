
(function(){
  'use strict';

  angular
    .module('everycent.institutions')
    .controller('InstitutionsCtrl', InstitutionsCtrl);

  InstitutionsCtrl.$inject = ['MessageService', 'InstitutionsService', 'ModalService', 'ErrorService'];

  function InstitutionsCtrl(MessageService, InstitutionsService, ModalService, ErrorService){
    var vm = this;
    vm.institution = {};
    vm.institutions = [];
    vm.addInstitution = addInstitution;
    vm.deleteInstitution = deleteInstitution;

    activate();

    function activate(){
      refreshInstitutionList();
    }

    function refreshInstitutionList(){
      InstitutionsService.getInstitutions().then(function(institutions){
        vm.institutions = institutions;
      });
    }

    function addInstitution(institution, form){
      InstitutionsService.addInstitution(institution).then(function(response){
        // TODO:  hack - need to find a better way of clearing the name
        refreshInstitutionList();
        MessageService.setMessage('Institution "' + institution.name + '" added successfully.');
        institution.name = '';

      }, function(errorResponse){
        ErrorService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Institution not saved.');
        return false;
      });
    }

    function deleteInstitution(institution){
      var modalOptions = {
        headerText: 'Delete this institution?',
        bodyText: 'Are you sure you want to delete the institution: ' + institution.name+ '?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }

      ModalService.show(modalOptions).then(function(){

        institution.remove().then(function(){
          refreshInstitutionList();
          MessageService.setMessage('Institution deleted.');
        }).catch(function(){
          MessageService.setErrorMessage('Error deleting.');
        });

      },function(){
        MessageService.setErrorMessage('Delete cancelled.'); // cancel clicked
      });

    }
  }
})();
