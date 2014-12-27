(function(){
  'use strict';

  angular
    .module('everycent.allocation-categories')
    .factory('AllocationCategoriesService', AllocationCategoriesService);

    AllocationCategoriesService.$inject = ['$http', 'Restangular'];
    function AllocationCategoriesService($http, Restangular){
      var service = {
        getAllocationCategories: getAllocationCategories,
        newCategory: newCategory
      };

      var baseAll = Restangular.all('allocation_categories');
      return service;

      function getAllocationCategories(){
        return baseAll.getList();
      }

      function newCategory(){
        var newCategory = {
          name: '',
          percentage: 0
        };
        return Restangular.restangularizeElement('', newCategory, 'allocation_categories');
      }
    }
})();
