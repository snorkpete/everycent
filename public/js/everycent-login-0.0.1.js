
(function(){
  angular.module('everycent.common', []);
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
    }
    return directive;

    function controller(){
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
    }

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
        var vm = this;
        vm.options = options;
        modalFix();

        vm.options.confirm = function(){
          modalInstance.close('ok');
        }

        vm.options.cancel = function(){
          modalInstance.dismiss('cancel');
        }
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
    .factory('StateService', StateService);

  StateService.$inject = ['$state'];
  function StateService($state){
    var service = {
      goToState: goToState,
      is: is
    };
    return service;

    function goToState(state, params){
      if(params){
        $state.go(state, params);
      }else{
        $state.go(state);
      }
    }

    function is(state){
      return $state.is(state);
    }

  }
})();
