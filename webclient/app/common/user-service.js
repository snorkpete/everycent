
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
