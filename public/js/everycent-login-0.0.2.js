
(function(){
  angular.module('everycent.common', []);
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('DateService', DateService);

  function DateService(){
    var service = {
      convertFromBankDateFormat: convertFromBankDateFormat
    };

    return service;

    function convertFromBankDateFormat(dateInBankDateFormat){
      if(!dateInBankDateFormat || !dateInBankDateFormat.match){
        return '';
      }

      var dateParts = dateInBankDateFormat.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if(dateParts.length != 4){
        return '';
      }

      return '' + dateParts[3] + '/' + dateParts[1] + '/' + dateParts[2];
    }
  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecAmountFormatted', ecAmountFormatted);

  ecAmountFormatted.$inject = [];
  function ecAmountFormatted(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/common/ec-amount-formatted-directive.html',
      scope: {
        amount: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };
    return directive;

    function controller(){
      /* jshint validthis: true */
      var vm = this;
    }
  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecAmountLabel', ecAmountLabel);

  ecAmountLabel.$inject = [];
  function ecAmountLabel(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/common/ec-amount-label-directive.html',
      scope: {
        type: '@',
        label: '@',
        amount: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };
    return directive;

    function controller(){
      /* jshint validthis: true */
      var vm = this;
      vm.labelClasses = labelClasses;

      function labelClasses(){
        var result = {};
        result['label-' + vm.type] = vm.amount >= 0;
        result['label-danger'] = vm.amount < 0;

        return result;
      }
    }
  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecAsDate', ecAsDate);

  ecAsDate.$inject = [];
  function ecAsDate(){
    var directive = {
      restrict:'A',
      require:'ngModel',
      link: link
    };
    return directive;

    function link(scope, element, attrs, ngModel){

      ngModel.$formatters.push(function(modelValue){
        return new Date(modelValue);
      });
      ngModel.$parsers.push(function(modelValue){
        return new Date(modelValue);
      });
    }
  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecAsDollars', ecAsDollars);

  ecAsDollars.$inject = ['ecToDollarsFilter'];
  function ecAsDollars(ecToDollarsFilter){
    var directive = {
      restrict:'A',
      require:'ngModel',
      link: link
    };
    return directive;

    function link(scope, element, attrs, ngModel){

      // add decimal places back to number when field loses focus
      element.on('blur', function(e){
        var value = element.val();
        element.val(Number(value).toFixed(2));
      });

      // convert cents in model to dollar amount with 2 dp for display
      ngModel.$formatters.push(function(modelValue){
        return (modelValue / 100).toFixed(2);
      });

      // update the model with the text input value, converted from dollars to cents
      ngModel.$parsers.push(function(viewValue){
        var number = Number(viewValue);
        return number * 100;
      });
    }
  }
})();

;

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
        listOf:'@',
        isRequired: '=ngRequired',
        // Accept the ngModel attribute and bind it to scope.model
        // then, we can use ng model in the input element in the directive template
        model:'=ngModel',
        change:'&ngChange',
        error:'=',
        name:'=fieldName'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };
    return directive;
  }


  controller.$inject = ['LookupService'];
  function controller(LookupService){
    /* jshint validthis: true */
    var vm = this;

    vm.labelWidth = 2;
    vm.fieldWidth = 10;

    if(vm.type === 'select'){
      LookupService.refreshList(vm.listOf).then(function(items){
        vm.items = items;
      });
    }
  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecIcon', ecIcon);

  function ecIcon(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/common/ec-icon-directive.html',
      scope: {
        type: '@'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };
    return directive;

    function controller(){
      /* jshint validthis: true */
      var vm = this;
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
    };

    return directive;
  }

  controller.$inject = ['MessageService'];
  function controller(MessageService){
    var vm = this;

    vm.ui = MessageService.getMessageData();
    vm.remove = MessageService.clearMessage;
  }
})();

;

(function(){
  'use strict';

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
    };
    return directive;

    function controller(){
      /* jshint validthis: true */
      var vm = this;
      vm.type = 'default';
    }
  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .filter('ecToDollars', ecToDollars);

  function ecToDollars(){
    return function(input){
      return (input / 100).toFixed(2);
    };
  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .directive('ecValidateWithinBudget', ecValidateWithinBudget);

  ecValidateWithinBudget.$inject = [];
  function ecValidateWithinBudget(){
    var directive = {
      restrict:'A',
      require:'ngModel',
      link: link,
      scope:{
        budget: '=',
        transaction: '='
      }
    };
    return directive;

    function link(scope, element, attrs, ngModel){

      // do nothing if we dont have scope and transaction to work with
      if(!scope.budget || !scope.transaction){
        return;
      }

      ngModel.$validators.withinBudget = function(modelValue){

        // don't validate if the transaction is deleted
        // --------------------------------------------
        if(scope.transaction.deleted){
          return true;
        }

        return modelValue >= scope.budget.start_date && modelValue <= scope.budget.end_date;
      };
    }
  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('FormService', FormService);

  FormService.$inject = [];
  function FormService(){
    var service = {
      setErrors: setErrors,
      resetForm: resetForm
    };
    return service;

    function setErrors(form, errorData){
      // take every error found and add it to the corresponding form
      // -----------------------------------------------------------
      Object.keys(errorData).forEach(function(field){
        form[field].$error.server = errorData[field][0];
      });
    }

    /**
     *  Clear the model and reset the errors
     *  for each field listed in fields
     */
    function resetForm(model, form, fields){
      fields.forEach(function(field){

        // reset the model's value
        model[field] = '';

        // reset the form's error status
        if(form[field]){
          form[field].$error = {};
        }
      });
    }

  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('LookupService', LookupService);

  LookupService.$inject = ['Restangular', '$q'];
  function LookupService(Restangular, $q){
    var dataCache = { };
    var promiseCache = { };

    var service = {
      clear: clear,
      refreshList: refreshList
    };
    return service;

    function refreshList(list, params, ignoreCache){
      //TODO: to fix so that we cache based on params
      if(ignoreCache){

        // we need to convert the restangular objects to plain objects,
        // because when used in ngOptions, the restangular objects are generating extra options
        return Restangular.all(list).getList(params).then(function(serverList){
          return _mapRestangularObjectListToSimpleObjectList(serverList);
        });
      }

      return $q.when(dataCache[list] || promiseCache[list] || _refreshFromServer(list, params));

      function _refreshFromServer(list, params){
        promiseCache[list] = Restangular.all(list).getList(params).then(function(listValues){

          // we need to convert the restangular objects to plain objects,
          // because when used in ngOptions, the restangular objects are generating extra options
          var simpleListValues = _mapRestangularObjectListToSimpleObjectList(listValues);
          dataCache[list] = simpleListValues;
          return simpleListValues;
        });

        return promiseCache[list];
      }
    }

    function clear(){
      dataCache = {};
      promiseCache = {};
    }

    // TODO:  this is a temporary fix for the ng-options bug
    // the restangular object array contains extra properties/functions
    // that are not needed for our lookup lists, but are iterated over
    // when the restangularized array is used in ng-options
    // So, we'll create a new array without these extra restangular properties
    function _mapRestangularObjectListToSimpleObjectList(restangularObjectList){
      var result = [];
      restangularObjectList.forEach(function(obj){
        result.push(obj);
      });

      return result;
    }
  }
})();

;

var x = 200;
(function(){
  angular
    .module('everycent.common')
    .factory('MessageService', MessageService);

  MessageService.$inject = ['toastr'];

  function MessageService(toastr){
    var data = {};
    var service = {
      getMessageData: getMessageData,
      setMessage: setMessage,
      setErrorMessage: setErrorMessage,
      setWarningMessage: setWarningMessage,
      clearMessage: clearMessage
    };

    return service;

    function getMessageData(){
      return data;
    }

    function setMessage(message){
      clearMessage();
      data.message = message;
      toastr.success(message);
    }

    function setErrorMessage(message){
      clearMessage();
      data.errorMessage = message;
      toastr.error(message);
    }

    function setWarningMessage(message){
      clearMessage();
      data.warningMessage = message;
      toastr.warning(message);
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
    .module('everycent.common')
    .factory('ModalService', ModalService);

  ModalService.$inject = ['$modal', '$document'];
  function ModalService($modal, $document){
    var service = {
      show: show
    };
    return service;

    function show(options){
      var modalInstance = $modal.open({
        templateUrl: 'app/common/modal.html',
        backdrop:'static',
        controller: modalController,
        controllerAs: 'vm'
      });

      return modalInstance.result;

      function modalController(){
        /* jshint validthis: true */
        var vm = this;
        vm.options = options;
        modalFix();

        vm.options.confirm = function(){
          modalInstance.close('ok');
        };

        vm.options.cancel = function(){
          modalInstance.dismiss('cancel');
        };
      }
    }

    /** TODO: this is a temporary fix for a bootstrap 3.1.1 issue
     * Should be removed once that issue is fixed */
    function modalFix(){
      setTimeout(function(){
        angular.element($document[0].querySelectorAll('div.modal-backdrop'))
             .css('height','1000px');
            }, 100);
    }
  }
})();

;
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('ReferenceService', ReferenceService);

    ReferenceService.$inject = [];
    function ReferenceService(){
      var service = {
        updateReferenceId: updateReferenceId
      };

      return service;

      function updateReferenceId(model, referenceName){
        model[referenceName + '_id'] = model[referenceName].id;
      }

    }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('StateService', StateService);

  StateService.$inject = ['$state', '$stateParams', 'MessageService'];
  function StateService($state, $stateParams, MessageService){
    var service = {
      goToState: goToState,
      go: go,
      is: is,
      getParam: getParam
    };
    return service;

    function goToState(state, params){
      MessageService.clearMessage();
      return $state.go(state, params);
    }

    function go(state, params){
      return goToState(state, params);
    }

    function is(state){
      return $state.is(state);
    }

    function getParam(param){
      return $stateParams[param];
    }

  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('UserService', UserService);

  UserService.$inject = [];
  function UserService(){
    var data = {
      user: {}
    };
    var service = {
      getUser: getUser,
      setupUser: setupUser,
      clear: clear
    };
    return service;

    function getUser(){
      return data.user;
    }

    function setupUser(userDetails){
      data.user.name = userDetails.first_name + ' ' + userDetails.last_name;
      data.user.email = userDetails.email;
    }

    function clear(){
      data.user.name = '';
      data.user.email = '';
    }

  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('UtilService', UtilService);

  UtilService.$inject = [];
  function UtilService(){
    var service = {
      total: total
    };
    return service;

    function total(items, fieldToSum){
      return _.reduce(items, function(sum, item){
        if(item.deleted){
          return sum;
        }else{
          return sum + item[fieldToSum];
        }
      }, 0);
    }
  }
})();
