
(function(){
  angular
    .module('everycent.allocation-categories', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('allocation-categories', {
        url: '/allocation-categories',
        templateUrl: 'app/allocation-categories/list.html',
        controller: 'AllocationCategoriesCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
    ;
  }
})();

;

(function(){
  angular
    .module('everycent.bank-accounts', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('bank-accounts', {
        url: '/bank-accounts',
        templateUrl: 'app/bank-accounts/list.html',
        controller: 'BankAccountsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('bank-accounts.new', {
        url: '/bank-accounts/new',
        templateUrl: 'app/bank-accounts/new.html'
      })
      .state('bank-accounts.edit', {
        url: '/bank-accounts/edit',
        templateUrl: 'app/bank-accounts/edit.html'
      })
    ;
  }
})();

;

(function(){
  angular.module('everycent.common', []);
})();

;

(function(){
  angular
    .module('everycent.institutions', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('institutions', {
        url: '/institutions',
        templateUrl: 'app/institutions/list.html',
        controller: 'InstitutionsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('institutions.new', {
        url: '/institutions/new',
        templateUrl: 'app/institutions/new.html'
      })
      .state('institutions.edit', {
        url: '/institutions/edit',
        templateUrl: 'app/institutions/edit.html'
      })
    ;
  }
})();

;

(function(){
  angular.module('everycent.menu', ['everycent.common']);

})();

;

(function(){
  angular
    .module('everycent.recurring-allocations', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('recurring-allocations', {
        url: '/recurring-allocations',
        templateUrl: 'app/recurring-allocations/list.html',
        controller: 'RecurringAllocationsCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('recurring-allocations.new', {
        url: '/recurring-allocations/new',
        templateUrl: 'app/recurring-allocations/new.html'
      })
      .state('recurring-allocations.edit', {
        url: '/recurring-allocations/edit',
        templateUrl: 'app/recurring-allocations/edit.html'
      })
    ;
  }
})();

;

(function(){
  angular
    .module('everycent.recurring-incomes', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('recurring-incomes', {
        url: '/recurring-incomes',
        templateUrl: 'app/recurring-incomes/list.html',
        controller: 'RecurringIncomesCtrl as vm',
        resolve:{
          auth: ['$auth', function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('recurring-incomes.new', {
        url: '/recurring-incomes/new',
        templateUrl: 'app/recurring-incomes/new.html'
      })
      .state('recurring-incomes.edit', {
        url: '/recurring-incomes/edit',
        templateUrl: 'app/recurring-incomes/edit.html'
      })
    ;
  }
})();

;

(function(){
  angular
    .module('everycent.security', ['everycent.common'])
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider'];

  function RouteConfiguration($stateProvider){

    $stateProvider
      .state('sign_in', {
        url: '/sign_in',
        templateUrl: 'app/security/sign-in.html',
        controller: 'SignInCtrl as vm'
      });
    ;
  }
})();

;

(function(){
  'use strict';

  // Module definitions
  angular.module('everycent', [
    'ui.bootstrap',
    'ui.router',
    'ngCookies',
    'ngAnimate',
    'ng-token-auth',
    'restangular',
    'angular-loading-bar',
    'everycent.common',
    'everycent.menu',
    'everycent.security',
    'everycent.institutions',
    'everycent.bank-accounts',
    'everycent.recurring-incomes',
    'everycent.recurring-allocations',
    'everycent.allocation-categories'
    ]);

  angular
    .module('everycent')
    .config(AppConfig)
    .controller('MainCtrl', MainCtrl);

  AppConfig.$inject = ['$authProvider', '$compileProvider'];
  function AppConfig($authProvider, $compileProvider){
    $authProvider.configure({
      apiUrl: ''
    });

    //$compileProvider.debugInfoEnabled(false);
  }

  MainCtrl.$inject = ['MessageService'];
  function MainCtrl(MessageService){
    var main = this;

    main.ui = MessageService.data;
    main.currentPage = 'institutions';
    main.user = {
      name: 'Kion Stephen'
    };
  }
})();


;

(function(){
  'use strict';

  angular
    .module('everycent.allocation-categories')
    .controller('AllocationCategoriesCtrl', AllocationCategoriesCtrl);

  AllocationCategoriesCtrl.$inject = ['MessageService', 'AllocationCategoriesService', 'ModalService', 'FormService', 'StateService'];

  function AllocationCategoriesCtrl(MessageService, AllocationCategoriesService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.isEditMode = false;
    vm.allocationCategories = [];

    vm.switchToEditMode = switchToEditMode;
    vm.cancelEdit = cancelEdit;
    vm.newAllocationCategory = newAllocationCategory;
    vm.saveChanges = saveChanges;
    vm.markForDeletion = markForDeletion;
    vm.percentageTotal = percentageTotal;

    activate();

    function activate(){
      refreshAllocationCategoryList();
    }

    function refreshAllocationCategoryList(){
      return AllocationCategoriesService.getAllocationCategories().then(function(categories){
        vm.allocationCategories = categories;
      });
    }

    function switchToEditMode(){
      vm.isEditMode = true;
    }

    function cancelEdit(){
      refreshAllocationCategoryList();
      vm.isEditMode = false;
    }

    function newAllocationCategory(){
      var newCategory = AllocationCategoriesService.newCategory();
      vm.allocationCategories.push(newCategory);
    }

    function saveChanges(){
      vm.allocationCategories.forEach(function(category){
        if(category.deleted){
          category.remove();
        }else{
          category.save();
        }
      });

      refreshAllocationCategoryList().finally(function(){
        MessageService.setMessage('Changes saved.');
        vm.isEditMode = false;
      });
    }

    function markForDeletion(category, isDeleted){
      category.deleted = isDeleted;
    }


    function percentageTotal(){
      //return 200;

      return _.reduce(vm.allocationCategories, function(sum, category){
        if(category.deleted){
          return sum;
        }else{
          return sum + category.percentage;
        }
      }, 0);
    }
  }
})();

;
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

;
;
(function(){
  'use strict';

  angular
    .module('everycent')
    .config(RouteConfiguration);

  RouteConfiguration.$inject = ['$stateProvider', '$urlRouterProvider'];

  function RouteConfiguration($stateProvider, $urlRouterProvider){
    $stateProvider
      .state('home', {
        url: '/', 
        templateUrl: 'app/home/home.html',
        controller: [function(){ }]
      })
      .state('all', {
        abstract: true,
        resolve: {
          auth: ['$auth',function($auth){
            return $auth.validateUser();
          }]
        }
      })
      .state('all.institutions', {
        url: '/institutions',
        templateUrl: 'app/institutions/list.html',
        controller: 'InstitutionsCtrl as vm'
      })
    ;

    // if none of the above match, then redirect to the 'home' state
    $urlRouterProvider.otherwise('/');
  }

})();

;

(function(){
  'use strict';

  angular
    .module('everycent.bank-accounts')
    .controller('BankAccountsCtrl', BankAccountsCtrl);

  BankAccountsCtrl.$inject = ['MessageService', 'BankAccountsService', 'ModalService', 'FormService', 'StateService'];

  function BankAccountsCtrl(MessageService, BankAccountsService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.bankAccount = {};
    vm.bankAccounts = [];
    vm.addBankAccount = addBankAccount;
    vm.selectBankAccountForUpdate = selectBankAccountForUpdate;
    vm.updateBankAccount = updateBankAccount;
    vm.cancelEdit = cancelEdit;
    vm.deleteBankAccount = deleteBankAccount;

    vm.lookup = {
      institutions: [ 
        { id: 5, name: 'Scotia' },
        { id: 8, name: 'RBTT' },
        { id: 7, name: 'Republic' },
        { id: 6, name: 'Unit Trust' }
      ]
    };

    activate();

    function activate(){
      refreshBankAccountList();
    }

    function refreshBankAccountList(){
      BankAccountsService.getBankAccounts().then(function(bankAccounts){
        vm.bankAccounts = bankAccounts;
      });
    }

    function addBankAccount(bankAccount, form){
      BankAccountsService.addBankAccount(bankAccount).then(function(response){
        refreshBankAccountList();
        MessageService.setMessage('Bank Account "' + bankAccount.name + '" added successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(bankAccount, form, 
          ['name', 'account_type', 'account_no', 'opening_balance']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Bank Account not saved.');
        return false;
      });
    }

    function selectBankAccountForUpdate(bankAccount){
      vm.bankAccount = bankAccount;
      StateService.goToState('bank-accounts.edit');
    }

    function updateBankAccount(bankAccount, form){
      bankAccount.save().then(function(response){
        refreshBankAccountList();
        MessageService.setMessage('Bank Account "' + bankAccount.name + '" updated successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(bankAccount, form, ['name', 'account_type', 'institution_id', 'account_no', 'opening_balance' ]);
        vm.bankAccount = {};
        StateService.goToState('bank-accounts');

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Bank Account not updated.');
        return false;
      });
    }

    function cancelEdit(){
      vm.bankAccount = {};
      refreshBankAccountList();
      StateService.goToState('bank-accounts');
    }

    function deleteBankAccount(bankAccount){
      var modalOptions = {
        headerText: 'Delete this Bank Account?',
        bodyText: 'Are you sure you want to delete the Bank Account: ' + bankAccount.name+ '?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }

      ModalService.show(modalOptions).then(function(){

        bankAccount.remove().then(function(){
          refreshBankAccountList();
          MessageService.setMessage('Bank Account deleted.');

        }).catch(function(){
          MessageService.setErrorMessage('Error deleting.');
        });

      },function(){
        MessageService.setErrorMessage('Delete cancelled.'); // cancel clicked
      });

    }
  }
})();

;
(function(){
  'use strict';

  angular
    .module('everycent.bank-accounts')
    .factory('BankAccountsService', BankAccountsService);

    BankAccountsService.$inject = ['$http', 'Restangular'];
    function BankAccountsService($http, Restangular){
      var service = {
        getBankAccounts: getBankAccounts,
        addBankAccount: addBankAccount
      }

      var baseAll = Restangular.all('bank_accounts');
      return service;

      function getBankAccounts(){
        return baseAll.getList();
      }

      function addBankAccount(bankAccount){
        return baseAll.post(bankAccount);
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
        error:'=',
        name:'=fieldName'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    }
    return directive;
  }


  controller.$inject = ['LookupService'];
  function controller(LookupService){
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
  'use strict';

  angular
    .module('everycent.common')
    .factory('LookupService', LookupService);

  LookupService.$inject = ['Restangular'];
  function LookupService(Restangular){
    var service = {
      refreshList: refreshList
    };
    return service;

    function refreshList(list){
      return Restangular.all(list).getList();
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

;

(function(){
  'use strict';

  angular
    .module('everycent.institutions')
    .controller('InstitutionsCtrl', InstitutionsCtrl);

  InstitutionsCtrl.$inject = ['MessageService', 'InstitutionsService', 'ModalService', 'FormService', 'StateService'];

  function InstitutionsCtrl(MessageService, InstitutionsService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.institution = {};
    vm.institutions = [];
    vm.addInstitution = addInstitution;
    vm.selectInstitutionForUpdate = selectInstitutionForUpdate;
    vm.updateInstitution = updateInstitution;
    vm.cancelEdit = cancelEdit;
    vm.deleteInstitution = deleteInstitution;

    activate();

    function activate(){
      refreshInstitutionList();
    }

    function refreshInstitutionList(){
      InstitutionsService.getInstitutions().then(function(institutions){
        vm.institutions = institutions;
      });
    }

    function addInstitution(institution, form){
      InstitutionsService.addInstitution(institution).then(function(response){
        refreshInstitutionList();
        MessageService.setMessage('Institution "' + institution.name + '" added successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(institution, form, ['name']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Institution not saved.');
        return false;
      });
    }

    function selectInstitutionForUpdate(institution){
      vm.institution = institution;
      StateService.goToState('institutions.edit');
    }

    function updateInstitution(institution, form){
      institution.save().then(function(response){
        refreshInstitutionList();
        MessageService.setMessage('Institution "' + institution.name + '" updated successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(institution, form, ['name']);
        vm.institution = {};
        StateService.goToState('institutions');

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Institution not updated.');
        return false;
      });
    }

    function cancelEdit(){
      vm.institution = {};
      refreshInstitutionList();
      StateService.goToState('institutions');
    }

    function deleteInstitution(institution){
      var modalOptions = {
        headerText: 'Delete this institution?',
        bodyText: 'Are you sure you want to delete the institution: ' + institution.name+ '?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }

      ModalService.show(modalOptions).then(function(){

        institution.remove().then(function(){
          refreshInstitutionList();
          MessageService.setMessage('Institution deleted.');

        }).catch(function(){
          MessageService.setErrorMessage('Error deleting.');
        });

      },function(){
        MessageService.setErrorMessage('Delete cancelled.'); // cancel clicked
      });

    }
  }
})();

;
(function(){
  'use strict';

  angular
    .module('everycent.institutions')
    .factory('InstitutionsService', InstitutionsService);

    InstitutionsService.$inject = ['$http', 'Restangular'];
    function InstitutionsService($http, Restangular){
      var service = {
        getInstitutions: getInstitutions,
        addInstitution: addInstitution
      }

      var baseAll = Restangular.all('institutions');
      return service;

      function getInstitutions(){
        return baseAll.getList();
      }

      function addInstitution(institution){
        return baseAll.post(institution);
      }
    }
})();

;

(function(){
  angular
    .module('everycent.menu')
    .directive('ecNavbar', ecNavbar);

  function ecNavbar(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/menu/ec-navbar-directive.html',
      scope: {
        userName: '=',
        currentPage: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    }

    return directive;
  }

  controller.$inject = ['MessageService', '$state'];
  function controller(MessageService, $state){
    var vm = this;

    vm.goToPage = goToPage;
    vm.logout = logout;

    function goToPage(page){
      $state.go(page);
      vm.currentPage = page;
      MessageService.clearMessage();
    }

    function logout(){
      MessageService.setErrorMessage('Logout not yet implemented.');
    }
  }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.recurring-allocations')
    .controller('RecurringAllocationsCtrl', RecurringAllocationsCtrl);

  RecurringAllocationsCtrl.$inject = ['MessageService', 'RecurringAllocationsService', 'ModalService', 'FormService', 'StateService'];

  function RecurringAllocationsCtrl(MessageService, RecurringAllocationsService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.recurringAllocation = {};
    vm.recurringAllocations = [];
    vm.addRecurringAllocation = addRecurringAllocation;
    vm.selectRecurringAllocationForUpdate = selectRecurringAllocationForUpdate;
    vm.updateRecurringAllocation = updateRecurringAllocation;
    vm.cancelEdit = cancelEdit;
    vm.deleteRecurringAllocation = deleteRecurringAllocation;

    activate();

    function activate(){
      refreshRecurringAllocationList();
    }

    function refreshRecurringAllocationList(){
      RecurringAllocationsService.getRecurringAllocations().then(function(recurringAllocations){
        vm.recurringAllocations = recurringAllocations;
      });
    }

    function addRecurringAllocation(recurringAllocation, form){
      RecurringAllocationsService.addRecurringAllocation(recurringAllocation).then(function(response){
        refreshRecurringAllocationList();
        MessageService.setMessage('Recurring Allocation "' + recurringAllocation.name + '" added successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(recurringAllocation, form,
          ['name', 'amount', 'bank_account_id']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Recurring Allocation not saved.');
        return false;
      });
    }

    function selectRecurringAllocationForUpdate(recurringAllocation){
      vm.recurringAllocation = recurringAllocation;
      StateService.goToState('recurring-allocations.edit');
    }

    function updateRecurringAllocation(recurringAllocation, form){
      recurringAllocation.save().then(function(response){
        refreshRecurringAllocationList();
        MessageService.setMessage('Recurring Allocation "' + recurringAllocation.name + '" updated successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(recurringAllocation, form, ['name', 'account_type', 'institution_id', 'account_no', 'opening_balance' ]);
        vm.recurringAllocation = {};
        StateService.goToState('recurring-allocations');

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Recurring Allocation not updated.');
        return false;
      });
    }

    function cancelEdit(){
      vm.recurringAllocation = {};
      refreshRecurringAllocationList();
      StateService.goToState('recurring-allocations');
    }

    function deleteRecurringAllocation(recurringAllocation){
      var modalOptions = {
        headerText: 'Delete this Recurring Allocation?',
        bodyText: 'Are you sure you want to delete the Recurring Allocation: ' + recurringAllocation.name+ '?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }

      ModalService.show(modalOptions).then(function(){

        recurringAllocation.remove().then(function(){
          refreshRecurringAllocationList();
          MessageService.setMessage('Recurring Allocation deleted.');

        }).catch(function(){
          MessageService.setErrorMessage('Error deleting.');
        });

      },function(){
        MessageService.setErrorMessage('Delete cancelled.'); // cancel clicked
      });

    }
  }
})();

;
(function(){
  'use strict';

  angular
    .module('everycent.recurring-allocations')
    .factory('RecurringAllocationsService', RecurringAllocationsService);

    RecurringAllocationsService.$inject = ['$http', 'Restangular'];
    function RecurringAllocationsService($http, Restangular){
      var service = {
        getRecurringAllocations: getRecurringAllocations,
        addRecurringAllocation: addRecurringAllocation
      }

      var baseAll = Restangular.all('recurring_allocations');
      return service;

      function getRecurringAllocations(){
        return baseAll.getList();
      }

      function addRecurringAllocation(recurringAllocation){
        return baseAll.post(recurringAllocation);
      }
    }
})();

;

(function(){
  'use strict';

  angular
    .module('everycent.recurring-incomes')
    .controller('RecurringIncomesCtrl', RecurringIncomesCtrl);

  RecurringIncomesCtrl.$inject = ['MessageService', 'RecurringIncomesService', 'ModalService', 'FormService', 'StateService'];

  function RecurringIncomesCtrl(MessageService, RecurringIncomesService, ModalService, FormService, StateService){
    var vm = this;
    vm.state = StateService; // page state handler
    vm.recurringIncome = {};
    vm.recurringIncomes = [];
    vm.addRecurringIncome = addRecurringIncome;
    vm.selectRecurringIncomeForUpdate = selectRecurringIncomeForUpdate;
    vm.updateRecurringIncome = updateRecurringIncome;
    vm.cancelEdit = cancelEdit;
    vm.deleteRecurringIncome = deleteRecurringIncome;

    activate();

    function activate(){
      refreshRecurringIncomeList();
    }

    function refreshRecurringIncomeList(){
      RecurringIncomesService.getRecurringIncomes().then(function(recurringIncomes){
        vm.recurringIncomes = recurringIncomes;
      });
    }

    function addRecurringIncome(recurringIncome, form){
      RecurringIncomesService.addRecurringIncome(recurringIncome).then(function(response){
        refreshRecurringIncomeList();
        MessageService.setMessage('Recurring Income "' + recurringIncome.name + '" added successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(recurringIncome, form,
          ['name', 'amount', 'bank_account_id']);

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Recurring Income not saved.');
        return false;
      });
    }

    function selectRecurringIncomeForUpdate(recurringIncome){
      vm.recurringIncome = recurringIncome;
      StateService.goToState('recurring-incomes.edit');
    }

    function updateRecurringIncome(recurringIncome, form){
      recurringIncome.save().then(function(response){
        refreshRecurringIncomeList();
        MessageService.setMessage('Recurring Income "' + recurringIncome.name + '" updated successfully.');
        // TODO:  hack - need to find a better way of clearing the name
        FormService.resetForm(recurringIncome, form, ['name', 'account_type', 'institution_id', 'account_no', 'opening_balance' ]);
        vm.recurringIncome = {};
        StateService.goToState('recurring-incomes');

      }, function(errorResponse){
        FormService.setErrors(form, errorResponse.data);
        MessageService.setErrorMessage('Recurring Income not updated.');
        return false;
      });
    }

    function cancelEdit(){
      vm.recurringIncome = {};
      refreshRecurringIncomeList();
      StateService.goToState('recurring-incomes');
    }

    function deleteRecurringIncome(recurringIncome){
      var modalOptions = {
        headerText: 'Delete this Recurring Income?',
        bodyText: 'Are you sure you want to delete the Recurring Income: ' + recurringIncome.name+ '?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }

      ModalService.show(modalOptions).then(function(){

        recurringIncome.remove().then(function(){
          refreshRecurringIncomeList();
          MessageService.setMessage('Recurring Income deleted.');

        }).catch(function(){
          MessageService.setErrorMessage('Error deleting.');
        });

      },function(){
        MessageService.setErrorMessage('Delete cancelled.'); // cancel clicked
      });

    }
  }
})();

;
(function(){
  'use strict';

  angular
    .module('everycent.recurring-incomes')
    .factory('RecurringIncomesService', RecurringIncomesService);

    RecurringIncomesService.$inject = ['$http', 'Restangular'];
    function RecurringIncomesService($http, Restangular){
      var service = {
        getRecurringIncomes: getRecurringIncomes,
        addRecurringIncome: addRecurringIncome
      }

      var baseAll = Restangular.all('recurring_incomes');
      return service;

      function getRecurringIncomes(){
        return baseAll.getList();
      }

      function addRecurringIncome(recurringIncome){
        return baseAll.post(recurringIncome);
      }
    }
})();

;
(function(){
  'use strict';

  angular
    .module('everycent.security')
    .controller('SignInCtrl', SignInCtrl);

    SignInCtrl.$inject = ['$auth', '$state', 'MessageService'];

    function SignInCtrl($auth, $state, MessageService){
      var vm = this;

      vm.signIn = signIn;

      function signIn(params){
        $auth.submitLogin(params).then(function(response){

            MessageService.setMessage('Logged in successfully.');
            $state.go('institutions');

          }).catch(function(response){

            MessageService.setErrorMessage('Invalid login');
            if(response.data && response.data.errors){
              MessageService.setErrorMessage(response.data.errors[0]);
            }

            return true; // handled the error, so return true
        });
      }

    }
})();
