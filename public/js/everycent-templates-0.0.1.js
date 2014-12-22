angular.module('everycent').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/common/ec-message-directive.html',
    "<div><div class=\"message alert alert-success\" ng-show=vm.ui.message>{{ vm.ui.message }}</div><div class=\"message alert alert-danger\" ng-show=vm.ui.errorMessage><span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=true></span> {{ vm.ui.errorMessage }}</div><div class=\"message alert alert-warning\" ng-show=vm.ui.warningMessage>{{ vm.ui.warningMessage }}</div></div>"
  );


  $templateCache.put('app/home/home.html',
    "<h2>Welcome to EveryCent!!!</h2>"
  );


  $templateCache.put('app/institutions/list.html',
    "<ul ng-repeat=\"institution in vm.institutions\"><li>{{ institution.name }}</li></ul><ec-message>Heelo</ec-message><button ng-click=\"vm.testMessage('success')\">Test Messages</button> <button ng-click=\"vm.testMessage('warning')\">Test Messages</button> <button ng-click=\"vm.testMessage('error')\">Test Messages</button>"
  );


  $templateCache.put('app/security/sign-in.html',
    "<form ng-submit=vm.signIn(vm.loginForm) role=form><div class=form-group><label>email</label><input type=email name=email ng-model=vm.loginForm.email required=required class=\"form-control\"></div><div class=form-group><label>password</label><input type=password name=password ng-model=vm.loginForm.password required=required class=\"form-control\"></div><button type=submit class=\"btn btn-primary btn-lg\">Sign In</button></form>"
  );

}]);
