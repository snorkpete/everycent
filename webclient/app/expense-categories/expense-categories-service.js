(function(){
  'use strict';

  angular
    .module('everycent.expense-categories')
    .factory('ExpenseCategoriesService', ExpenseCategoriesService);

    ExpenseCategoriesService.$inject = ['$http', 'Restangular'];
    function ExpenseCategoriesService($http, Restangular){
      var service = {
        getExpenseCategories: getExpenseCategories,
        newCategory: newCategory
      };

      var baseAll = Restangular.all('expense_categories');
      return service;

      function getExpenseCategories(){
        return baseAll.getList();
      }

      function newCategory(){
        var newCategory = {
          name: '',
          percentage: 0
        };
        return Restangular.restangularizeElement('', newCategory, 'expense_categories');
      }
    }
})();
