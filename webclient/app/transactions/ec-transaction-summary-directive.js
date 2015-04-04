
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
        transactions: '='
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;
  }

  controller.$inject = ['UtilService'];
  function controller(UtilService){
    var vm = this;

    vm.lastBankBalance = lastBankBalance;
    vm.transactionTotal = transactionTotal;
    vm.currentBankBalance = currentBankBalance;

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
  }
})();
