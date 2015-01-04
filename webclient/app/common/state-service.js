
(function(){
  'use strict';

  angular
    .module('everycent.common')
    .factory('StateService', StateService);

  StateService.$inject = ['$state', '$stateParams', 'MessageService'];
  function StateService($state, $stateParams, MessageService){
    var service = {
      goToState: goToState,
      is: is,
      getParam: getParam
    };
    return service;

    function goToState(state, params){
      if(params){
        $state.go(state, params);
      }else{
        $state.go(state);
      }

      MessageService.clearMessage();
    }

    function is(state){
      return $state.is(state);
    }

    function getParam(param){
      return $stateParams[param];
    }

  }
})();
