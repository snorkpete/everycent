angular.module('everycent').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/common/ec-form-field-directive.html',
    "<div class=form-group ng-class=\"{'has-error': vm.error.server }\"><label class=\"col-xs-{{ vm.labelWidth }} control-label\">{{ vm.label }}</label><div class=\"col-xs-{{ vm.fieldWidth }}\"><input type=\"{{ vm.type }}\" name=vm.fieldName ng-model=vm.model class=form-control ng-required=vm.isRequired placeholder=\"{{ vm.placeholder }}\"><p class=help-block>{{ vm.error.server }}</p></div></div>"
  );


  $templateCache.put('app/common/ec-icon-directive.html',
    "<span class=\"glyphicon glyphicon-{{ vm.type }}\" aria-hidden=true></span>"
  );


  $templateCache.put('app/common/ec-message-directive.html',
    "<div class=message-container><div class=\"message alert alert-success\" ng-show=vm.ui.message>{{ vm.ui.message }} <span ng-click=vm.remove() class=\"pull-right pointer\"><ec-icon type=remove></ec-icon></span></div><div class=\"message alert alert-danger\" ng-show=vm.ui.errorMessage><span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=true></span> {{ vm.ui.errorMessage }} <span ng-click=vm.remove() class=\"pull-right pointer\"><ec-icon type=remove></ec-icon></span></div><div class=\"message alert alert-warning\" ng-show=vm.ui.warningMessage>{{ vm.ui.warningMessage }} <span ng-click=vm.remove() class=\"pull-right pointer\"><ec-icon type=remove></ec-icon></span></div></div>"
  );


  $templateCache.put('app/common/ec-panel-directive.html',
    "<div class=\"panel panel-{{ vm.type }}\"><div class=panel-heading>{{ vm.title }}</div><div class=panel-body ng-transclude></div></div>"
  );


  $templateCache.put('app/common/modal.html',
    "<div class=modal-header><h3>{{vm.options.headerText}}</h3></div><div class=modal-body><p>{{vm.options.bodyText}}</p></div><div class=modal-footer><button type=button class=\"btn btn-danger\" ng-click=vm.options.cancel()>{{vm.options.cancelButtonText}}</button> <button class=\"btn btn-primary\" ng-click=vm.options.confirm();>{{vm.options.confirmButtonText}}</button></div>"
  );


  $templateCache.put('app/home/home.html',
    "<h2>Welcome to EveryCent!!!</h2>"
  );


  $templateCache.put('app/institutions/list.html',
    "<div class=row><div class=col-xs-12><h2>Banking Institutions</h2></div></div><div class=row><div class=col-xs-12><ul class=list-group><li class=list-group-item ng-repeat=\"institution in vm.institutions\">{{ $index + 1 }}. {{ institution.name }} <span ng-click=vm.deleteInstitution(institution) class=\"text-danger pull-right pointer\"><ec-icon type=remove></ec-icon></span></li></ul></div></div><div class=row><div class=col-xs-1 ng-show=\"vm.state.is('institutions')\"><button class=\"btn btn-primary\" ng-click=\"vm.state.goToState('institutions.new')\">Add New Institution</button></div><div class=col-xs-1 ng-show=\"vm.state.is('institutions.new')\"><button class=\"btn btn-default\" ng-click=\"vm.state.goToState('institutions')\">Cancel</button></div></div><br><ui-view></ui-view>"
  );


  $templateCache.put('app/institutions/new.html',
    "<div class=row><div class=col-xs-12><form class=form-horizontal novalidate name=vm.institutionForm ng-submit=\"vm.addInstitution(vm.institution, vm.institutionForm)\"><ec-panel type=primary title=\"Add an Institution\"><ec-form-field label=Name label-width=2 name=name error=vm.institutionForm.name.$error field-width=6 placeholder=\"Institution's name\" type=text ng-required=true ng-model=vm.institution.name></ec-form-field><div class=form-group><div class=\"col-xs-offset-2 col-xs-6\"><button type=submit class=\"btn btn-primary\">Add Institution</button></div></div></ec-panel></form></div></div>"
  );


  $templateCache.put('app/menu/ec-navbar-directive.html',
    "<nav class=\"navbar navbar-fixed-top navbar-inverse\" role=navigation><div class=container><div class=navbar-header><button ng-init=\"navCollapsed = true\" ng-click=\"navCollapsed = !navCollapsed\" type=button class=navbar-toggle><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a class=navbar-brand ng-click=\"vm.goToPage('home')\">EveryCent</a></div><div collapse=navCollapsed class=\"collapse navbar-collapse\" id=bs-example-navbar-collapse-1><ul class=\"nav navbar-nav navbar-right\"><li><p class=navbar-text>Hi, <strong>{{vm.userName}}</strong></p></li><li><a ng-click=vm.logout()>Log Out</a></li></ul><ul id=main-menu class=\"nav navbar-nav\"><li ng-class=\"{ active: vm.currentPage === 'institutions' }\"><a ng-click=\"vm.goToPage('institutions')\">Institutions</a></li></ul></div></div></nav>"
  );


  $templateCache.put('app/security/sign-in.html',
    "<form ng-submit=vm.signIn(vm.loginForm) role=form><div class=form-group><label>email</label><input type=email name=email ng-model=vm.loginForm.email required=required class=\"form-control\"></div><div class=form-group><label>password</label><input type=password name=password ng-model=vm.loginForm.password required=required class=\"form-control\"></div><button type=submit class=\"btn btn-primary btn-lg\">Sign In</button></form>"
  );

}]);
