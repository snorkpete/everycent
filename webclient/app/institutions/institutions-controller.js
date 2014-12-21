
(function(){
  angular
    .module('everycent.institutions')
    .controller('InstitutionsCtrl', InstitutionsCtrl);

  InstitutionsCtrl.$inject = ['$http'];

  function InstitutionsCtrl($http){
    var vm = this;

    vm.institutions = [ 'Scotia', 'Rbc', 'other'];

    $http.get('/institutions').then(function(response){
      vm.institutions = response.data;
    });
  }
})();
