
(function(){
  angular.module('everycent.common', []);
})();
;
(function(){
  angular
    .module('everycent.institutions', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('institutions', {
        url: '/institutions',
        templateUrl: 'app/institutions/list.html',
        controller: 'InstitutionsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();
;
(function(){
  angular
    .module('everycent.security', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('sign_in', {
        url: '/sign_in',
        templateUrl: 'app/security/sign-in.html',
        controller: 'SignInCtrl as vm'
      });
    ;
  }
})();
;
(function(){
  'use strict';

  // Module definitions
  angular.module('everycent', [
    'ui.router',
    'ngCookies',
    'ng-token-auth',
    'everycent.common',
    'everycent.security',
    'everycent.institutions'
    ]);

  angular
    .module('everycent')
    .config(AppConfig)
    .controller('MainCtrl', MainCtrl);

  AppConfig.$inject = ['$authProvider'];
  function AppConfig($authProvider){
    $authProvider.configure({
      apiUrl: ''
    });
  }

  MainCtrl.$inject = ['MessageService'];
  function MainCtrl(MessageService){
    var main = this;

    main.ui = MessageService.data;
  }
})();

;;
(function(){
  'use strict';

  angular
    .module('everycent')
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider', '$urlRouterProvider'];

  function RouteConfiguration($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('home', {
        url: '/', 
        templateUrl: 'app/home/home.html',
        controller: [function(){ }]
      })
      .state('all', {
        abstract: true,
        resolve: {
          auth: ['$auth',function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('all.institutions', {
        url: '/institutions',
        templateUrl: 'app/institutions/list.html',
        controller: 'InstitutionsCtrl as vm'
      })
    ;

    // if none of the above match, then redirect to the 'home' state
    $urlRouterProvider.otherwise('/');
  }

})();
;
(function(){
  angular
    .module('everycent.common', [])
    .factory('MessageService', MessageService);

  MessageService.$inject = [];

  function MessageService(){
    var data = {};
    var service = {
      data: data
    }

    return service;
  }
})();
;
(function(){
  angular
    .module('everycent.institutions')
    .controller('InstitutionsCtrl', InstitutionsCtrl);

  InstitutionsCtrl.$inject = ['$http'];

  function InstitutionsCtrl($http){
    var vm = this;

    vm.institutions = [ 'Scotia', 'Rbc', 'other'];

    $http.get('/institutions').then(function(response){
      vm.institutions = response.data;
    });
  }
})();
;(function(){
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
