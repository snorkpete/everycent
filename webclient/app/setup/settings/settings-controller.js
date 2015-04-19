
(function(){
  'use strict';

  angular
    .module('everycent.setup.settings')
    .controller('SettingsCtrl', SettingsCtrl);

  SettingsCtrl.$inject = ['MessageService', 'SettingsService', 'ModalService', 'FormService', 'StateService'];

  function SettingsCtrl(MessageService, SettingsService, ModalService, FormService, StateService){
    var vm = this;
    vm.isEditMode = true;
    vm.state = StateService; // page state handler
    vm.settings = {};
    vm.saveSettings = saveSettings;
    vm.switchToEditMode = switchToEditMode;
    vm.cancelEdit = cancelEdit;

    activate();

    function activate(){
      refreshSettings();
    }

    function refreshSettings(){
      SettingsService.getSettings().then(function(settings){
        vm.settings = settings;
      });
    }

    function switchToEditMode(){
      vm.isEditMode = true;
    }

    function saveSettings(settings, form){
      SettingsService.saveSettings(settings).then(function(response){
        refreshSettings();
        MessageService.setMessage('Settings saved.');
        //FormService.resetForm(institution, form, ['name']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Settings not saved.');
        return false;
      });
    }


    function cancelEdit(){
      vm.settings = {};
      refreshSettings();
    }

  }
})();
