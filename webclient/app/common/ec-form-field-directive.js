
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
        modelType:'@',
        isRequired: '=ngRequired',
        // Accept the ngModel attribute and bind it to scope.model
        // then, we can use ng model in the input element in the directive template
        model:'=ngModel',
        error:'=',
        name:'=fieldName'
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
      vm.lookup = {
        institutions: [ 
          { id: 5, name: 'Scotia' },
          { id: 8, name: 'RBTT' },
          { id: 7, name: 'Republic' },
          { id: 6, name: 'Unit Trust' }
        ],
        users:[
          { id: 3, name: 'Kion Stephen' },
          { id: 4, name: 'Patrice Stephen' }
        ]
      };

    }
  }
})();
