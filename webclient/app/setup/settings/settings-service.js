(function(){
  'use strict';

  angular
    .module('everycent.setup.settings')
    .factory('SettingsService', SettingsService);

    SettingsService.$inject = ['$http', 'Restangular'];
    function SettingsService($http, Restangular){
      var service = {
        getSettings: getSettings,
        saveSettings: saveSettings
      };

      var baseAll = Restangular.all('settings');
      return service;

      function getSettings(){
        return baseAll.customGET('/');
      }

      function saveSettings(setting){
        return baseAll.post(setting);
      }
    }
})();
