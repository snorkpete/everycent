angular.module('everycent').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/home/home.html',
    "<h2>Welcome to EveryCent!!!</h2>"
  );


  $templateCache.put('app/institutions/list.html',
    "<ul><li>Scotia</li><li>Scotia</li><li>Scotia</li></ul>"
  );

}]);
