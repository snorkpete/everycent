
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecTransactionListActionsPanel', ecTransactionListActionsPanel);

  function ecTransactionListActionsPanel(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/transactions/ec-transaction-list-actions-panel-directive.html',
      scope: {
        transactions: '=',
        isEditMode: '=',
        onSave: '&',
        onCancel: '&',
        originalTransactions: '=',
        search: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['TransactionsService', 'MessageService'];
  function controller(TransactionsService, MessageService){
    var vm = this;
    vm.search = {};

    vm.switchToEditMode = switchToEditMode;
    vm.addTransaction = addTransaction;
    vm.saveChanges = saveChanges;
    vm.cancelEdit = cancelEdit;
    vm.defaultAllocations = defaultAllocations;

    activate();

    function activate(){
    }

    function switchToEditMode(){
      vm.isEditMode = true;
    }

    function addTransaction(){
      var newTransaction = TransactionsService.newTransaction();
      vm.transactions.push(newTransaction);
    }


    function saveChanges(){
      TransactionsService.save(vm.transactions, vm.search).then(function(){
        return vm.onSave();
      })
      .then(function(){
        MessageService.setMessage('Transaction changes saved.');
        switchToEditMode();
      })
      .catch(function(){
        MessageService.setErrorMessage('Changes NOT saved.');
      });
    }

    function cancelEdit(){
      vm.isEditMode = false;
      vm.onCancel();
    }

    function defaultAllocations(){
      var transactions = TransactionsService.getValidTransactions(vm.transactions, vm.search);
      var payeeCodes = transactions.map(function(transaction){

        // use the bank charges payee for the $0.75 and $4.00 fees
        if(transaction.withdrawal_amount == 75 || transaction.withdrawal_amount == 400){
          return { code: 'BANKCHARGES' };
        }
        return { code: transaction.payee_code };
      });

      TransactionsService.getDefaultAllocations(vm.search.budget_id, payeeCodes).then(function(defaultAllocations){
        // first convert the allocations to a hash
        // ---------------------------------------
        var allocationMap = {};
        vm.allocations.forEach(function(allocation){
          allocationMap[allocation.id] = allocation;
        });

        // then assign each allocation & allocation id based on the default allocations
        // but only assign the allocation if its currently unassigned
        // ----------------------------------------------------------------------------
        for(var i=0; i < transactions.length; i++){

          // skip if there's already a valid allocation
          // ------------------------------------------
          if(transactions[i].allocation_id > 0){
            continue;
          }

          // TODO: disabled - don't want this behaviour
          // skip if the user already selected allocation_name=(none)
          // --------------------------------------------------------
          //if(transactions[i].allocation &&
          //   transactions[i].allocation.name === '(none)'){
          //  continue;
          //}

          // assign the allocation
          // ---------------------
          var allocationId = defaultAllocations[i].allocation_id;
          transactions[i].allocation = allocationMap[allocationId];
          transactions[i].allocation_id = allocationId;
        }

      });
    }


  } // end of controller
})();

