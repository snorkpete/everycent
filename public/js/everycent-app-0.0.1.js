
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
  angular.module('everycent.menu', ['everycent.common']);

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
    'ui.bootstrap',
    'ui.router',
    'ngCookies',
    'ng-token-auth',
    'everycent.common',
    'everycent.menu',
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
    main.currentPage = 'institutions';
    main.user = {
      name: 'Kion Stephen'
    };
  }
})();


;
;
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
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecFormField', ecFormField);

  function ecFormField(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/common/ec-form-field-directive.html',
      scope: {
        label:'@',
        type:'@',
        labelWidth:'@',
        fieldWidth:'@',
        placeholder:'@',
        isRequired: '=ngRequired',
        // Accept the ngModel attribute and bind it to scope.model
        // then, we can use ng model in the input element in the directive template
        model:'=ngModel'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    }
    return directive;
    function controller(){
      var vm = this;

      vm.labelWidth = 2;
      vm.fieldWidth = 10;
    }
  }
})();

;

(function(){
  angular
    .module('everycent.common')
    .directive('ecMessage', ecMessage);

  function ecMessage(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/common/ec-message-directive.html',
      scope: {},
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    }

    return directive;
  }

  controller.$inject = ['MessageService'];
  function controller(MessageService){
    var vm = this;

    vm.ui = MessageService.getMessageData();
  }
})();

;

(function(){
  angular
    .module('everycent.common')
    .directive('ecPanel', ecPanel);

  function ecPanel(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/common/ec-panel-directive.html',
      transclude: true,
      scope: {
        type: '@',
        title: '@'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    }
    return directive;
    function controller(){
      var vm = this;
      vm.type = 'default';
    }
  }
})();

;

(function(){
  angular
    .module('everycent.common')
    .factory('MessageService', MessageService);

  MessageService.$inject = [];

  function MessageService(){
    var data = {};
    var service = {
      getMessageData: getMessageData,
      setMessage: setMessage,
      setErrorMessage: setErrorMessage,
      setWarningMessage: setWarningMessage,
      clearMessage: clearMessage
    }

    return service;

    function getMessageData(){
      return data;
    }

    function setMessage(message){
      clearMessage();
      data.message = message;
    }

    function setErrorMessage(message){
      clearMessage();
      data.errorMessage = message;
    }

    function setWarningMessage(message){
      clearMessage();
      data.warningMessage = message;
    }

    function clearMessage(){
      data.message = '';
      data.errorMessage = '';
      data.warningMessage = '';
    }
  }
})();

;

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

;
(function(){
  'use strict';

  angular
    .module('everycent.institutions')
    .factory('InstitutionsService', InstitutionsService);

    InstitutionsService.$inject = ['$http'];
    function InstitutionsService($http){
      var service = {
        getInstitutions: getInstitutions,
        addInstitution: addInstitution
      }

      return service;

      function getInstitutions(){
        return $http.get('/institutions').then(function(response){
          return response.data;
        });
      }

      function addInstitution(institution){
        alert('test');
      }

    }
})();

;

(function(){
  angular
    .module('everycent.menu')
    .directive('ecNavbar', ecNavbar);

  function ecNavbar(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/menu/ec-navbar-directive.html',
      scope: {
        userName: '=',
        currentPage: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    }

    return directive;
  }

  controller.$inject = ['MessageService', '$state'];
  function controller(MessageService, $state){
    var vm = this;

    vm.goToPage = goToPage;
    vm.logout = logout;

    function goToPage(page){
      $state.go(page);
      vm.currentPage = page;
      MessageService.clearMessage();
    }

    function logout(){
      MessageService.setErrorMessage('Logout not yet implemented.');
    }
  }
})();

;
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
        $auth.submitLogin(params).then(function(response){

            MessageService.setMessage('Logged in successfully.');
            $state.go('institutions');

          }).catch(function(response){

            MessageService.setErrorMessage('Invalid login');
            if(response.data && response.data.errors){
              MessageService.setErrorMessage(response.data.errors[0]);
            }

            return true; // handled the error, so return true
        });
      }

    }
})();
