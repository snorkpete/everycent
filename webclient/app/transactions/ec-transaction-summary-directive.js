
(function(){
  angular
    .module('everycent.transactions')
    .directive('ecTransactionSummary', ecTransactionSummary);

  function ecTransactionSummary(){
    var directive = {
      restrict:'E',
      templateUrl: 'app/transactions/ec-transaction-summary-directive.html',
      scope: {
        bankAccount: '=',
        transactions: '=',
        allocations: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['SettingsService', 'UtilService'];
  function controller(SettingsService, UtilService){
    var vm = this;

    vm.util = UtilService;

    vm.lastBankBalance = lastBankBalance;
    vm.transactionTotal = transactionTotal;
    vm.currentBankBalance = currentBankBalance;

    vm.showBudgetBalance = showBudgetBalance;
    vm.lastBudgetBalance = lastBudgetBalance;
    vm.currentBudgetBalance = currentBudgetBalance;
    vm.budgetDifference = budgetDifference;

    vm.showUnpaidBalance = showUnpaidBalance;
    vm.unpaidBalance = unpaidBalance;
    vm.unpaidDifference = unpaidDifference;

    activate();

    function activate(){
      SettingsService.getSettings().then(function(settings){
        vm.primary_budget_account_id = settings.primary_budget_account_id;
      });
    }

    function lastBankBalance(){
      if(!vm.bankAccount){
        return 0;
      }
      return vm.bankAccount.closing_balance;
    }

    function transactionTotal(){
      if(!vm.transactions){
        return 0;
      }

      var totalWithdrawals = 0;
      var totalDeposits = 0;

      vm.transactions.forEach(function(transaction){
        if(!transaction.deleted){
          totalWithdrawals += transaction.withdrawal_amount;
          totalDeposits += transaction.deposit_amount;
        }
      });

      return totalDeposits - totalWithdrawals;
    }

    function currentBankBalance(){
      return lastBankBalance() + transactionTotal();
    }

    function showBudgetBalance(){
      if(!vm.bankAccount){
        return false;
      }
      return vm.bankAccount.id === vm.primary_budget_account_id;
    }

    function lastBudgetBalance(){
      return vm.util.total(vm.allocations, 'amount') - vm.util.total(vm.allocations, 'spent');
    }

    function currentBudgetBalance(){
      return lastBudgetBalance();
    }

    function budgetDifference(){
      return currentBankBalance() - currentBudgetBalance();
    }

    function showUnpaidBalance(){
      if(!vm.bankAccount){
        return false;
      }

      return vm.bankAccount.account_type === 'credit_card';
    }

    function unpaidBalance(){
      if(!vm.transactions){
        return 0;
      }

      var unpaidTransactions = vm.transactions.filter(function(transaction){
        return !transaction.paid;
      });

      return vm.util.total(unpaidTransactions, 'net_amount');
    }

    function unpaidDifference(){
      return currentBankBalance() - unpaidBalance();
    }

  } // end of controller

})();
