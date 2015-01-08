
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
