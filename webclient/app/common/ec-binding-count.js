
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecBindingCount', ecBindingCount);

  function ecBindingCount(){
    var directive = {
      restrict:'E',
      template: '<button class="btn btn-info btn-xs" ng-click="vm.updateBindingCount()">{{ vm.total }} bindings.</button>',
      scope: {
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };
    return directive;
  }


  controller.$inject = [];
  function controller(){
    /* jshint validthis: true */
    var vm = this;
    vm.updateBindingCount = updateBindingCount;

    function getScopeList(rs) {
        var scopeList = [];
        function traverseScope(s) {
            scopeList.push(s);
            if (s.$$nextSibling) {
                traverseScope(s.$$nextSibling);
            }
            if (s.$$childHead) {
                traverseScope(s.$$childHead);
            }
        }
        traverseScope(rs);
        return scopeList;
    }

    function updateBindingCount(){
      var scopes = getScopeList(angular.element(document.querySelectorAll("[ng-app]")).scope());
      vm.total = _.uniq(_.flatten(scopes.map(function(s) { return s.$$watchers; }))).length;
    }
  }
})();
