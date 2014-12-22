
(function(){
  angular
    .module('everycent.common', [])
    .factory('MessageService', MessageService);

  MessageService.$inject = [];

  function MessageService(){
    var data = {};
    var service = {
      data: data
    }

    return service;
  }
})();
