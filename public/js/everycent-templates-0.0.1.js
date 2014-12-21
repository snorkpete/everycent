angular.module('everycent').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/home/home.html',
    "<h2>Welcome to EveryCent!!!</h2>"
  );


  $templateCache.put('app/institutions/list.html',
    "<ul ng-repeat=\"institution in vm.institutions\"><li>{{ institution.name }}</li></ul>"
  );

}]);
