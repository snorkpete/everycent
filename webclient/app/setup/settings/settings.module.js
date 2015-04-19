
(function(){
  angular
    .module('everycent.setup.settings', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/setup/settings/form.html',
        controller: 'SettingsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
