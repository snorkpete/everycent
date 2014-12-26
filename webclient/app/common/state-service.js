
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
