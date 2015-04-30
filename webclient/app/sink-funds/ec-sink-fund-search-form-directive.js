
(function(){
  angular
    .module('everycent.sink-funds')
    .directive('ecSinkFundSearchForm', ecSinkFundSearchForm);

  function ecSinkFundSearchForm(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/sink-funds/ec-sink-fund-search-form-directive.html',
      scope: {
        search: '=searchOptions',
        onSubmit: '&'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['LookupService', 'ReferenceService', '$q', 'StateService', '$location'];
  function controller(LookupService, ReferenceService, $q, StateService, $location){
    var vm = this;
    vm.ref = ReferenceService;

    vm.onParamChange = onParamChange;

    activate();

    function activate(){
      var accountPromise =LookupService.refreshList('sink_funds').then(function(items){
        vm.sink_funds = items;

        setInitialSearchParams();
        vm.onSubmit();
      });
    }

    function setInitialSearchParams(){

      var initialSinkFund = getInitialSinkFund();
      vm.search.sink_fund = initialSinkFund;
      vm.search.sink_fund_id = initialSinkFund.id;
    }

    function getInitialSinkFund(){
      var searchParamsSinkFund = vm.sink_funds.filter(function(account){
        return Number(account.id) === Number(StateService.getParam('sink_fund'));
      })[0];

      if(searchParamsSinkFund){
        return searchParamsSinkFund;
      }else{
        return vm.sink_funds[0];
      }
    }

    function onParamChange(param){
      vm.ref.updateReferenceId(vm.search, param);

      // IMPORTANT: note that this bypasses $stateParams,
      // so when doing this, the state params will NOT be up to date
      // unless the user refreshes their browser
      $location.search({sink_fund: vm.search.sink_fund_id});
      vm.onSubmit();
    }
  }
})();
