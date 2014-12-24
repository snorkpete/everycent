angular.module('everycent').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/common/ec-message-directive.html',
    "<div class=message-container><div class=\"message alert alert-success\" ng-show=vm.ui.message>{{ vm.ui.message }}</div><div class=\"message alert alert-danger\" ng-show=vm.ui.errorMessage><span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=true></span> {{ vm.ui.errorMessage }}</div><div class=\"message alert alert-warning\" ng-show=vm.ui.warningMessage>{{ vm.ui.warningMessage }}</div></div>"
  );


  $templateCache.put('app/home/home.html',
    "<h2>Welcome to EveryCent!!!</h2>"
  );


  $templateCache.put('app/institutions/list.html',
    "<md-toolbar class=md-teal-theme><div class=md-toolbar-tools><h3>Institutions</h3></div></md-toolbar><md-content><md-list><md-item ng-repeat=\"institution in vm.institutions\"><div class=md-tile-content>{{ institution.name }}</div></md-item></md-list><md-card><h4>Add an Institution</h4><form class=basic-form ng-submit=vm.addInstitution(institution)><div class=row><md-text-float label=\"Institution Name\" ng-model=institution.name></md-text-float></div><div class=row><md-button type=submit class=\"md-raised md-primary\">Add Institution</md-button></div></form></md-card></md-content>"
  );


  $templateCache.put('app/menu/ec-navbar-directive.html',
    "<nav class=\"navbar navbar-fixed-top navbar-inverse\" role=navigation><div class=container><div class=navbar-header><button ng-init=\"navCollapsed = true\" ng-click=\"navCollapsed = !navCollapsed\" type=button class=navbar-toggle><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a class=navbar-brand ng-click=\"vm.goToPage('home')\">EveryCent</a></div><div collapse=navCollapsed class=\"collapse navbar-collapse\" id=bs-example-navbar-collapse-1><ul class=\"nav navbar-nav navbar-right\"><li><p class=navbar-text>Hi, <strong>{{vm.userName}}</strong></p></li><li><a ng-click=vm.logout()>Log Out</a></li></ul><ul id=main-menu class=\"nav navbar-nav\"><li ng-class=\"{ active: vm.currentPage === 'institutions' }\"><a ng-click=\"vm.goToPage('institutions')\">Institutions</a></li></ul></div></div></nav>"
  );


  $templateCache.put('app/security/sign-in.html',
    "<form ng-submit=vm.signIn(vm.loginForm) role=form><div class=form-group><label>email</label><input type=email name=email ng-model=vm.loginForm.email required=required class=\"form-control\"></div><div class=form-group><label>password</label><input type=password name=password ng-model=vm.loginForm.password required=required class=\"form-control\"></div><button type=submit class=\"btn btn-primary btn-lg\">Sign In</button></form>"
  );

}]);
