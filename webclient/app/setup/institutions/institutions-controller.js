
(function(){
  'use strict';

  angular
    .module('everycent.setup.institutions')
    .controller('InstitutionsCtrl', InstitutionsCtrl);

  InstitutionsCtrl.$inject = ['MessageService', 'InstitutionsService', 'ModalService', 'FormService', 'StateService'];

  function InstitutionsCtrl(MessageService, InstitutionsService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.institution = {};
    vm.institutions = [];
    vm.addInstitution = addInstitution;
    vm.selectInstitutionForUpdate = selectInstitutionForUpdate;
    vm.updateInstitution = updateInstitution;
    vm.cancelEdit = cancelEdit;
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
        refreshInstitutionList();
        MessageService.setMessage('Institution "' + institution.name + '" added successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(institution, form, ['name']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Institution not saved.');
        return false;
      });
    }

    function selectInstitutionForUpdate(institution){
      vm.institution = institution;
      StateService.goToState('institutions.edit');
    }

    function updateInstitution(institution, form){
      institution.save().then(function(response){
        refreshInstitutionList();
        MessageService.setMessage('Institution "' + institution.name + '" updated successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(institution, form, ['name']);
        vm.institution = {};
        StateService.goToState('institutions');

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Institution not updated.');
        return false;
      });
    }

    function cancelEdit(){
      vm.institution = {};
      refreshInstitutionList();
      StateService.goToState('institutions');
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
